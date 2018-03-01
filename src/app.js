// package dependencies
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
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

// about server
server.listen(port, () => console.log(" * Run on http://" + hostName + ":" + port));

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

    console.log(loginUser);
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
    console.log(" * Request: " + req.body.op);

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
                    
                    console.log(" * User login successfully");
                    req.session.loginUser = userId;
                    res.json({
                        ret_code: 0,
                        ret_msg: '登录成功'
                    });
                });
            });
            break;
    
        case 'signup':
            action.loginSignup(req.body.opList, res);
            break;

        default:
            break;
    }
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
    } else {
        res.send({
            ret_code: 0,
            ret_msg: '成功注销'
        })
    }
});

app.post('/project', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    console.log(" * Request: " + req.body.scale);
    var judgeInWeek = jTime => {
        // jTime: "yyyy-mm-dd"
        var seventBefore = dateCal.getDateOffset(-7);
        var nowDate = dateCal.getNowDate();
        if (jTime > seventBefore && jTime < nowDate) {
            return true;
        }
    };

    if (isLogined) {
        if (loginUser > 0) {
            switch(req.body.scale) {
                case 'overview':
                    action.queryOverview(loginUser, req, res);
                    break;
        
                case 'all':
                    action.queryAll(loginUser, req, res);
                    break;
        
                case 'projectAndManager':
                    // action.queryProjectManager(loginUser, req, res);
                    break;
        
                case 'projectName':
                    action.qureyProjectName(loginUser, req, res);
                    break;
        
                case 'projectManager':
                    action.queryProjectManager(loginUser, req, res);
                    break;
                
                default:
                    res.json({
                        ret_code: 1,
                        ret_msg: '未识别的操作'
                    });
            }
        }
    } else {
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
    console.log(" * Request: " + req.scale);

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
        res.json({
            ret_code: 9,
            ret_msg: '未登录'
        });
    }
});
