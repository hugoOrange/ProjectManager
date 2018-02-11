$(document).ready(() => {
    serverIO.queryProject((data) => {
        tableOperation.addProject(data.ret_con, $("#member_mission"));
        tableOperation.statusColorReset("member_mission");
    });

    $("#member_confirm").click(() => {});
    $("#member_add").click(() => {});
    $("#member_edit").click(() => {});
    $("#member_delete").click(() => {});
});