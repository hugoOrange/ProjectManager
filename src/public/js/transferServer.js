var serverIO = (function () {
    const indexUrl = 'http://localhost:4200';

    function ajaxSend(data, method, suffix, succ, fail) {
        console.dir(data)
        if (method === 'GET') {
            $.ajax({
                type: 'GET',
                url: indexUrl + suffix,
                data: data,
                success: function(data) {
                    if (data.ret_code === 0) {
                        succ(data);
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
                url: indexUrl + suffix,
                data: JSON.stringify(data),
                contentType: 'application/json',
                processData: false,
                success: function(data) {
                    if (data.ret_code === 0) {
                        succ(data);
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
        
        verifyLogin: (username, password, succ = () => {}, fail = () => {}) => {
            ajaxSend({
                username: username,
                password: password
            }, 'POST', '/login', succ, fail);
        },

        signoutLogin: (succ = () => {}, fail = () => {}) => {
            ajaxSend({}, 'GET', '/signout', succ, fail);
        },

        signUp: (data, succ = () => {}, fail = () => {}) => {
            ajaxSend(data, 'POST', '/signup', succ, fail);
        },

        queryProject: (succ = () => {}, fail = () => {}) => {
            ajaxSend({}, 'POST', '/project', succ, fail);
        },

        queryAllProjectName: (succ = () => {}, fail = () => {}) => {
            ajaxSend({}, 'POST', '/projectName', succ, fail);
        },

        queryAllManagerName: (succ = () => {}, fail = () => {}) => {
            ajaxSend({}, 'POST', '/managerName', succ, fail)
        },

        addProject: (projectInfo, succ = () => {}, fail = () => {}) => {
            ajaxSend(projectInfo, 'POST', '/addProject', succ, fail);
        },

        deleteProjects: (projectList, succ = () => {}, fail = () => {}) => {
            ajaxSend(projectList, 'POST', '/deleteProjects', succ, fail);
        },

        changeProjects: (changeList, succ = () => {}, fail = () => {}) => {
            ajaxSend(changeList, 'POST', '/changeProjects', succ, fail);
        }
    }
})();