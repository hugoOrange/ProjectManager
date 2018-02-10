$(document).ready(() => {
    serverIO.queryProject((data) => {
        tableOperation.addProject(data.ret_con, $("#member_mission"));
        tableOperation.statusColorReset("member_mission");
    });
});