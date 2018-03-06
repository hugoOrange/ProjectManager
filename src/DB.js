module.exports = (function() {
    var mysql = require('mysql');
    var config = require('./config');
    var logMethod = require("./log.js");
    var connection = null;
    var userTable = 'User';
    var projectTable = 'Project';

    function getNowDate() {
        return new Date().toISOString().slice(0, 10);
    }

    function mapProjectStatus(projectList) {
        return projectList.map((val, index) => {
            if (val.projectStatus === null) {
                return val
            }
            val.projectStatus = val.projectStatus === 2 ? 2 : val.firstTime.toISOString().slice(0, 10) >= val.deadline ? 0 : 1;
            return val;
        });
    }

    return {
        connect: () => {
            connection = mysql.createConnection({
                host     : config.dbHost,
                user     : config.dbUser,
                password : config.dbPassword,
                database : config.dbDatabase
            });
            
            connection.connect();
        },

        queryUser: (username, password, succ, fail = () => {}) => {
            var ql = `SELECT userId FROM ${userTable} WHERE ${userTable}.username = "${username}" and ${userTable}.password = "${password}";`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    logMethod.error("QL_run", "In queryUser: " + ql, "db");
                    fail();
                    return;
                }

                succ(results);
            });
        },

        addUser: (username, password, department, succ, fail = () => {}) => {
            var ql = `INSERT INTO ${userTable} (username, password, department) VALUE ("${username}", "${password}", ${department});`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    logMethod.error("QL_run", "In addUser: " + ql, "db");
                    fail();
                    return;
                }

                succ(results);
            });
        },

        isUserExisted: (username, succ, fail = () => {}) => {
            var ql = `SELECT userId FROM ${userTable} WHERE ${userTable}.username = "${username}";`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    logMethod.error("QL_run", "In isUserExisted: " + ql, "db");
                    fail();
                    return;
                }

                if (results.length === 0) {
                    succ(false);
                } else {
                    succ(true);
                }
            });
        },

        /** about query */

        queryDepartmentProject: (department, succ, fail = () => {}) => {
            var ql = `SELECT ${userTable}.userId, ${userTable}.username, projectId, projectStatus, projectName, projectTarget, deadline, projectProgress, priority, firstTime, createtime, finishTime FROM
                ${userTable} LEFT JOIN ${projectTable} ON ${projectTable}.userId = ${userTable}.userId WHERE ${userTable}.department = ${department};`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    logMethod.error("QL_run", "In queryDepartmentProject: " + ql, "db");
                    fail();
                    return;
                }

                for (var i = 0; i < results.length; i++) {
                    if (results[i].deadline !== null) {
                        results[i].deadline = results[i].deadline.toISOString().slice(0, 10);
                    }
                }
                succ(mapProjectStatus(results));
            });
        },

        queryProjectTimeAbout: (succ, fail = () => {}) => {
            var ql = `SELECT ${userTable}.userId, ${userTable}.username, projectId, projectStatus, projectName, finishTime, createTime, department FROM ${userTable} LEFT JOIN ${projectTable} ON ${projectTable}.userId = ${userTable}.userId;`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    logMethod.error("QL_run", "In queryProjectTimeAbout: " + ql, "db");
                    fail();
                    return;
                }

                succ(results);
            });
        },

        queryUserInfo: (succ, fail = () => {}) => {
            var ql = `SELECT userId, username FROM ${userTable};`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    logMethod.error("QL_run", "In queryUserInfo: " + ql, "db");
                    fail();
                    return;
                }

                succ(results);
            });
        },

        /** about edit */

        addProject: (userId, name, target, deadline, progress, priority, succ, fail = () => {}) => {
            var ql = `INSERT INTO ${projectTable} (userId, projectStatus, projectName, projectTarget, deadline, projectProgress, priority, firstTime, finishTime)
                VALUE (${userId}, 0, "${name}", "${target}", "${deadline}", "${progress}", ${priority}, "${deadline}", "1-1-1");`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    logMethod.error("QL_run", "In addProject: " + ql, "db");
                    fail();
                    return;
                }

                succ(results);
            });
        },
        
        finishProjects: (userId, projectList, succ, fail = () => {}) => {
            if (projectList.length === 0) {
                succ(0);
                return;
            }

            var ql = `UPDATE ${projectTable} SET ${projectTable}.projectStatus = 2, ${projectTable}.finishTime = "${getNowDate()}" WHERE`;
            for (let i = 0; i < projectList.length - 1; i++) {
                ql += ` ${projectTable}.projectId = ${projectList[i]} or`;
            }
            ql += ` ${projectTable}.projectId = ${projectList[projectList.length - 1]}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    logMethod.error("QL_run", "In finishProjects: " + ql, "db");
                    fail();
                    return;
                }

                succ(results.changeRows);
            });
        },
        
        deleteProjects: (userId, projectList, succ, fail = () => {}) => {
            if (projectList.length === 0) {
                succ(0);
                return;
            }

            var ql = `DELETE FROM ${projectTable} WHERE`;
            for (var i = 0; i < projectList.length - 1; i++) {
                ql += ` ${projectTable}.projectId = ${projectList[i]} or`;
            }
            ql += ` ${projectTable}.projectId = ${projectList[projectList.length - 1]};`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    logMethod.error("QL_run", "In deleteProjects: " + ql, "db");
                    fail();
                    return;
                }

                succ(results.changeRows);
            });
        },

        changeProjects: async (userId, changeList, callback) => {
            if (changeList.length === 0) {
                succ([], []);
                return;
            }

            var ql = "";
            var succChangeList = [];
            var failChangeList = [];
            for (var projectId in changeList) {
                if (changeList.hasOwnProperty(projectId)) {
                    var changeItem = changeList[projectId];
                    ql = `UPDATE ${projectTable} SET `;
                    
                    for (var ci in changeItem) {
                        if (changeItem.hasOwnProperty(ci)) {
                            if (ci === "projectStatus" || ci === "priority") {                                
                                ql += `${projectTable}.${ci} = ${changeItem[ci]}`;
                            } else {
                                ql += `${projectTable}.${ci} = "${changeItem[ci]}"`;
                            }
                        }
                    }
                    ql += ` WHERE ${projectTable}.projectId = ${projectId};`
                    connection.query(ql, function (error, results, fields) {
                        if (error) {
                            logMethod.error("QL_run", "In changeProjects: " + ql, "db");
                            failChangeList.push(projectId);
                        }
                        succChangeList.push(projectId);
                        if ((succChangeList.length + failChangeList.length) === Object.keys(changeList).length) {
                            callback(succChangeList, failChangeList);
                        }
                    });
                }
            }
        }
    }
})();