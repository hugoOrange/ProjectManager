$(document).ready(() => {
    const MIN_USERNAME_LENGTH = 3;
    const MAX_USERNAME_LENGTH = 30;
    const MIN_PASSWORD_LENGTH = 6;
    const MAX_PASSWORD_LENGTH = 30;


    selectElement.makeSelectById("signup_department", ["NQA", "COPS"], [0, 1]);

    $("#signup").hide();

    $("#login_loginIn").click(event => {
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

    $("#login_signUp").click(event => {
        $("#signup").show();
        $("#login").hide();
    });

    $("#signup_signUp").click(event => {
        let username = $("#signup_username").val();
        let firstPassword = $("#signup_password").val();
        let secondPassword = $("#signup_passwordAgain").val();
        if (username.search(/[^\w]/) === -1 && username.length >= MIN_USERNAME_LENGTH && username.length <= MAX_USERNAME_LENGTH) {
            if (firstPassword === secondPassword && firstPassword.length >= MIN_PASSWORD_LENGTH && firstPassword.length <= MAX_PASSWORD_LENGTH) {
                serverIO.signUp({
                    username: username,
                    password: firstPassword,
                    department: selectElement.selectValById("signup_department")
                }, (data) => {
                    alert("注册成功");
                    $("#signup_username").val("");
                    $("#signup_password").val("");
                    $("#signup_passwordAgain").val("");

                    $("#signup").hide();
                    $("#login").show();

                    $("#login_username").val(username);
                    $("#login_password").val(firstPassword);
                }, () => {
                    alert("注册失败");
                    $("#signup_username").val("");
                    $("#signup_password").val("");
                    $("#signup_passwordAgain").val("");
                });
            } else {
                alert("两次密码不一致");
                return;
            }
        } else {
            alert("不规范的用户名");
            return;
        }
    });

    $("#signup_loginIn").click(event => {
        $("#signup_username").val("");
        $("#signup_password").val("");
        $("#signup_passwordAgain").val("");

        $("#signup").hide();
        $("#login").show();
    });
});