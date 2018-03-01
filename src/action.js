module.exports = (function () {
    var db = require('./DB.js');
    db.connect();

    var judgeInWeek = jTime => {
        // jTime: "yyyy-mm-dd"
        var seventBefore = dateCal.getDateOffset(-7);
        var nowDate = dateCal.getNowDate();
        if (jTime > seventBefore && jTime < nowDate) {
            return true;
        }
    };

    return {
        loginVerif: (userInfo, res, succ) => {
            db.queryUser(userInfo.username, userInfo.password, (userId) => {
                if (userId.length < 1) {
                    console.warn(" - Nonexistent user.");
                    res.json({
                        ret_code: 2,
                        ret_msg: '不存在的用户'
                    });
                } else if (userId[0]["userId"] > 0) {
                    succ(userId[0]["userId"]);
                } else {
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
                    res.send({
                        ret_code: 2,
                        ret_msg: '用户名已存在'
                    });
                } else {
                    db.addUser(userInfo.username, userInfo.password, userInfo.department, (results) => {
                        res.send({
                            ret_code: 0,
                            ret_msg: '成功添加新用户'
                        });
                    });
                }
            }, () => {
                res.send({
                    ret_code: 6,
                    ret_msg: '数据库修改出错'
                });
            });
        },

        queryOverview: (loginUser, req, res) => {
            db.queryProjectTimeAbout(data => {
                var overviewData = {};
                for (let i = 0; i < data.length; i++) {
                    if (overviewData[data[i].department] === undefined) {
                        overviewData[data[i].department] = {
                            finished: 0,
                            working: 0,
                            new: 0
                        }
                    }
                    if (data[i].projectStatus === 2 && judgeInWeek(data[i].finishTime.slice(0, 10))) {
                        overviewData[data[i].department].finished += 1;
                    }
                    if (data[i].projectStatus !== 2) {
                        overviewData[data[i].department].working += 1;                        
                    }
                    if (judgeInWeek(data[i].createTime().slice(0, 10))) {
                        overviewData[data[i].department].new += 1;
                    }
                }

                res.json({
                    ret_code: 0,
                    ret_msg: '数据库查询成功',
                    ret_data: overviewData
                });
            }, () => {
                res.json({
                    ret_code: 5,
                    ret_msg: '数据库查询出错'
                });
            });
        },

        queryAll: (loginUser, req, res) => {
            db.queryAllProject((projectInfo) => {
                res.json({
                    ret_code: 0,
                    ret_msg: '数据库查询成功',
                    ret_con: projectInfo
                });
            }, () => {
                res.json({
                    ret_code: 5,
                    ret_msg: '数据库查询出错'
                });
            });
        },

        qureyProjectName: (loginUser, req, res) => {
            db.queryAllProjectName(loginUser, (nameList) => {
                var l = nameList.map((val, index) => {
                    return val.projectName;
                });
                res.send({
                    ret_code: 0,
                    ret_msg: '数据库查询成功',
                    ret_con: l
                });
            }, () => {
                res.json({
                    ret_code: 5,
                    ret_msg: '数据库查询出错'
                });
            });
        },

        queryProjectManager: (loginUser, req, res) => {
            db.queryAllManagerName(loginUser, (nameList) => {
                var l = nameList.map((val, index) => {
                    return val.projectManager;
                });
                res.send({
                    ret_code: 0,
                    ret_msg: '数据库查询成功',
                    ret_con: l.filter((val, index) => {
                            return l.indexOf(val) === index;
                        })
                });
            }, () => {
                res.send({
                    ret_code: 5,
                    ret_msg: '数据库查询出错'
                });
            });
        },

        editAdd: (loginUser, info, res) => {
            db.addProject(loginUser, info.projectStatus, info.projectName, info.projectTarget, info.projectManager, info.deadline,
                info.projectProgress, info.priority, (results) => {
                    res.json({
                        ret_code: 0,
                        ret_msg: '数据库修改成功',
                    });
                }, () => {
                    res.send({
                        ret_code: 6,
                        ret_msg: '数据库修改出错'
                    });
                });
        },

        editFinish: (loginUser, finishList, res) => {
            db.finishProjects(loginUser, finishList, (deleteRowsNum) => {
                res.json({
                    ret_code: 0,
                    ret_msg: '数据库修改成功',
                });
            }, () => {
                res.json({
                    ret_code: 6,
                    ret_msg: '数据库修改出错'
                });
            });
        },

        editDelete: (loginUser, deleteList, res) => {
            db.deleteProjects(loginUser, deleteList, (deleteRowsNum) => {
                res.json({
                    ret_code: 0,
                    ret_msg: '数据库修改成功',
                });
            }, () => {
                res.json({
                    ret_code: 6,
                    ret_msg: '数据库修改出错'
                });
            });
        },

        editChange: (loginUser, changeList, res) => {
            db.changeProjects(loginUser, changeList, (changeRows, failRows) => {
                if (changeRows.length === Object.keys(changeList).length) {
                    res.json({
                        ret_code: 0,
                        ret_msg: '数据库修改成功',
                    });
                } else if (failRows.length === Object.keys(changeList).length) {
                    res.json({
                        ret_code: 6,
                        ret_msg: '数据库修改出错'
                    });
                } else {
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