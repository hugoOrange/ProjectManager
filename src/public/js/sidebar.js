var sidebarElement = (function () {
    const departmentNameMap = {
        0: "NQA",
        1: "COPS"
    };
    const DELAY_TIME = 2;
    var firstInit = true;
    var tableId = "";
    var pagePath = "";

    var genTable = (departmentId, needInit = true, callback) => {
        tableOperation.initTable(tableId);
        $("#project_overview").hide();
        serverIO.queryDepartmentProject(departmentId, (data) => {
            var managerList = {};
            var con = data.ret_con;
            if (con.length === 0) {
                $("#no_project").show();
            } else {
                $("#no_project").hide();
            }
            
            for (let i = 0; i < con.length; i++) {
                if (managerList[con[i].userId] === undefined) {
                    managerList[con[i].userId] = [];
                }
                managerList[con[i].userId].push({
                    projectName: con[i].projectName,
                    projectId: con[i].projectId,
                    username: con[i].username
                });
            }

            if (needInit) {
                sidebarElement.initDepartment(managerList);
            }
            tableOperation.addProjects(con, $("#manager_mission"));
            tableOperation.statusSet(tableId);
            tableOperation.progressSet(tableId);
            tableOperation.prioritySet(tableId);
            tableOperation.changeInWatchMode(tableId);
            sidebarElement.loadAlarm(DELAY_TIME);
            $(".floatBtn").show();
            $("#manager_confirm").hide();
            $("#alarmShow_btn").show();
            $("#alarmShow_area").show();

            setTimeout(() => {
                $("#alarmShow_area").animate({
                    transfrom: "scale(0)"
                }, 300);
                $("#alarmShow_area").hide();
            }, 1000);

            if (callback !== undefined) {
                callback();
            }
        });
    };


    var shrinkEvent = event => {
        var sidebarWid = parseFloat($("#manager_sidebar").css("width")) + 40 + "px";

        if ($(event.target).css("left") === "0px") {
            // show
            $(event.target).css("left", sidebarWid);
            $("#manager_sidebar_shrink_mask").css("left", sidebarWid);
            $("#manager_sidebar").css("left", "0px");
        } else {
            // shrink
            $(event.target).css("left", "0px");
            $("#manager_sidebar_shrink_mask").css("left", "0px");
            $("#manager_sidebar").css("left", "-" + sidebarWid);
        }
    };

    var clickDepartment = (event) => {
        sidebarElement.jumpDepartment(event.target.dataset.id, true);
        event.stopPropagation();
    };

    var clickManager = (event) => {
        var departmentId = $(".manager-sidebar-departmentChoose").attr("data-id");
        var managerId = event.target.dataset.id;
        if ($("#" + tableId).is(":hidden")) {
            sidebarElement.jumpManager(departmentId, managerId, true);
        } else {
            sidebarElement.jumpManager(departmentId, managerId, false);
        }
        event.stopPropagation();
    };

    var clickProject = event => {
        var departmentId = $(".manager-sidebar-departmentChoose").attr("data-id");
        var managerId = event.target.parentNode.parentNode.previousSibling.dataset.id;
        var projectId = event.target.dataset.id;
        sidebarElement.jumpProject(departmentId, managerId, projectId, false);
    };

    var clickAlarm = event => {
        let area = $("#alarmShow_area");
        if (area.is(":hidden")) {
            // need show
            area.show();
        } else {
            // need hide
            area.hide();
        }
    };

    return {
        initContainer: (containerId, tId) => {
            var container = $("#" + containerId);
            tableId = tId;

            container.empty().append("<div id='manager_sidebar_navbar'></div>").append($("<div id='manager_sidebar_content'></div>").append("<ul id='manager_sidebar_content_manager'></ul>"))
                .append("<div id='manager_sidebar_shrink_mask'></div>").append($("<button id='manager_sidebar_shrink'></button>").click(shrinkEvent));
            
            if (firstInit) {
                $(document.body).append($("<div id='alarmShow_area'></div>").append("<h2>加急项目<br>（土黄色为延期项目，红色为已过期项目）</h2>").append("<ul></ul>").hide())
                    .append($("<button id='alarmShow_btn' class='alarmShow-tip' data-maydelay='0' data-delay='0'></button>").click(clickAlarm).hide());
            }
        },

        addDepartment: (departmentId, isFocus = false) => {
            $("#manager_sidebar_navbar").append($(`<button>${departmentNameMap[departmentId]}</button>`)
                .addClass("manager-sidebar-department").addClass(isFocus ? "manager-sidebar-departmentChoose" : "").attr("data-id", departmentId).click(clickDepartment));
        },

        initDepartment: (managerList) => {
            var departmentContainer = $("#manager_sidebar_content_manager");
            var managerPart = null;

            departmentContainer.empty();
            if (managerList === undefined) {
                console.warn("Empty manager list");
                return;
            }
            for (const userId in managerList) {
                if (managerList.hasOwnProperty(userId)) {
                    managerPart = null;
                    managerPart = $("<ul class='manager-sidebar-content-project'></ul>").css("height", "0");
                    for (let i = 0; i < managerList[userId].length; i++) {
                        if (managerList[userId][i].projectId) {                            
                            managerPart.append($("<li></li>").append($(`<button>${managerList[userId][i].projectName}</button>`)
                                .attr("data-id", managerList[userId][i].projectId).addClass("manager-sidebar-content-projectCell").click(clickProject)));
                        }
                    }
                    departmentContainer.append($("<li></li>").append($(`<button>${managerList[userId][0].username}</button>`)
                        .attr("data-id", userId).addClass("manager-sidebar-content-managerCell").addClass("left-triangle").click(clickManager)).append(managerPart));
                }
            }
        },


        loadAlarm: (delay) => {
            var container = $("#alarmShow_area ul");
            var delaySet = tableOperation.getDelay(tableId, delay);
            var btnEvent = event => {
                tableOperation.lineStickTop(tableId, event.target.dataset.id);
                event.stopPropagation();
            }

            container.empty();
            for (let i = 0; i < delaySet.isDelay.length; i++) {
                container.append($("<li></li>")
                    .append($(`<button>${delaySet.isDelay[i].pName}/${delaySet.isDelay[i].mName}</button>`)
                    .attr("data-id", delaySet.isDelay[i].id).attr("title", delaySet.isDelay[i].pName + "/" + delaySet.isDelay[i].mName).addClass("delay-project").click(btnEvent)));
            }
            for (let i = 0; i < delaySet.mayDelay.length; i++) {
                container.append($("<li></li>")
                    .append($(`<button>${delaySet.mayDelay[i].pName}/${delaySet.mayDelay[i].mName}</button>`)
                    .attr("data-id", delaySet.mayDelay[i].id).attr("title", delaySet.mayDelay[i].pName + delaySet.mayDelay[i].mName).addClass("mayDelay-project").click(btnEvent)));
            }

            if (delaySet.mayDelay.length + delaySet.isDelay.length === 0) {
                container.append("<li><p>未有将到期项目</p></li>");
                $("#alarmShow_btn").removeClass("alarmShow-tip");
            } else {
                $("#alarmShow_btn").addClass("alarmShow-tip");
                document.querySelector("#alarmShow_btn").dataset.maydelay = delaySet.mayDelay.length;
                document.querySelector("#alarmShow_btn").dataset.delay = delaySet.isDelay.length;
            }
        },

        jumpDepartment: (departmentId, needInit) => {
            $(".manager-sidebar-departmentChoose").removeClass("manager-sidebar-departmentChoose");
            $(".manager-sidebar-department").filter((i, v) => v.dataset.id === departmentId).addClass("manager-sidebar-departmentChoose");
            pagePath = "/department/" + departmentId;

            genTable(departmentId, needInit);
        },

        jumpManager: (departmentId, managerId, needInit, changeState = true, callback = () => {}) => {
            var mList = [];
            var managerEle = $(".manager-sidebar-content-managerCell").filter((i, v) => v.dataset.id === managerId);
            pagePath = "/department/" + departmentId + "/manager/" + managerId; // private attribute
            $("#project_overview").hide();
            
            if (changeState) {
                if (managerEle.hasClass("down-triangle")) {
                    managerEle.removeClass("down-triangle");
                    managerEle.next().css("height", "0");
                } else {
                    managerEle.addClass("down-triangle");
                    managerEle.next().css("height", "auto");
                }
            }

            managerEle.next().children("li").each((i, v) => {
                mList.push(v.childNodes[0].dataset.id);
            });
            if (needInit) {
                genTable(departmentId, false, () => {
                    tableOperation.filtLine("manager_mission", function(val) {
                        return mList.indexOf(val.dataset.id) === -1;
                    });
                    callback();
                });
            } else {
                tableOperation.filtLine("manager_mission", function(val) {
                    return mList.indexOf(val.dataset.id) === -1;
                });
                callback();
            }
        },

        jumpProject: (departmentId, managerId, projectId, needInit) => {
            sidebarElement.jumpManager(departmentId, managerId, needInit, false, () => {
                pagePath = "/department/" + departmentId + "/manager/" + managerId + "/project/" + projectId;
                tableOperation.filtLine("manager_mission", function(val) {
                    return +val.dataset.id !== +projectId;
                });
            });    
        },

        getCurrentState: () => pagePath
    }
})();