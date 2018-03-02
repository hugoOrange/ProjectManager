module.exports = (function () {
    var dateCal = require('./dateCal.js');
    var fs = require('fs');
    var typeMap = {
        normal: " - ",
        param: " ^ ",
        db: " # ",
        http: " ~ ",
        log: " * "
    }


    return {
        start: () => {
            fs.open('log', 'a+', (e, fd) => {
                console.log(typeMap["log"] + dateCal.getNowTime() + " Start: start running");
                fs.write(fd, typeMap["log"] + dateCal.getNowTime() + " Start: start running\n", function(e){
                    if (e) {
                        console.error(typeMap["log"] + "Fail to write in log file");
                    }
                });
            });
        },

        log: (str, type) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " Log: " + str;
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

        success: (str, type) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " Success: " + str;
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

        warn: (str, type) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " Warn: " + str;
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

        error: (name, str, type) => {
            var inStr = typeMap[type] + dateCal.getNowTime() + " " + name.toUpperCase() + "error: " + str;
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