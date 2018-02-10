$(document).ready(() => {
    $("#signup").hide();

    $("#login_loginIn").click(() => {
        let u = $("#login_username").val();
        let p = $("#login_password").val();
        if (u && p) {
            serverIO.verifyLogin(u, p, (data) => {
                location.reload();
            });
            return;
        }
        alert("错误的用户名或密码")
    });

    $("#login_signUp").click(() => {
        $("#signup").show();
        $("#login").hide();
    });

    $("#signup_loginIn").click(() => {
        $("#signup").hide();
        $("#login").show();
    });
});