$(document).ready(() => {
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
        deleteProject: {
            txt: "确认删除这些项目吗？",
            op: "删除"
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
                            changeRecord[changeProjectId]["deadline"] = $(event.target).val() || getNowDate();
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

    function getNowDate() {
        return `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
    }

    function resetStatus() {
        $("#confirm_alert").hide();
        $("#mask_layer").hide();
        $("#manager_mission_edit").hide();
        $("#manager_confirm").hide();
        tableOperation.changeInWatchMode("manager_mission");
        $("#delete_all").hide();
        $(".delete-part").hide();
    }



    serverIO.queryProject((data) => {
        tableOperation.addProjects(data.ret_con, $("#manager_mission"));
        tableOperation.statusSet("manager_mission");
        tableOperation.progressSet("manager_mission");
        tableOperation.prioritySet("manager_mission");

        valueChangeRecordObj = valueChangeRecord();
    });

    progressElement.createProgressInput(document.querySelector("#new_projectProgress"));

    serverIO.queryAllProjectName(nameList => {
        $("#manager_sidebar_content ul").empty();
        nameList.ret_con.unshift("全部");
        for (let i = 0; i < nameList.ret_con.length; i++) {
            $("#manager_sidebar_content ul").append($('<li></li>')
                .append($(`<button title="${nameList.ret_con[i]}">${nameList.ret_con[i]}</button>`)
                    .click(function (event) {
                        var projectName = $(event.target).text();
                        $("#manager_mission tr").each((index, val) => {
                            if (index > 1) {
                                if ($(val).children("td").eq(1).children(".project-watch-mode").text() !== projectName && projectName !== "全部") {
                                    $(val).hide();
                                } else {
                                    $(val).show();
                                }
                            }
                        });
                    })
                ));
        }
    });

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
        
        var btnEvent = function (event) {
        }

        $("#manager_projectView").css("fontSize", "24px");
        $("#manager_managerList").css("fontSize", "14px");

        serverIO.queryAllProjectName(nameList => {
            $("#manager_sidebar_content ul").empty();
            nameList.ret_con.unshift("全部");
            for (let i = 0; i < nameList.ret_con.length; i++) {
                $("#manager_sidebar_content ul").append($('<li></li>')
                    .append($(`<button title="${nameList.ret_con[i]}">${nameList.ret_con[i]}</button>`)
                        .click(function (event) {
                            var projectName = $(event.target).text();
                            $("#manager_mission tr").each((index, val) => {
                                if (index > 1) {
                                    if ($(val).children("td").eq(1).children(".project-watch-mode").text() !== projectName && projectName !== "全部") {
                                        $(val).hide();
                                    } else {
                                        $(val).show();
                                    }
                                }
                            });
                        })
                    ));
            }
        });
    });

    $("#manager_managerList").click(event => {
        if ($(event.target).css("fontSize") === "24px") {
            // has been focus
            return;
        }

        $("#manager_projectView").css("fontSize", "14px");
        $("#manager_managerList").css("fontSize", "24px");

        serverIO.queryAllManagerName(nameList => {
            $("#manager_sidebar_content ul").empty();
            nameList.ret_con.unshift("全部");
            for (let i = 0; i < nameList.ret_con.length; i++) {
                $("#manager_sidebar_content ul").append($('<li></li>')
                    .append($(`<button title="${nameList.ret_con[i]}">${nameList.ret_con[i]}</button>`)
                        .click(function (event) {
                            var managerName = $(event.target).text();
                            $("#manager_mission tr").each((index, val) => {
                                if (index > 1) {
                                    if ($(val).children("td").eq(3).children(".project-watch-mode").text() !== managerName && managerName !== "全部") {
                                        $(val).hide();
                                    } else {
                                        $(val).show();
                                    }
                                }
                            });
                        })
                    ));
            }
        });
    });

    $("#delete_all button").click(event => {
        let btn = $("#delete_all p");
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

    $("#manager_confirm").click(event => {
        $("body").css({
            // ban scroll
            overflow: "hidden",
            height: "100%"
        });manager_delete
        $("#mask_layer").show();
        $("#confirm_alert").slideDown();
        if (!$("#manager_mission_edit").is(":hidden")) {            
            $("#confirm_alert p").text(confirmDialog.addProject.txt);
        } else if (!$(".project-edit-mode").is(":hidden")) {
            $("#confirm_alert p").text(confirmDialog.changeProject.txt);            
        } else if (!$("#delete_all").is(":hidden")) {
            $("#confirm_alert p").text(confirmDialog.deleteProject.txt);
        }
    });

    $("#manager_add").click(event => {
        if ($("#manager_mission_edit").is(":hidden")) {
            resetStatus();
            $("#manager_mission_edit").show();
            $("#manager_confirm").show();
        } else {
            resetStatus();
            $("#manager_mission_edit").hide();
            $("#manager_confirm").hide();
        }
    });
    
    $("#manager_edit").click(function () {
        progressElement.resetChangeRecord();
        attributesChangeRecord = {};

        if ($(".project-edit-mode").is(":hidden")) {
            resetStatus();
            tableOperation.changeInEditMode("manager_mission");
            $("#manager_confirm").show();
        } else{
            resetStatus();
            tableOperation.changeInWatchMode("manager_mission");
            $("#manager_confirm").hide();
        }
    });

    $("#manager_delete").click(function () {
        if (!$("#delete_all").is(":hidden")) {
            resetStatus();
            $("#delete_all").hide();
            $(".delete-part").hide();
            $("#manager_confirm").hide();
        } else{
            resetStatus();
            $("#delete_all").show();
            $(".delete-part").show();
            $("#manager_confirm").show();
        }
    });

    $("#confirm_ok").click(event => {
        let op = confirmDialog.getOp($("#confirm_alert p").text());
        if(op === confirmDialog.addProject.op){
            // add new project
            let status = $("#new_projectStatus").val();
            let name = $("#new_projectName").val();
            let target = $("#new_projectTarget").val() || ".";
            let manager = $("#new_projectManager").val();
            let deadline = $("#new_deadline").val() || getNowDate();
            let progressText = progressElement.getProgressInputText(document.querySelector("#new_projectProgress")) ||
                (getNowDate() + " - .");
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
            if(name.search(/[^\w]/) !== -1 || name === "" || name.length < 7 || name.length > 31) {
                alert("不规范的项目文件名");
                console.error("Invalid project name");
                return;
            }
            if(manager.search(/[^\w]|\s/) !== -1 || manager === "" || manager.length > 31) {
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
                console.log("Successfully add new project");
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
            serverIO.changeProjects(attributesChangeRecord, (result) => {
                console.log("Successfully change the projects");
                location.reload();
            });
        } else if (op === confirmDialog.deleteProject.op) {
            let chooseDelete = [];
            $(".delete-part input:checked").each((index, val) => {
                chooseDelete.push($(val).val());
            });
            serverIO.deleteProjects(chooseDelete, (data) => {
                console.log("Successfully delete projects");
                location.reload();
            });
        }
    });

    $("#confirm_cancel").click(event => {
        $("body").css({
            // allow scroll
            overflow: "auto",
            height: ""
        });
        $("#mask_layer").hide();
        $("#confirm_alert").slideUp();
    });
});