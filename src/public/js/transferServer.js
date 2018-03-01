var serverIO = (function () {

    function ajaxSend(data, method, suffix, succ, fail) {
        if (method === 'GET') {
            $.ajax({
                type: 'GET',
                url: suffix,
                data: data,
                success: function(data) {
                    if (data.ret_code === 0) {
                        succ(data);
                    } else if (data.ret_code === 9) {
                        alert("已经离开登录状态");
                        location.reload();
                    } else {
                        alert(data.ret_msg);
                        console.error(data.ret_msg);
                        fail();
                    }
                }
            });
        } else if (method === 'POST') {
            $.ajax({
                type: 'POST',
                url: suffix,
                data: JSON.stringify(data),
                contentType: 'application/json',
                processData: false,
                success: function(data) {
                    if (data.ret_code === 0) {
                        succ(data);
                    } else if (data.ret_code === 9) {
                        alert("已经离开登录状态");
                        location.reload();                        
                    } else {
                        alert(data.ret_msg);
                        console.error(data.ret_msg);
                        fail();
                    }
                }
            });
        } else {
            console.error('Unrecognized method when transfer to server.');
        }
    }

    return {
        
        /** login */

        verifyLogin: (username, password, succ = () => {}, fail = () => {}) => {
            ajaxSend({
                op: 'login',
                opList: {
                    username: username,
                    password: password
                }
            }, 'POST', '/login', succ, fail);
        },

        signoutLogin: (succ = () => {}, fail = () => {}) => {
            ajaxSend({}, 'GET', '/signout', succ, fail);
        },

        signUp: (data, succ = () => {}, fail = () => {}) => {
            ajaxSend({
                op: 'signup',
                opList: data
            }, 'POST', '/login', succ, fail);
        },


        /** query */

        queryAllOverView: (succ = () => {}, fail = () => {}) => {
            ajaxSend({ scale: 'overview' }, 'POST', '/project', succ, fail);
        },

        queryAllProject: (succ = () => {}, fail = () => {}) => {
            ajaxSend({ scale: 'all'}, 'POST', '/project', succ, fail);
        },

        queryProjectAndManager: (succ = () => {}, fail = () => {}) => {
            ajaxSend({ scale: 'projectAndManager' }, 'POST', '/project', succ, fail);
        },

        queryAllProjectName: (succ = () => {}, fail = () => {}) => {
            ajaxSend({ scale: 'projectName' }, 'POST', '/project', succ, fail);
        },

        queryAllManagerName: (succ = () => {}, fail = () => {}) => {
            ajaxSend({ scale: 'projectManager' }, 'POST', '/project', succ, fail)
        },


        /** edit */

        addProject: (projectInfo, succ = () => {}, fail = () => {}) => {
            var editData = {
                op: 'add',
                opList: projectInfo
            }
            ajaxSend(editData, 'POST', '/edit', succ, fail);
        },

        finishProjects: (projectList, succ = () => {}, fail = () => {}) => {
            var editData = {
                op: 'finish',
                opList: projectList
            }
            ajaxSend(editData, 'POST', '/edit', succ, fail);
        },

        deleteProjects: (projectList, succ = () => {}, fail = () => {}) => {
            var editData = {
                op: 'delete',
                opList: projectList
            }
            ajaxSend(editData, 'POST', '/edit', succ, fail);
        },

        changeProjects: (changeList, succ = () => {}, fail = () => {}) => {
            var editData = {
                op: 'change',
                opList: changeList
            }
            ajaxSend(editData, 'POST', '/edit', succ, fail);
        }
    }
})();