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
        progressElement.createProgressInput(document.querySelector("#new_projectProgress"));

        $("#no_project").hide();
    }



    /** run when page load 
     * load order:
     * department overview -> manager and their projects
     * when click sidebar manager load manager's project list
     */

    serverIO.queryAllOverView((data) => {
        overviewElement.initContainer("project_overview");
        overviewElement.addDepartment("project_overview", "0");
        overviewElement.addDepartment("project_overview", "1");

        overviewElement.initDepartment("project_overview", "0", data.ret_overview["0"], data.ret_manager["0"]);
        overviewElement.initDepartment("project_overview", "1", data.ret_overview["1"], data.ret_manager["1"]);

        sidebarElement.initContainer("manager_sidebar", "manager_mission");
        sidebarElement.addDepartment("0");
        sidebarElement.addDepartment("1");
        sidebarElement.initDepartment(data.ret_manager["0"]);
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
            $("#manager_confirm").hide();
        } else {
            resetStatus();
            table_current_state = "add";
            $("#manager_mission_edit").show();
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

        if(op === confirmDialog.addProject.op){
            // add new project
            var addProjectValue = tableOperation.getValueAdd("manager_mission");
            if (Object.keys(addProjectValue).length === 0) {
                return;
            } else {
                serverIO.addProject(addProjectValue, () => {
                    location.reload();
                });
            }
        } else if (op === confirmDialog.changeProject.op) {
            var attributesChangeRecord = tableOperation.getValueChange("manager_mission");
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