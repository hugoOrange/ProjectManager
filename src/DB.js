module.exports = (function() {
    var mysql = require('mysql');
    var config = require('./config');
    var connection = null;
    var userTable = 'User';
    var projectTable = 'Project';

    function getNowDate() {
        return new Date().toISOString().slice(0, 10);
    }

    function mapProjectStatus(projectList) {
        return projectList.map((val, index) => {
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
            var ql = `select userId from ${userTable} where ${userTable}.username = "${username}" and ${userTable}.password = "${password}"`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    console.error("Error: WRONG_SQL:");
                    console.error("    " + ql);
                    fail();
                    return;
                }

                console.log(" # Successfully query user from database");
                succ(results);
            });
        },

        addUser: (username, password, department, succ, fail = () => {}) => {
            var ql = `insert into ${userTable} (username, password, department) value ("${username}", "${password}", ${department});`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    console.error("Error: WRONG_SQL:");
                    console.error("    " + ql);
                    fail();
                    return;
                }

                console.log(" # Successfully add new user to database");
                succ(results);
            });
        },

        isUserExisted: (username, succ, fail = () => {}) => {
            var ql = `select userId from ${userTable} where ${userTable}.username = "${username}";`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    console.error("Error: WRONG_SQL:");
                    console.error("    " + ql);
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

        queryAllProject: (succ, fail = () => {}) => {
            var ql = `select * from ${projectTable}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    console.error("Error: WRONG_SQL:");
                    console.error("    " + ql);
                    fail();
                    return;
                }

                console.log(" # Successfully query all projects from database");
                for (var i = 0; i < results.length; i++) {
                    results[i].deadline = results[i].deadline.toISOString().slice(0, 10);
                }
                succ(mapProjectStatus(results));
            });
        },

        queryProjectTimeAbout: (succ, fail = () => {}) => {
            var ql = `select projectStatus, department, finishTime, createTime from ${projectTable}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    console.error("Error: WRONG_SQL:");
                    console.error("    " + ql);
                    fail();
                    return;
                }

                console.log(" # Successfully projects' overview from database");
                succ(results);
            });
        },

        queryProjectsName: (userId, succ, fail = () => {})=> {
            var ql = `select * from ${projectTable} where ${projectTable}.userId = ${userId}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    console.error("Error: WRONG_SQL:");
                    console.error("    " + ql);
                    fail();
                    return;
                }

                console.log(" # Successfully query project from database");
                succ(results);
            });
        },

        queryAllProjectName: (userId, succ, fail = () => {})=> {
            var ql = `select distinct projectName from ${projectTable}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    console.error("Error: WRONG_SQL:");
                    console.error("    " + ql);
                    fail();
                    return;
                }

                console.log(" # Successfully query all projects' name from database");
                succ(results);
            });
        },

        queryAllManagerName: (userId, succ, fail = () => {})=> {
            var ql = `select distinct projectManager from ${projectTable}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    console.error("Error: WRONG_SQL:");
                    console.error("    " + ql);
                    fail();
                    return;
                }

                console.log(" # Successfully query all managers' name from database");
                succ(results);
            });
        },

        addProject: (userId, status, name, target, manager, deadline, progress, priority, succ, fail = () => {}) => {
            var ql = `INSERT INTO ${projectTable} (userId, projectStatus, projectName, projectTarget, projectManager, deadline, projectProgress, priority, firstTime, finishTime)
                VALUE (${userId}, ${status}, "${name}", "${target}", "${manager}", "${deadline}", "${progress}", ${priority}, "${deadline}", "0")`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    console.error("Error: WRONG_SQL:");
                    console.error("    " + ql);
                    fail();
                    return;
                }

                console.log(" # Successfully add project to database");
                succ(results);
            });
        },
        
        finishProjects: (userId, projectList, succ, fail = () => {}) => {
            if (projectList.length === 0) {
                succ(0);
                return;
            }

            var ql = `UPDATE ${projectTable} SET ${projectTable}.projectStatus = 2, ${projectTable}.finishTime = ${getNowDate()} WHERE`;
            for (let i = 0; i < projectList.length - 1; i++) {
                ql += ` ${projectTable}.projectId = ${projectList[i]} or`;
            }
            ql += ` ${projectTable}.projectId = ${projectList[projectList.length - 1]}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    console.error("Error: WRONG_SQL:");
                    console.error("    " + ql);
                    fail();
                    return;
                }

                console.log(" # Successfully finish projects to database");
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
                    console.error("Error: WRONG_SQL:");
                    console.error("    " + ql);
                    fail();
                    return;
                }

                console.log(" # Successfully delete projects to database");
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