$(document).ready(() => {
    serverIO.queryProject((data) => {
        tableOperation.addProjects(data.ret_con, $("#manager_mission"));
        tableOperation.statusSet("manager_mission");
        tableOperation.progressSet("manager_mission");
        tableOperation.prioritySet("manager_mission");
    });

    $("#manager_confirm").click(() => {});

    $("#manager_add").click(() => {
        $("#manager_mission_edit").toggle();
        $("#manager_confirm").toggle();
    });
    
    $("#manager_edit").click(() => {});
    
    $("#manager_delete").click(() => {});
});