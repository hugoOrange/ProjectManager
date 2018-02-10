$(document).ready(() => {
    serverIO.queryProject((data) => {
        tableOperation.addProject(data.ret_con, $("#manager_mission"));
        tableOperation.statusColorReset("manager_mission");
    });
});