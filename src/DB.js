module.exports = (function() {
    const mysql = require('mysql');
    const config = require('./config');
    var connection = null;
    const userTable = 'User';
    const projectTable = 'Project';
    const milestoneTable = 'Milestone';

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
            const ql = `select * from ${projectTable} left join ${milestoneTable} on ${projectTable}.projectId = ${milestoneTable}.projectId`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
                }

                console.log(" # Successfully query all projects from database");
                succ(results);
            });
        },

        queryProject: (userId, succ, fail = () => {})=> {
            const ql = `select * from ${projectTable} left join ${milestoneTable} on ${projectTable}.projectId = ${milestoneTable}.projectId where ${projectTable}.userId = ${userId}`;
            connection.query(ql, function (error, results, fields) {
                if (error) {
                    fail();
                    throw error;
                }

                console.log(" # Successfully query project from database");
                succ(results);
            });
        }
    }
})();