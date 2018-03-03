var sidebarElement = (function () {
    const departmentNameMap = {
        0: "NQA",
        1: "COPS"
    };
    const DELAY_TIME = 2;
    var firstInit = true;
    var tableId = "";

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

    var clickDepartment = event => {
        event.stopPropagation();
        var departmentId = event.target.dataset.id;
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
                if (managerList[con[i].projectManager] === undefined) {
                    managerList[con[i].projectManager] = [];
                }
                managerList[con[i].projectManager].push({
                    projectName: con[i].projectName,
                    projectId: con[i].projectId,
                    userId: con[i].userId
                });
            }

            sidebarElement.initDepartment(managerList);
            tableOperation.addProjects(con, $("#manager_mission"));
            tableOperation.statusSet(tableId);
            tableOperation.progressSet(tableId);
            tableOperation.prioritySet(tableId);
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
        });
    };

    var clickManager = event => {
        if (event.target.classList.contains("down-triangle")) {
            event.target.classList.remove("down-triangle");
            event.target.nextSibling.style.height = "0";
        } else {
            event.target.classList.add("down-triangle");
            event.target.nextSibling.style.height = "auto";
        }
    };

    var clickProject = event => {
        var projectId = event.target.dataset.id;
        tableOperation.filtLine("manager_mission", val => val.dataset.id !== projectId);
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
                $(document.body).append($("<div id='alarmShow_area'></div>").append("<h2>加急项目</h2>").append("<ul></ul>").hide())
                    .append($("<button id='alarmShow_btn' class='alarmShow-tip' data-maydelay='0' data-delay='0'></button>").click(clickAlarm).hide());
            }
        },

        addDepartment: (departmentId) => {
            $("#manager_sidebar_navbar").append($(`<button class='manager-sidebar-department' data-id='${departmentId}'>${departmentNameMap[departmentId]}</button>`).click(clickDepartment));
        },

        initDepartment: (managerList) => {
            var departmentContainer = $("#manager_sidebar_content_manager");
            var managerPart = null;

            departmentContainer.empty();
            if (managerList === undefined) {
                console.warn("Empty manager list");
                return;
            }
            for (const projectManager in managerList) {
                if (managerList.hasOwnProperty(projectManager)) {
                    managerPart = null;
                    managerPart = $("<ul class='manager-sidebar-content-project'></ul>").css("height", "0");
                    for (let i = 0; i < managerList[projectManager].length; i++) {
                        managerPart.append($("<li></li>").append($(`<button>${managerList[projectManager][i].projectName}</button>`).addClass("manager-sidebar-content-projectCell").attr("data-id", managerList[projectManager][i].projectId).click(clickProject)));
                    }
                    departmentContainer.append($("<li></li>").append($(`<button>${projectManager}</button>`)
                        .attr("data-id", managerList[projectManager].userId).addClass("manager-sidebar-content-managerCell").addClass("left-triangle").click(clickManager)).append(managerPart));
                }
            }
        },


        loadAlarm: (delay) => {
            var container = $("#alarmShow_area ul");
            var delaySet = tableOperation.getDelay(tableId, delay);
            var btnEvent = event => {
                tableOperation.lineStickTop(tableId, event.target.dataset.id);
            }

            container.empty();
            for (let i = 0; i < delaySet.isDelay.length; i++) {
                container.append($("<li></li>")
                    .append($(`<button data-id="${delaySet.isDelay[i].pId}" title="${delaySet.isDelay[i].pName}/${delaySet.isDelay[i].mName}" class="delay-project">${delaySet.isDelay[i].pName}/${delaySet.isDelay[i].mName}</button>`).click(btnEvent)));
            }
            for (let i = 0; i < delaySet.mayDelay.length; i++) {
                container.append($("<li></li>")
                    .append($(`<button data-id="${delaySet.mayDelay[i].pId}" title="${delaySet.mayDelay[i].pName}/${delaySet.mayDelay[i].mName}" class="mayDelay-project">${delaySet.mayDelay[i].pName}/${delaySet.mayDelay[i].mName}</button>`).click(btnEvent)));
            }

            if (delaySet.mayDelay.length + delaySet.isDelay.length === 0) {
                container.append("<li><p>未有将到期项目</p></li>");
                $("#alarmShow_btn").removeClass("alarmShow-tip");
            } else {
                $("#alarmShow_btn").addClass("alarmShow-tip");
                document.querySelector("#alarmShow_btn").dataset.maydelay = delaySet.mayDelay.length;
                document.querySelector("#alarmShow_btn").dataset.delay = delaySet.isDelay.length;
            }
        }
    }
})();