module.exports = (function () {
    var db = require('./DB.js');
    var logMethod = require("./log.js");
    var dateCal = require('./dateCal.js');

    db.connect();
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min)) + min;
    }
    
    String.prototype.replaceAt=function(index, replacement) {
        return this.slice(0, index) + replacement+ this.slice(index + replacement.length);
    }

    return {

        gen_inviteCode: (bit = 6) => {
            let inviteCode = "" + Math.floor(Math.random() * Math.pow(10, bit));
            let convertBit = new Array(getRandomInt(0, bit)).fill(1).map(() => getRandomInt(0, 25));
            convertBit.forEach((value, index) => {
                inviteCode = inviteCode.replaceAt(getRandomInt(0, bit), getRandomInt(0, 1) ? String.fromCharCode(65 + value) : String.fromCharCode(97 + value))
            });
            return inviteCode;
        },

        loginVerif: (userInfo, res, succ) => {
            db.queryUser(userInfo.username, userInfo.password, (userId) => {
                if (userId.length < 1) {
                    logMethod.warn("Nonexistent user when login", "normal");
                    res.json({
                        ret_code: 2,
                        ret_msg: '不存在的用户'
                    });
                } else if (userId[0]["userId"] > 0) {
                    succ(userId[0]["userId"]);
                } else {
                    logMethod.error("Query_Database", "Login verif", "db");
                    res.json({
                        ret_code: 6,
                        ret_msg: '数据库修改出错'
                    });
                }
            });
        },

        loginSignup: (userInfo, res) => {
            db.isUserExisted(userInfo.username, (isExisted) => {
                if (isExisted) {
                    logMethod.error("User_Inforamtion", "Existent when sign up", "normal")
                    res.send({
                        ret_code: 2,
                        ret_msg: '用户名已存在'
                    });
                } else {
                    db.addUser(userInfo.username, userInfo.password, userInfo.department, (results) => {
                        logMethod.success("Add new user", "db");
                        res.send({
                            ret_code: 0,
                            ret_msg: '成功添加新用户'
                        });
                    });
                }
            }, () => {
                logMethod.error("Query_Database", "Sign up", "db");
                res.send({
                    ret_code: 6,
                    ret_msg: '数据库修改出错'
                });
            });
        },

        queryOverview: (loginUser, req, res) => {
            db.queryProjectTimeAbout(data => {
                var overviewData = {};
                var managerList = {};
                for (let i = 0; i < data.length; i++) {
                    // overview data
                    if (overviewData[data[i].department] === undefined) {
                        overviewData[data[i].department] = {
                            finished: 0,
                            working: 0,
                            new: 0
                        }
                    }
                    if (data[i].projectStatus === 2 && dateCal.judgeInWeek(data[i].finishTime, -1)) {
                        overviewData[data[i].department].finished += 1;
                    }
                    if (data[i].projectStatus !== 2 && data[i].projectId !== null) {
                        overviewData[data[i].department].working += 1;                        
                    }
                    if (dateCal.judgeInWeek(data[i].createTime)) {
                        overviewData[data[i].department].new += 1;
                    }

                    // managerList
                    if (managerList[data[i].department] === undefined) {
                        managerList[data[i].department] = {};
                    }
                    if (managerList[data[i].department][data[i].userId] === undefined) {
                        managerList[data[i].department][data[i].userId] = [];
                    }
                    managerList[data[i].department][data[i].userId].push({
                        projectName: data[i].projectName,
                        projectId: data[i].projectId,
                        username: data[i].username
                    });
                }

                res.json({
                    ret_code: 0,
                    ret_msg: '数据库查询成功',
                    ret_overview: overviewData,
                    ret_manager: managerList
                });
            }, () => {
                res.json({
                    ret_code: 5,
                    ret_msg: '数据库查询出错'
                });
            });
        },

        queryUser: (loginUser, req, res) => {
            db.queryUserInfo((userInfo) => {
                logMethod.success("Query all users ", "db", loginUser);
                res.json({
                    ret_code: 0,
                    ret_msg: '数据库查询成功',
                    ret_con: userInfo
                });
            }, () => {
                logMethod.error("Query_database", "All user", "db", loginUser);
                res.json({
                    ret_code: 5,
                    ret_msg: '数据库查询出错'
                });
            });
        },

        queryDepartment: (loginUser, department, req, res) => {
            db.queryDepartmentProject(department, (projectInfo) => {
                logMethod.success("Query " + department + "'s project", "db", loginUser);
                res.json({
                    ret_code: 0,
                    ret_msg: '数据库查询成功',
                    ret_con: projectInfo
                });
            }, () => {
                logMethod.error("Query_database", "All project", "db", loginUser);
                res.json({
                    ret_code: 5,
                    ret_msg: '数据库查询出错'
                });
            });
        },

        editAdd: (loginUser, info, res) => {
            db.addProject(info.userId, info.projectName, info.projectTarget, info.deadline,
                info.projectProgress, info.priority, info.milestone, (results) => {
                    logMethod.success("Add new project", "db", loginUser);
                    res.json({
                        ret_code: 0,
                        ret_msg: '数据库修改成功',
                    });
                }, () => {
                    logMethod.error("Edit_database", "Add new project", "db", loginUser);
                    res.send({
                        ret_code: 6,
                        ret_msg: '数据库修改出错'
                    });
                });
        },

        editFinish: (loginUser, finishList, res) => {
            db.finishProjects(finishList, (deleteRowsNum) => {
                logMethod.success("Finish " + finishList.length + " projects", "db", loginUser);
                res.json({
                    ret_code: 0,
                    ret_msg: '数据库修改成功',
                });
            }, () => {
                logMethod.error("Edit_database", "Finish " + finishList.length + " projects", "db", loginUser);
                res.json({
                    ret_code: 6,
                    ret_msg: '数据库修改出错'
                });
            });
        },

        editDelete: (loginUser, deleteList, res) => {
            db.deleteProjects(deleteList, (deleteRowsNum) => {
                logMethod.success("Delete " + deleteList.length + " projects", "db", loginUser);
                res.json({
                    ret_code: 0,
                    ret_msg: '数据库修改成功',
                });
            }, () => {
                logMethod.error("Edit_database", "Delete " + deleteList.length + " projects", "db", loginUser);
                res.json({
                    ret_code: 6,
                    ret_msg: '数据库修改出错'
                });
            });
        },

        editChange: (loginUser, changeList, res) => {
            db.changeProjects(changeList, (changeRows, failRows) => {
                if (changeRows.length === Object.keys(changeList).length) {
                    logMethod.success("Change some projects' information", "db", loginUser);
                    res.json({
                        ret_code: 0,
                        ret_msg: '数据库修改成功',
                    });
                } else if (failRows.length === Object.keys(changeList).length) {
                    logMethod.error("Edit_database", "change some projects' information", "db", loginUser);
                    res.json({
                        ret_code: 6,
                        ret_msg: '数据库修改出错'
                    });
                } else {
                    logMethod.warn("Some projects' information change failed", "db", loginUser);
                    res.json({
                        ret_code: 7,
                        ret_msg: '成功修改部分',
                        succRows: changeRows,
                        failRows: failRows
                    });
                }
            });
        }
    }
})();