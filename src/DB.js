module.exports = (function() {
    const mysql = require('mysql');
    const config = require('./config');
    var connection = null;
    const userTable = 'User';
    const projectTable = 'Project';

    function getNowDate() {
        return new Date().toISOString().slice(0, 10);
    }

    function mapProjectStatus(projectList) {
        return projectList.map((val, index) => {
            val.projectStatus = val.deadline > getNowDate() ? 0 : 1;
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
            const ql = `select userId from ${userTable} where ${userTable}.username = "${username}" and ${userTable}.password = "${password}"`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
                }

                console.log(" # Successfully query user from database");
                succ(results);
            });
        },

        addUser: (username, password, succ, fail = () => {}) => {
            const ql = `insert into ${userTable} (username, password) value ("${username}", "${password}");`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
                }

                console.log(" # Successfully add new user to database");
                succ(results);
            });
        },

        isUserExisted: (username, succ, fail = () => {}) => {
            const ql = `select userId from ${userTable} where ${userTable}.username = "${username}";`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
                }

                if (results.length === 0) {
                    succ(false);
                } else {
                    succ(true);
                }
            });
        },

        queryAllProject: (succ, fail = () => {}) => {
            const ql = `select * from ${projectTable}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
                }

                console.log(" # Successfully query all projects from database");
                for (let i = 0; i < results.length; i++) {
                    results[i].deadline = results[i].deadline.toISOString().slice(0, 10);
                }
                succ(mapProjectStatus(results));
            });
        },

        queryProjectsName: (userId, succ, fail = () => {})=> {
            const ql = `select * from ${projectTable} where ${projectTable}.userId = ${userId}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
                }

                console.log(" # Successfully query project from database");
                succ(results);
            });
        },

        queryAllProjectName: (userId, succ, fail = () => {})=> {
            const ql = `select projectName from ${projectTable}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
                }

                console.log(" # Successfully query all projects' name from database");
                succ(results);
            });
        },

        queryAllManagerName: (userId, succ, fail = () => {})=> {
            const ql = `select projectManager from ${projectTable}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
                }

                console.log(" # Successfully query all managers' name from database");
                succ(results);
            });
        },

        addProject: (userId, status, name, target, manager, deadline, progress, priority, succ, fail = () => {}) => {
            const ql = `INSERT INTO ${projectTable} (userId, projectStatus, projectName, projectTarget, projectManager, deadline, projectProgress, priority)
                VALUE (${userId}, ${status}, "${name}", "${target}", "${manager}", "${deadline}", "${progress}", ${priority})`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
                }

                console.log(" # Successfully add project to database");
                succ(results);
            });
        },
        
        deleteProjects: (userId, projectList, succ, fail = () => {}) => {
            if (projectList.length === 0) {
                succ(0);
                return;
            }

            var ql = `DELETE FROM ${projectTable} WHERE`;
            for (let i = 0; i < projectList.length - 1; i++) {
                ql += ` ${projectTable}.projectId = ${projectList[i]} or`;
            }
            ql += ` ${projectTable}.projectId = ${projectList[projectList.length - 1]};`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
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
            for (const projectId in changeList) {
                if (changeList.hasOwnProperty(projectId)) {
                    const changeItem = changeList[projectId];
                    ql = `UPDATE ${projectTable} SET `;
                    
                    for (const ci in changeItem) {
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
                            throw error;
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