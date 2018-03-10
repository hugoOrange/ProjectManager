$(document).ready(() => {
    /** value and useful function define */

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
    };

    function getNowDateFixed (bit = 10, offset = 0) {
        var day = new Date();
        var nextDay = new Date(day);
        debugger;
        nextDay.setDate(day.getDate() + offset);
        return nextDay.toISOString().slice(0, bit);
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
        progressElement.createProgressInput($("#new_projectProgress"));

        $("#no_project").hide();
    }

    function beInOverview(o, m) {
        overviewElement.initContainer("project_overview");
        overviewElement.addDepartment("project_overview", "0");
        overviewElement.addDepartment("project_overview", "1");

        overviewElement.initDepartment("project_overview", "0", o["0"], m["0"]);
        overviewElement.initDepartment("project_overview", "1", o["1"], m["1"]);
    }

    function beInLoadTable(p) {
        var dId = p.match(/department\/(\d*)/);
        var mId = p.match(/manager\/(\d*)/);
        var pId = p.match(/project\/(\d*)/);
        // attention: function triggerManager will invoke triggerDepartment
        // because of the asynchronous problem, it will occur problem when use trigger two above function successively
        if (pId !== null) {
            sidebarElement.jumpProject(dId[1], mId[1], pId[1], true);
        } else if (mId !== null) {
            sidebarElement.jumpManager(dId[1], mId[1], true);
        } else {
            sidebarElement.jumpDepartment(dId[1], true);
        }
    }


    /** run when page load */

    serverIO.queryInviteCode((code) => {
        var inviteCode = code.ret_data;
        if (inviteCode !== "") {
            $("#invite_code").show().text("邀请码： " + inviteCode);
        } else {
            $("#invite_code").hide();
        }
    });

    serverIO.queryWorkPath((p) => {
        var path = p.ret_path;
        serverIO.queryAllOverView((data) => {
            sidebarElement.initContainer("manager_sidebar", "manager_mission");
            sidebarElement.addDepartment("0", true);
            sidebarElement.addDepartment("1");
            if (path === "") {
                sidebarElement.initDepartment(data.ret_manager["0"]);
                beInOverview(data.ret_overview, data.ret_manager);
            } else {
                // need jump that url
                sidebarElement.initDepartment(data.ret_manager[path.match(/department\/(\d*)/)[1]]);
                beInLoadTable(path);
            }
        });
        $("#manager_signout").show();
    });


    $("#jump_overview").click(event => {
        serverIO.clearWorkPath(() => {
            location.reload();
        });
        event.preventDefault();
    });

    /** event bind when page load */

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
            table_current_state = "noraml";
            if ($(".project-watch-mode").length === 0) {
                $("#no_project").show();
            }
            $("#manager_mission_edit").hide();
            $("#new_milestone").parent().parent().hide();
            $("#manager_confirm").hide();
        } else {
            resetStatus();
            table_current_state = "add";
            $("#manager_mission_edit").show();
            $("#new_milestone").parent().parent().show();
            $("#manager_confirm").show();
        }
        $("#confirm_alert p").text(confirmDialog.addProject.txt);
    });
    
    $("#manager_edit").click(event => {
        if (table_current_state === "edit") {
            resetStatus();
            table_current_state = "normal";
            tableOperation.changeInWatchMode("manager_mission");
            $("#manager_confirm").hide();
            if ($(".project-watch-mode").length === 0) {
                $("#no_project").show();
            }
        } else{
            resetStatus();
            table_current_state = "edit";
            tableOperation.changeInEditMode("manager_mission");
            $("#manager_confirm").show();
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

    $("#confirm_ok").click(event => {
        let op = confirmDialog.getOp($("#confirm_alert p").text());
        var chooseProject = []; // for finish and delete
        var sendData = null;

        if(op === confirmDialog.addProject.op){
            // add new project
            sendData = tableOperation.getValueAdd("manager_mission");
            if (Object.keys(sendData).length === 0) {
                return;
            } else {
                serverIO.addProject(sendData, () => {
                    serverIO.addWorkPath(sidebarElement.getCurrentState(), () => {
                        location.reload();
                    });
                });
            }
        } else if (op === confirmDialog.changeProject.op) {
            sendData = tableOperation.getValueChange("manager_mission");
            if (Object.keys(sendData).length === 0) {
                $("#mask_layer").hide();
                $("#confirm_alert").slideUp();
            } else {
                console.dir(sendData);                
                // serverIO.changeProjects(sendData, (result) => {
                //     serverIO.addWorkPath(sidebarElement.getCurrentState(), () => {
                //         location.reload();
                //     });
                // });
            }
        } else if (op === confirmDialog.finishProject.op) {
            $(".choose-part input:checked").each((index, val) => {
                chooseProject.push($(val).val());
            });
            serverIO.finishProjects(chooseProject, (data) => {
                serverIO.addWorkPath(sidebarElement.getCurrentState(), () => {
                    location.reload();
                });
            });
        } else if (op === confirmDialog.deleteProject.op) {
            $(".choose-part input:checked").each((index, val) => {
                chooseProject.push($(val).val());
            });
            serverIO.deleteProjects(chooseProject, (data) => {
                serverIO.addWorkPath(sidebarElement.getCurrentState(), () => {
                    location.reload();
                });
            });
        }
        $("body").css({
            // allow scroll
            overflow: "auto",
            height: ""
        });
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
    });
});