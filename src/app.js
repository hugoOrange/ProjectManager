// package dependencies
var express = require('express');
var app = express();
// var server = require('http').Server(app);
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var session = require('express-session');

// project dependencies
var config = require('./config.js');
var dateCal = require('./dateCal.js');
var action = require('./action.js');
var logMethod = require('./log.js');

// command parameters
var cn_args = process.argv;
if (cn_args.indexOf('-h') !== -1) {
    console.log("--HELP: Maybe configurable arguments: \n-H: host name\n-P: port number");
    process.exit();
}
var hostName = cn_args[cn_args.indexOf('-H') < 0 ? -1 : cn_args.indexOf('-H') + 1] || config.indexUrlHost;
var port = cn_args[cn_args.indexOf('-P') < 0 ? -1 : cn_args.indexOf('-P') + 1] || config.indexUrlPort;
if (port.search(/[^\d]/) !== -1 || port.length > 8) {
    logMethod.log("Arguments", "Port number has unexpected character or it is too long", "error");
    process.exit();
}

// other initalize
var inviteCode = action.gen_inviteCode();
logMethod.start();

// about server
app.listen(port, hostName, () => logMethod.log("Run on http://" + hostName + ":" + port, "normal"));

app.use(session({
    name: 'skey',
    secret: 'project manager',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: +config.sessionTime
    }
}));

app.get('/', function (req, res) {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;

    if (isLogined) {
        if (loginUser > 0) {
            logMethod.log("Get manager.html", "http", loginUser);
            res.sendfile(__dirname + '/public/manager.html');
        } else {
            logMethod.log("Get login.html", "http", loginUser);
            res.sendfile(__dirname + '/public/login.html');
        }
    } else {
        logMethod.log("Get login.html", "http");
        res.sendfile(__dirname + '/public/login.html');
    }
});
app.use(express.static('./public'));
app.use(express.static('./resources'));

app.post('/login', (req, res) => {
    logMethod.log("Request: " + req.body.op, "http");

    switch (req.body.op) {
        case 'login':
            action.loginVerif(req.body.opList, res, userId => {
                req.session.regenerate(function(err) {
                    if(err){
                        return res.json({
                            ret_code: 1,
                            ret_msg: '登录失败'
                        });
                    }
                    
                    logMethod.success("User login", "db", userId);
                    req.session.loginUser = userId;
                    res.json({
                        ret_code: 0,
                        ret_msg: '登录成功'
                    });
                });
            });
            break;
    
        case 'signup':
            if (inviteCode === req.body.opList.inviteCode) {
                action.loginSignup(req.body.opList, res);
                inviteCode = action.gen_inviteCode();
            } else {
                res.send({
                    ret_code: 1,
                    ret_msg: '邀请码错误'
                });
            }
            break;

        default:
            break;
    }
});

app.get('/signout', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    logMethod.log("Request: sign out", "http");

    if (loginUser) {
        sess.destroy(err => {
            if (err) {
                logMethod.error("Session", "Sign out", "normal", loginUser);
            }

            logMethod.success("Sign out", "normal", loginUser);
            res.send({
                ret_code: 0,
                ret_msg: '成功注销'
            });
        });
    } else {
        res.send({
            ret_code: 0,
            ret_msg: '成功注销'
        });
    }
});

app.get('/storage', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    logMethod.log("Request: " + req.query.type, "http");

    if (isLogined) {
        if (loginUser > 0) {
            switch (req.query.type) {
                case "workPath":
                    logMethod.log("Save path: " + req.query.data, "normal", loginUser);
                    sess.queryPath = req.query.data;
                    res.send({
                        ret_code: 0,
                        ret_msg: '保存成功',
                    });
                    break;
                
                case "queryWorkPath":
                    if (sess.queryPath !== undefined && sess.queryPath !== "") {
                        res.send({
                            ret_code: 0,
                            ret_msg: '查询成功',
                            ret_path: sess.queryPath
                        });
                    } else {
                        res.send({
                            ret_code: 0,
                            ret_msg: '查询成功',
                            ret_path: ""
                        });
                    }
                    break;
                
                case "clearWorkPath":
                    sess.queryPath = "";
                    res.send({
                        ret_code: 0,
                        ret_msg: '清除成功',
                    });
                    break;

                case "inviteCode":
                    if (loginUser == 1) {
                        res.send({
                            ret_code: 0,
                            ret_msg: '成功获取邀请码',
                            ret_data: inviteCode
                        });
                    } else {
                        res.send({
                            ret_code: 0,
                            ret_msg: '成功获取邀请码',
                            ret_data: ''
                        });
                    }
                    break;
                
                default:
                    break;
            }
        }
    } else {
        logMethod.error("Not_login", "Query from client", "http");
        res.json({
            ret_code: 9,
            ret_msg: '未登录'
        });
    }
});

app.post('/project', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    logMethod.log("Request: " + req.body.scale, "http");

    if (isLogined) {
        if (loginUser > 0) {
            switch(req.body.scale) {
                case 'overview':
                    action.queryOverview(loginUser, req, res);
                    break;

                case 'user':
                    action.queryUser(loginUser, req, res);
                    break;

                case 'department':
                    action.queryDepartment(loginUser, req.body.departmentId, req, res);
                    break;
                
                default:
                    res.json({
                        ret_code: 1,
                        ret_msg: '未识别的操作'
                    });
            }
        }
    } else {
        logMethod.error("Not_login", "Query from client", "http");
        res.json({
            ret_code: 9,
            ret_msg: '未登录'
        });
    }
});

app.post('/edit', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    logMethod.log(" Request: " + req.body.op, "http");

    if (isLogined) {
        if (loginUser > 0) {
            switch(req.body.op) {
                case 'add':
                    action.editAdd(loginUser, req.body.opList, res);
                    break;

                case 'finish':
                    action.editFinish(loginUser, req.body.opList, res);
                    break;

                case 'delete':
                    action.editDelete(loginUser, req.body.opList, res);
                    break;

                case 'change':
                    action.editChange(loginUser, req.body.opList, res);
                    break;
                
                default:
                    res.json({
                        ret_code: 1,
                        ret_msg: '未识别的操作'
                    });
            }
        }
    } else {
        logMethod.error("Not_login", "Query from client", "http");
        res.json({
            ret_code: 9,
            ret_msg: '未登录'
        });
    }
});
