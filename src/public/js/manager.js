$(document).ready(() => {
    /** value and useful function define */

    var socket = io();
    var table_current_state = "normal";
    const confirmDialog = {
        getOp: (dialog) => {
            return dialog.slice(2, 4);
        },

        addProject: {
            txt: "确认添加新的项目吗？",
            op: "添加",
        },
        changeProject: {
            txt: "确认保存修改吗？",
            op: "保存"
        },
        finishProject: {
            txt: "确认这些项目已完成吗?",
            op: "这些"
        },
        deleteProject: {
            txt: "确认删除这些项目吗？",
            op: "删除"
        },

        updateProject: {
            txt: "有人更新了界面,点击确定将刷新当前界面,取消将把更新载入当前界面",
            op: "更新"
        }
    };
    // record project attribute changes, it should be asigned after query projects
    var valueChangeRecordObj = null;
    function valueChangeRecord(changeRecord) {
        var changeRecord = {};
        var changeProjectId = -1;

        $("#manager_mission tr").each((index, val) => {
            if (index > 1) {
                $(val).children("td").each((i, v) => {
                    // attention: there exists all attribute except projectProgress
                    if (i === 0) {
                        // projectStatus
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["projectStatus"] = $(event.target).val();
                        });
                    } else if (i === 1) {
                        // projectName
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["projectName"] = $(event.target).val();
                        });
                    } else if (i === 2) {
                        // projectTarget
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["projectTarget"] = $(event.target).val() || ".";
                        });
                    } else if (i === 3) {
                        // projectManager
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["projectManager"] = $(event.target).val();
                        });
                    } else if (i === 4) {
                        // deadline
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["deadline"] = $(event.target).val() || getNowDateFixed(10);
                        });
                    } else if (i === 6) {
                        // priority
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["priority"] = $(event.target).val();
                        });
                    }
                });
            }
        });

        return {
            getChangeRecord: function () {
                return changeRecord;
            }
        }
    };


    function initManagerSide(type) {
        if (type === "projectName") {
            serverIO.queryAllProjectName(nameList => {
                $("#manager_sidebar_content ul").empty();
                nameList.ret_con.unshift("全部");
                for (let i = 0; i < nameList.ret_con.length; i++) {
                    $("#manager_sidebar_content ul").append($('<li></li>')
                        .append($(`<button title="${nameList.ret_con[i]}">${nameList.ret_con[i]}</button>`)
                            .click(function (event) {
                                var projectName = $(event.target).text();
                                tableOperation.filtLine(val => $(val).children("td").eq(1).children(".project-watch-mode").text() !== projectName && projectName !== "全部")
                            })
                        ));
                }
            });
        } else if (type === "projectManager") {
            serverIO.queryAllManagerName(nameList => {
                $("#manager_sidebar_content ul").empty();
                nameList.ret_con.unshift("全部");
                for (let i = 0; i < nameList.ret_con.length; i++) {
                    $("#manager_sidebar_content ul").append($('<li></li>')
                        .append($(`<button title="${nameList.ret_con[i]}">${nameList.ret_con[i]}</button>`)
                            .click(function (event) {
                                var managerName = $(event.target).text();
                                tableOperation.filtLine(val => $(val).children("td").eq(3).children(".project-watch-mode").text() !== managerName && managerName !== "全部");
                            })
                        ));
                }
            });            
        }
    }


    function getNowDateFixed (bit = 10, offset = 0) {
        var day = new Date();
        var nextDay = new Date(day);
        nextDay.setDate(day.getDate() + offset);
        return nextDay.toISOString().slice(0, bit);
    }

    function tableEleSet() {
        tableOperation.statusSet("manager_mission");
        tableOperation.progressSet("manager_mission");
        tableOperation.prioritySet("manager_mission");
        loadAlarm(DELAY_TIME);
        valueChangeRecordObj = valueChangeRecord();
    }

    function resetStatus() {
        $("#confirm_alert").hide();
        $("#mask_layer").hide();

        $("#manager_mission_edit").hide();
        $("#manager_confirm").hide();
        tableOperation.changeInWatchMode("manager_mission");
        $("#choose_all").hide();
        $(".choose-part").hide();
        tableOperation.chooseZeroDelete();
        
        $("#new_projectName").val();
        $("#new_projectTarget").val();
        $("#new_projectManager").val();
        progressElement.createProgressInput(document.querySelector("#new_projectProgress"));

        $("#no_project").hide();
    }



    /** run when page load 
     * load order:
     * department overview -> manager and their projects
     * when click sidebar manager load manager's project list
     */

    serverIO.queryAllOverView((data) => {
        overviewElement.initContainer("project_overview")
        overviewElement.addDepartment("project_overview", "0");
        overviewElement.addDepartment("project_overview", "1");

        overviewElement.initDepartment("project_overview", "0", data.ret_overview["0"], data.ret_manager["0"]);
        overviewElement.initDepartment("project_overview", "1", data.ret_overview["1"], data.ret_manager["1"]);

        sidebarElement.initContainer("manager_sidebar", "manager_mission");
        sidebarElement.addDepartment("0");
        sidebarElement.addDepartment("1");
        sidebarElement.initDepartment("manager_sidebar", data.ret_manager["0"]);
    });

    // serverIO.queryAllProject((data) => {
    //     if (data.ret_con.length === 0) {
    //         $("#no_project").show();
    //     } else {
    //         $("#no_project").hide();
    //     }

    //     tableOperation.addProjects(data.ret_con, $("#manager_mission"));
    //     tableEleSet();

    //     setTimeout(() => {
    //         $("#alarmShow_area").animate({
    //             opacity: 0,
    //             transfrom: "scale(0)"
    //         }, 300);
    //         $("#alarmShow_area").hide();
    //     }, 1000);
    // });

    // progressElement.createProgressInput(document.querySelector("#new_projectProgress"));
    // initManagerSide("projectName");

    socket.on('broadcast', function(comm) {
        if (comm.type === 0) {
            $("#confirm_alert").show().children("p").text(confirmDialog.updateProject.txt);
            $("#mask_layer").show();
            $("#confirm_cancel").data("data", comm);
        }
    });



    /** event bind when page load */
    
    // about sidebar

    $("#manager_sidebar_shrink").click(event => {
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
    });

    $("#manager_projectView").click(event => {
        if ($(event.target).css("fontSize") === "24px") {
            // has been focus
            return;
        }

        $("#manager_projectView").css("fontSize", "24px");
        $("#manager_managerList").css("fontSize", "14px");

        initManagerSide("projectName");
    });

    $("#manager_managerList").click(event => {
        if ($(event.target).css("fontSize") === "24px") {
            // has been focus
            return;
        }

        $("#manager_projectView").css("fontSize", "14px");
        $("#manager_managerList").css("fontSize", "24px");

        initManagerSide("projectManager");
    });

    // about table

    $("#status_sort").click(event => {
        if (event.target.classList.contains("all-arrow")) {
            event.target.classList.remove("all-arrow");
            event.target.classList.add("finish-arrow");
            $(event.target).attr("title", "查看已完成项目");
            tableOperation.filtLine(val => false);
        } else if (event.target.classList.contains("finish-arrow")) {
            event.target.classList.remove("finish-arrow");
            event.target.classList.add("normal-arrow");
            $(event.target).attr("title", "查看正常进度项目");
            tableOperation.filtLine(val => $(val).children("td").eq(0).children(".project-watch-mode").text() !== "已完成");
        } else if (event.target.classList.contains("normal-arrow")) {
            event.target.classList.remove("normal-arrow");
            event.target.classList.add("delay-arrow");
            $(event.target).attr("title", "查看延期项目");
            tableOperation.filtLine(val => $(val).children("td").eq(0).children(".project-watch-mode").text() !== "正常");
        } else if (event.target.classList.contains("delay-arrow")) {
            event.target.classList.remove("delay-arrow");
            event.target.classList.add("all-arrow");
            $(event.target).attr("title", "查看全部项目");
            tableOperation.filtLine(val => $(val).children("td").eq(0).children(".project-watch-mode").text() !== "延期");
        }
    });

    $("#deadline_sort").click(event => {
        if (event.target.classList.contains("top-arrow")) {
            tableOperation.sortLineAccordingVal(4, false);
            event.target.classList.remove("top-arrow");
            event.target.classList.add("bottom-arrow");
        } else {
            tableOperation.sortLineAccordingVal(4, true);
            event.target.classList.remove("bottom-arrow");
            event.target.classList.add("top-arrow");
        }
    });

    $("#priority_sort").click(event => {
        if (event.target.classList.contains("top-arrow")) {
            tableOperation.sortLineAccordingVal(6, false);
            event.target.classList.remove("top-arrow");
            event.target.classList.add("bottom-arrow");
        } else {
            tableOperation.sortLineAccordingVal(6, true);
            event.target.classList.remove("bottom-arrow");
            event.target.classList.add("top-arrow");
        }
    });

    $("#choose_all button").click(event => {
        let btn = $("#choose_all p");
        if ($(btn).text() === "全选") {
            $(btn).text("全不选");
            $(event.target).css("background", "#2568b4");
            tableOperation.chooseAllDelete();
        } else {
            $(btn).text("全选");
            $(event.target).css("background", "#ffffff");
            tableOperation.chooseZeroDelete();
        }
    });

    // the button in the right down cornor

    $("#manager_confirm").click(event => {
        $("body").css({
            // ban scroll
            overflow: "hidden",
            height: "100%"
        });
        $("#mask_layer").show();
        $("#confirm_alert").slideDown();
    });

    $("#manager_add").click(event => {
        if (table_current_state === "add") {
            resetStatus();
            table_current_state = "normal";
            $("#manager_mission_edit").show();
            $("#manager_confirm").show();
        } else {
            resetStatus();
            table_current_state = "add";
            if ($(".project-watch-mode").length === 0) {
                $("#no_project").show();
            }
            $("#manager_mission_edit").hide();
            $("#manager_confirm").hide();
        }
        $("#confirm_alert p").text(confirmDialog.addProject.txt);
    });
    
    $("#manager_edit").click(event => {
        progressElement.resetChangeRecord();
        attributesChangeRecord = {};

        if (table_current_state === "edit") {
            resetStatus();
            table_current_state = "normal";
            tableOperation.changeInEditMode("manager_mission");
            $("#manager_confirm").show();
            if ($(".project-watch-mode").length === 0) {
                $("#no_project").show();
            }
        } else{
            resetStatus();
            table_current_state = "edit";
            tableOperation.changeInWatchMode("manager_mission");
            $("#manager_confirm").hide();
            if ($(".project-watch-mode").length === 0) {
                $("#no_project").show();
            }
        }
        $("#confirm_alert p").text(confirmDialog.changeProject.txt);
    });

    $("#manager_finish").click(event => {
        if (table_current_state === "finish") {
            resetStatus();
            table_current_state = "normal";
            $("#choose_all").hide();
            $(".choose-part").hide();
            $("#manager_confirm").hide();
            if ($(".project-watch-mode").length === 0) {
                $("#no_project").show();
            }
        } else{
            resetStatus();
            table_current_state = "finish";
            $("#choose_all").show();
            $(".choose-part").show();
            $("#manager_confirm").show();
            if ($(".project-watch-mode").length === 0) {
                $("#no_project").show();
            }
        }
        $("#confirm_alert p").text(confirmDialog.finishProject.txt);
    });

    $("#manager_delete").click(event => {
        if (table_current_state === "delete") {
            resetStatus();
            table_current_state = "normal";
            $("#choose_all").hide();
            $(".choose-part").hide();
            $("#manager_confirm").hide();
            if ($(".project-watch-mode").length === 0) {
                $("#no_project").show();
            }
        } else{
            resetStatus();
            table_current_state = "delete";
            $("#choose_all").show();
            $(".choose-part").show();
            $("#manager_confirm").show();
            if ($(".project-watch-mode").length === 0) {
                $("#no_project").show();
            }
        }
        $("#confirm_alert p").text(confirmDialog.deleteProject.txt);
    });

    $("#manager_signout").click(event => {
        serverIO.signoutLogin(() => {
            location.reload();
        });
    });

    $("#alarmShow_btn").click(event => {
        let area = $("#alarmShow_area");
        if (area.css("opacity") === "0") {
            // need show
            area.animate({
                opacity: 1,
                transfrom: "scale(1)"
            }, 500);
            area.show();
        } else {
            // need hide
            area.animate({
                opacity: 0,
                transfrom: "scale(0)"
            }, 500);
            area.hide();
        }
    });

    $("#confirm_ok").click(event => {
        let op = confirmDialog.getOp($("#confirm_alert p").text());
        var chooseProject = [];

        if(op === confirmDialog.addProject.op){
            // add new project
            let status = $("#new_projectStatus").val();
            let name = $("#new_projectName").val();
            let target = $("#new_projectTarget").val() || ".";
            let manager = $("#new_projectManager").val();
            let deadline = $("#new_deadline").val() || getNowDateFixed(10);
            let progressText = progressElement.getProgressInputText(document.querySelector("#new_projectProgress")) ||
                (getNowDateFixed(10) + " - .");
            let priority = $("#new_priority").val();
            var checkFunc = (val, alertStr, errStr, canEmpty = false) => {
                if (val.search(/a/g) !== -1 || !(canEmpty && val !== "")) {
                    alert(alertStr);
                    console.error(errStr);
                    return false;
                }
                return true;
            };

            // data check: name, target, manager, deadline, progress
            if(name.search(/\<|\>/) !== -1 || name.length < 5 || name.length > 31) {
                alert("不规范的项目文件名");
                console.error("Invalid project name");
                return;
            }
            if(manager.search(/\<|\>|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\s/) !== -1 || manager === "" || manager.length > 31) {
                alert("不规范的项目负责人姓名");
                console.error("Invalid project manager name");
                return;
            }

            serverIO.addProject({
                projectStatus: status,
                projectName: name,
                projectTarget: target,
                projectManager: manager,
                deadline: deadline,
                projectProgress: progressText,
                priority: priority
            }, () => {
                location.reload();
            });
        } else if (op === confirmDialog.changeProject.op) {
            let cr = progressElement.getChangeRecord();
            let attributesChangeRecord = valueChangeRecordObj.getChangeRecord();
            let progressChangeId = -1;
            var pStr = "";
            $("#manager_mission tr").each((index, val) => {
                progressChangeId = val.dataset.id;
                if (index > 1 && cr[progressChangeId] !== undefined) {
                    if (attributesChangeRecord[progressChangeId] === undefined) {
                        attributesChangeRecord[progressChangeId] = {};
                    }
                    attributesChangeRecord[progressChangeId]["projectProgress"] = progressElement.getProgressEditText($(val).children("td").eq(5).children(".project-edit-mode"));
                }
            });
            if (Object.keys(attributesChangeRecord).length === 0) {
                $("#mask_layer").hide();
                $("#confirm_alert").slideUp();
            } else {
                serverIO.changeProjects(attributesChangeRecord, (result) => {
                    location.reload();
                });
            }
        } else if (op === confirmDialog.finishProject.op) {
            $(".choose-part input:checked").each((index, val) => {
                chooseProject.push($(val).val());
            });
            serverIO.finishProjects(chooseProject, (data) => {
                location.reload();
            });
        } else if (op === confirmDialog.deleteProject.op) {
            $(".choose-part input:checked").each((index, val) => {
                chooseProject.push($(val).val());
            });
            serverIO.deleteProjects(chooseProject, (data) => {
                location.reload();
            });
        } else if (op === confirmDialog.updateProject) {
            location.reload();
        }
    });

    $("#confirm_cancel").click(event => {
        var changeInfo = null;
        var projectInfo = null;
        
        $("body").css({
            // allow scroll
            overflow: "auto",
            height: ""
        });
        $("#mask_layer").hide();
        $("#confirm_alert").slideUp();

        if (confirmDialog.getOp($("#confirm_alert p").text()) === confirmDialog.updateProject.op) {
            projectInfo = $(event.target).data("data");
            if (!$("#manager_mission_edit").is(":hidden")) {
                // in add project status
                if (projectInfo.op === "add") {
                    tableOperation.addProject(projectInfo.data, $("#manager_mission"));
                } else if (projectInfo.op === "delete") {
                    $("#manager_mission tr").each((index, val) => {
                        if (index > 1) {
                            if (projectInfo.data[val.dataset.id] !== undefined) {
                                $(val).remove();
                            }
                        }
                    });
                } else if (projectInfo.op === "change") {
                    $("#manager_mission tr").each((index, val) => {
                        if (projectInfo.data[val.dataset.id] !== undefined) {
                            changeInfo = projectInfo.data[val.dataset.id];
                            for (const changeAttri in changeInfo) {
                                if (changeInfo.hasOwnProperty(changeAttri)) {
                                    tableOperation.projectAttriSet(val, changeAttri, changeInfo[changeAttri]);
                                }
                            }
                        }
                    });
                }
                tableEleSet();
                initManagerSide("projectName");
                initManagerSide("projectManager");
            } else if (!$(".project-edit-mode").is(":hidden")) {
                // in edit project status
                projectInfo = $(event.target).data("data");
                if (projectInfo.op === "add") {
                    tableOperation.addProject(projectInfo.data, $("#manager_mission"));
                    $("#manager_mission tr:last-child").children("td").each((index, val) => {
                        tableOperation.giveEditModeElementVal(val);
                    });
                    $(".project-watch-mode").hide();
                    $(".project-edit-mode").show();
                } else if (projectInfo.op === "delete") {
                    $("#manager_mission tr").each((index, val) => {
                        if (projectInfo.data.indexOf(val.dataset.id)) {
                            if (index > 1) {
                                if (projectInfo.data[val.dataset.id] !== undefined) {
                                    $(val).remove();
                                }
                            }
                        }
                    });
                } else if (projectInfo.op === "change") {
                    $("#manager_mission tr").each((index, val) => {
                        if (projectInfo.data[val.dataset.id] !== undefined) {
                            changeInfo = projectInfo.data[val.dataset.id];
                            for (const changeAttri in changeInfo) {
                                if (changeInfo.hasOwnProperty(changeAttri)) {
                                    tableOperation.projectAttriSet(val, changeAttri, changeInfo[changeAttri]);
                                }
                            }
                        }
                    });
                }
                tableEleSet();
                initManagerSide("projectName");
                initManagerSide("projectManager");
            } else {
                // in normal status
                location.reload();
            }
        }
    });
});