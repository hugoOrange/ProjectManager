module.exports = (function () {
    var dateCal = require('./dateCal.js');
    var fs = require('fs');
    var typeMap = {
        "normal": " - ",
        "param": " ^ ",
        "db": " # ",
        "http": " ~ ",
        "log": " * "
    }


    return {
        end: () => {
            fs.write(fd, typeMap["log"] + dateCal.getNowTime() + " Start: start running", function(e){
                if (e) {
                    console.error(typeMap["log"] + "Fail to write in log file");
                }
            });
            fs.open('log', 'a+');
        },

        log: (str, type) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " Log: " + str;
            fs.open('log', 'a+', (e, fd) => {
                if (e) {
                    console.error(typeMap["log"] + "Fail to open log file");
                }
                fs.write(fd, inStr, function(e){
                    if (e) {
                        console.error(typeMap["log"] + "Fail to write in log file");
                    }
                });
            });
        },

        success: (str, type) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " Success: " + str;
            fs.open('log', 'a+', (e, fd) => {
                if (e) {
                    console.error(typeMap["log"] + "Fail to open log file");
                }
                fs.write(fd, inStr, function(e){
                    if (e) {
                        console.error(typeMap["log"] + "Fail to write in log file");
                    }
                });
            });
        },

        warn: (str, type) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " Warn: " + str;
            fs.open('log', 'a+', (e, fd) => {
                if (e) {
                    console.error(typeMap["log"] + "Fail to open log file");
                }
                fs.write(fd, inStr, function(e){
                    if (e) {
                        console.error(typeMap["log"] + "Fail to write in log file");
                    }
                });
            });
        },

        error: (name, str, type) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " " + name.toUpperCase() + "error: " + str;
            fs.open('log', 'a+', (e, fd) => {
                if (e) {
                    console.error(typeMap["log"] + "Fail to open log file");
                }
                fs.write(fd, inStr, function(e){
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
                fs.write(fd, typeMap["log"] + dateCal.getNowTime() + " End: exit", function(e){
                    if (e) {
                        console.error(typeMap["log"] + "Fail to write in log file");
                    }
                });
            });
        }
    }
})();