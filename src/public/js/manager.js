$(document).ready(() => {
    serverIO.queryProject((data) => {
        tableOperation.addProjects(data.ret_con, $("#manager_mission"));
        tableOperation.statusSet("manager_mission");
        tableOperation.progressSet("manager_mission");
        tableOperation.prioritySet("manager_mission");
    });

    progressElement.createProgressInput(document.querySelector("#new_projectProgress"));

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
        $("#manager_mission_edit").toggle();
        $("#manager_confirm").toggle();
    });
    
    $("#manager_edit").click(event => {
        tableOperation.changeInEditMode("manager_mission");
        $("#manager_confirm").toggle();
    });
    
    $("#manager_delete").click(event => {});


    $("#confirm_ok").click(event => {
        // check which operation according whether below element is hidden
        if($("#manager_mission_edit").is(":hidden")){
            console.log("Change some projects");
            // update all edit project
        } else {
            console.log("Start to add new project");
            // add new project
            let status = $("#new_projectStatus").val();
            let name = $("#new_projectName").val();
            let target = $("#new_projectTarget").val();
            let manager = $("#new_projectManager").val();
            let deadline = $("#new_deadline").val();
            let progressText = progressElement.getProgressInputText(document.querySelector("#new_projectProgress"));
            let priority = $("#new_priority").val();

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
    })
});