module.exports = (function () {
    var mysql = require('mysql');
    var fs = require('fs');
    var dateCal = require('./dateCal.js');
    var config = require('./config');
    var typeMap = {
        normal: " - ",
        param: " ^ ",
        db: " # ",
        http: " ~ ",
        log: " * "
    }
    var userMap = {
        getName: id => id === undefined ? "unkown" : (userMap[id] || "unkown")
    };


    return {
        start: () => {
            const ql = `SELECT userId, username FROM ${config.userTable};`;

            fs.open('log', 'a+', (e, fd) => {
                console.log(typeMap["log"] + dateCal.getNowTime() + " Start: start running");
                fs.write(fd, typeMap["log"] + dateCal.getNowTime() + " Start: start running\n", function(e){
                    if (e) {
                        console.error(typeMap["log"] + "Fail to write in log file");
                    }
                });
            });

            connection = mysql.createConnection({
                host     : config.dbHost,
                user     : config.dbUser,
                password : config.dbPassword,
                database : config.dbDatabase,
                dateStrings: true
            });            
            connection.connect(function (err) {
                if (err) {
                    console.error(typeMap["error"] + "Fail to connect database, please retry.");
                    throw err;
                }
            });
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    logMethod.error("QL_run", "In queryUserInfo: " + ql, "db");
                    console.error(typeMap["error"] + "Fail to get user information, please retry.");
                    throw error;
                }

                for (let i = 0; i < results.length; i++) {                    
                    userMap[results[i].userId] = results[i].username;
                }
                connection.end();
            });
        },

        log: (str, type, userId) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " (from: " + userMap.getName(userId) + ") Log: " + str;
            console.log(inStr);
            fs.open('log', 'a+', (e, fd) => {
                if (e) {
                    console.error(typeMap["log"] + "Fail to open log file");
                }
                fs.write(fd, inStr + "\n", function(e){
                    if (e) {
                        console.error(typeMap["log"] + "Fail to write in log file");
                    }
                });
            });
        },

        success: (str, type, userId) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " (from: " + userMap.getName(userId) + "） Success: " + str;
            console.log(inStr);
            fs.open('log', 'a+', (e, fd) => {
                if (e) {
                    console.error(typeMap["log"] + "Fail to open log file");
                }
                fs.write(fd, inStr + "\n", function(e){
                    if (e) {
                        console.error(typeMap["log"] + "Fail to write in log file");
                    }
                });
            });
        },

        warn: (str, type, userId) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " (from: " + userMap.getName(userId) + " Warn: " + str;
            console.warn(inStr);
            fs.open('log', 'a+', (e, fd) => {
                if (e) {
                    console.error(typeMap["log"] + "Fail to open log file");
                }
                fs.write(fd, inStr + "\n", function(e){
                    if (e) {
                        console.error(typeMap["log"] + "Fail to write in log file");
                    }
                });
            });
        },

        error: (name, str, type, userId) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " " + name.toUpperCase() + " (from: " + userMap.getName(userId) + ") Error: " + str;
            console.error(inStr);
            fs.open('log', 'a+', (e, fd) => {
                if (e) {
                    console.error(typeMap["log"] + "Fail to open log file");
                }
                fs.write(fd, inStr + "\n", function(e){
                    if (e) {
                        console.error(typeMap["log"] + "Fail to write in log file");
                    }
                });
            });
        },

        end: () => {
            fs.open('log', 'a+', (e, fd) => {
                if (e) {
                    console.error(typeMap["log"] + "Fail to open log file");
                }
                fs.write(fd, typeMap["log"] + dateCal.getNowTime() + " End: exit\n", function(e){
                    if (e) {
                        console.error(typeMap["log"] + "Fail to write in log file");
                    }
                });
            });
        }
    }
})();