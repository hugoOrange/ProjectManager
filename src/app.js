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

// about server
app.listen(+config.indexUrlPort);
console.log(" * Run on http://" + config.indexUrlHost + ":" + config.indexUrlPort);
app.use(session({
    name: 'skey',
    secret: 'project manager',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 15 * 60 * 1000  // valid time: 15min
        // maxAge: 5 * 60 * 1000  // valid time: 5min
    }
}));

app.get('/', function (req, res) {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;

    if (isLogined) {
        if (loginUser === 1) {
            res.sendfile(__dirname + '/public/manager.html');
        } else if (loginUser > 1) {
            res.sendfile(__dirname + '/public/member.html');
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

app.post('/project', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;

    if (isLogined) {
        if (loginUser === 1) {
            db.queryAllProject((projectInfo) => {
                res.json({
                    ret_code: 0,
                    ret_msg: '成功获取信息',
                    ret_con: projectInfo
                });
            });
        } else if (loginUser > 1) {
            db.queryProject(loginUser, (projectInfo) => {
                res.json({
                    ret_code: 0,
                    ret_msg: '成功获取信息',
                    ret_con: projectInfo
                });
            });
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