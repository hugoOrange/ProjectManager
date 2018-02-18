// package dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var session = require('express-session');

// project dependencies
var config = require('./config.js');
var db = require('./DB.js');
db.connect();

// command parameters
const cn_args = process.argv;
if (cn_args.indexOf('-h') !== -1) {
    console.log("--HELP: Maybe configurable arguments: -P: port number");
    process.exit();
}
// var hostName = cn_args[cn_args.indexOf('-H') < 0 ? -1 : cn_args.indexOf('-H') + 1] || config.indexUrlHost;
var hostName = config.indexUrlHost;
var port = cn_args[cn_args.indexOf('-P') < 0 ? -1 : cn_args.indexOf('-P') + 1] || config.indexUrlPort;
if (port.search(/[^\d]/) !== -1 || port.length > 8) {
    console.error("Arguments Error: Port number has unexpected character or it is too long");
    process.exit();
}

// about server
console.log(" * Run on http://" + hostName + ":" + port);

app.use(session({
    name: 'skey',
    secret: 'project manager',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: config.sessionTime
    }
}));

app.get('/', function (req, res) {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;

    if (isLogined) {
        if (loginUser > 0) {
        // if (loginUser === 1) {
            res.sendfile(__dirname + '/public/manager.html');
        // } else if (loginUser > 1) {
        //     res.sendfile(__dirname + '/public/member.html');
        } else {
            res.sendfile(__dirname + '/public/login.html');            
        }
    } else {        
        res.sendfile(__dirname + '/public/login.html');
    }
});
app.use(express.static('./public'));
app.use(express.static('./resources'));


app.post('/login', (req, res) => {
    var sess = req.session;
    console.log(" * Request: Login verifing");

    db.queryUser(req.body.username, req.body.password, (userId) => {
        if (userId.length < 1) {
            console.warn(" - Nonexistent user.");
            res.json({
                ret_code: 1,
                ret_msg: '不存在的用户'
            });
        } else if (userId[0]["userId"] > 0) {
            req.session.regenerate(function(err) {
                if(err){
                    return res.json({
                        ret_code: 2,
                        ret_msg: '登录失败'
                    });
                }
                
                console.log(" * User login successfully");
                req.session.loginUser = userId[0]["userId"];
                res.json({
                    ret_code: 0,
                    ret_msg: '登录成功'
                });
            });
        } else {
            console.warn(" - User failed to login");
            res.json({
                ret_code: 1,
                ret_msg: '不明错误'
            });
        }
    });
});

app.get('/signout', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    console.log(" * Request: sign out");

    if (loginUser) {
        sess.destroy(err => {
            res.send({
                ret_code: 0,
                ret_msg: '成功注销'
            });
        });
    }
});

app.post('/signup', (req, res) => {
    db.addUser(req.body.username, req.body.password, (results) => {
        res.send({
            ret_code: 0,
            ret_msg: '成功添加新用户'
        });
    })
});

app.post('/project', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    console.log(" * Request: query all projects");

    if (isLogined) {
        if (loginUser > 0) {
        // if (loginUser === 1) {
            db.queryAllProject((projectInfo) => {
                res.json({
                    ret_code: 0,
                    ret_msg: '成功获取信息',
                    ret_con: projectInfo
                });
            });
        // } else if (loginUser > 1) {
        //     db.queryProject(loginUser, (projectInfo) => {
        //         res.json({
        //             ret_code: 0,
        //             ret_msg: '成功获取信息',
        //             ret_con: projectInfo
        //         });
        //     });
        } else {
            res.json({
                ret_code: 1,
                ret_msg: '不明错误'
            })
        }
    } else {
        res.json({
            ret_code: 2,
            ret_msg: '未登录'
        });
    }
});

app.post('/projectName', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    console.log(" * Request: query all projects' name");

    if (isLogined) {
        db.queryAllProjectName(loginUser, (nameList) => {
            let l = nameList.map((val, index) => {
                return val.projectName;
            });
            res.send({
                ret_code: 0,
                ret_msg: '成功获取所有项目名字',
                ret_con: l
            });
        }, () => {
            res.send({
                ret_code: 1,
                ret_msg: '获取项目名字失败'
            });
        });
    }
});

app.post('/managerName', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    console.log(" * Request: query all managers' name");

    if (isLogined) {
        db.queryAllManagerName(loginUser, (nameList) => {
            let l = nameList.map((val, index) => {
                return val.projectManager;
            });
            res.send({
                ret_code: 0,
                ret_msg: '成功获取所有负责人姓名',
                ret_con: l.filter((val, index) => {
                        return l.indexOf(val) === index;
                    })
            });
        }, () => {
            res.send({
                ret_code: 1,
                ret_msg: '获取负责人姓名失败'
            });
        });
    }
});

app.post('/addProject', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    console.log(" * Request: add new project");

    if (isLogined) {
        let info = req.body;
        db.addProject(loginUser, info.projectStatus, info.projectName, info.projectTarget, info.projectManager, info.deadline,
            info.projectProgress, info.priority, (results) => {
                res.json({
                    ret_code: 0,
                    ret_msg: '成功添加新项目',
                });
            }, () => {
                res.json({
                    ret_code: 1,
                    ret_msg: '添加项目失败'
                })
            });
    }
});

app.post('/deleteProjects', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    console.log(" * Request: delete projects");

    if (isLogined) {
        let deleteList = req.body;
        db.deleteProjects(loginUser, deleteList, (deleteRowsNum) => {
            res.json({
                ret_code: 0,
                ret_msg: '成功删除新项目',
            });
        }, () => {
            res.json({
                ret_code: 1,
                ret_msg: '删除项目失败'
            });
        });
    }
});

app.post('/changeProjects', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    console.log(" * Request: change projects");

    if (isLogined) {
        let changeList = req.body;
        db.changeProjects(loginUser, changeList, (changeRows, failRows) => {
            if (changeRows.length === Object.keys(changeList).length) {
                res.json({
                    ret_code: 0,
                    ret_msg: '成功修改项目'
                });
            } else if (failRows.length === Object.keys(changeList).length) {
                res.json({
                    ret_code: 2,
                    ret_msg: '本次修改失败'
                });
            } else {
                res.json({
                    ret_code: 1,
                    ret_msg: '成功修改部分',
                    succRows: changeRows,
                    failRows: failRows
                });
            }
        });
    }
});
