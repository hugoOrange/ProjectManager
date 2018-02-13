module.exports = (function() {
    const mysql = require('mysql');
    const config = require('./config');
    var connection = null;
    const userTable = 'User';
    const projectTable = 'Project';

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
            const ql = `select userId from ${userTable} where ${userTable}.username = "${username}" and ${userTable}.password = ${password}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
                }

                console.log(" # Successfully query user from database");
                succ(results);
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
                succ(results);
            });
        },

        queryProject: (userId, succ, fail = () => {})=> {
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
        }
    }
})();