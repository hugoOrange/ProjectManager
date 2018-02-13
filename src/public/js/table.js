var tableOperation = (function () {
    const statusMap = [{
        color: "green",
        text: "正常",
    }, {
        color: "yellow",
        text: "延期",
    }];
    const progressSep = "^#^";
    const priorityMap = [{
        color: "red",
        text: "高"
    }, {
        color: "yellow",
        text: "中"
    }, {
        color: "blue",
        text: "低"
    }];

    // private method
    function giveEditModeElementVal(td) {
        let p = $(td).children(".project-watch-mode").text();
        let pTo = $(td).children(".project-edit-mode");
        if (pTo[0] === undefined) {
            return;
        }
        if (pTo[0].tagName === "TEXTAREA") {
            // edit projectName, projectManager, projectTarget
            pTo.text(p);
        } else if (pTo[0].tagName === "SELECT") {
            // edit projectStatus, projectPriority
            pTo.val(td.dataset.store);
        } else if (pTo.tagName === "INPUT") {
            // edit deadline
            pTo.val(p);
        }
    }

    return {
        addProjects: (projectsInfo, tableEle) => {
            for (let i = 0; i < projectsInfo.length; i++) {
                tableOperation.addProject(projectsInfo[i], tableEle);
            }
        },

        addProject: (project, tableEle) => {
            var tr = $(`
            <tr data-id="${project.projectId}">
                <td data-store="${project.projectStatus}">
                    <p class="project-watch-mode"></p>
                    <select class="project-edit-mode">
                        <option value="0">正常</option>
                        <option value="1">延期</option>
                    </select>
                </td>
                <td>
                    <p class="project-watch-mode">${project.projectName}</p>
                    <textarea class="project-edit-mode"></textarea>
                </td>
                <td>
                    <p class="project-watch-mode">${project.projectTarget}</p>
                    <textarea class="project-edit-mode"></textarea>
                </td>
                <td>
                    <p class="project-watch-mode">${project.projectManager}</p>
                    <textarea class="project-edit-mode"></textarea>
                </td>
                <td>
                    <p class="project-watch-mode">${project.deadline}</p>
                    <input class="project-edit-mode" type="date">
                </td>
                <td class="project-progress" data-progress="${project.projectProgress}">
                    <button class="project-progressShow"></button>
                    <div class="project-watch-mode"></div>
                    <div class="project-edit-mode"></div>
                </td>
                <td data-store="${project.priority}">
                    <p class="project-priority project-watch-mode"></p>
                    <select class="project-edit-mode">
                        <option value="0">高</option>
                        <option value="1">中</option>
                        <option value="2">低</option>
                    </select>
                </td>
            </tr>`);
            tableEle.append(tr);
        },

        statusSet: (tableId) => {
            $(`#${tableId} tr td:nth-child(1)`).each((index, ele) => {
                if (index === 0) {
                    return;
                }
                let s = ele.dataset.store;
                if (s > statusMap.length) {
                    s = statusMap[statusMap.length - 1];
                }
                $(ele).children(".project-watch-mode").css("color", statusMap[s].color);
                $(ele).children(".project-watch-mode").text(statusMap[s].text);
            });
        },

        progressSet: (tableId) => {
            $(`#${tableId} tr td:nth-child(6) div.project-watch-mode`).each((index, ele) => {
                let p = ele.parentNode.dataset.progress.split(progressSep);
                for (let i = 0; i < p.length; i++) {
                    $(ele).append($("<p></p>").text(p[i]).hide());
                }
                $(ele).children("p").last().show();
            });
            $(`#${tableId} tr td:nth-child(6) button`).click(event => {
                let ele = $(event.target.parentNode).children(".project-watch-mode").children("p")
                if (ele.first().is(":hidden")) {
                    ele.show();
                    $(event.target).css("background-image", 'url("/assets/minus.svg")');
                } else {
                    ele.hide();
                    ele.last().show();
                    $(event.target).css("background-image", 'url("/assets/plus.svg")');
                }
            });
        },

        prioritySet: (tableId) => {
            $(`#${tableId} tr td:nth-child(7)`).each((index, ele) => {
                if (index === 0) {
                    return;
                }
                let p = ele.dataset.store;
                if (p > priorityMap.length) {
                    p = priorityMap[priorityMap.length - 1];
                }
                $(ele).children(".project-watch-mode").css("color", priorityMap[p].color);
                $(ele).children(".project-watch-mode").text(priorityMap[p].text);
            });
        },

        changeInEditMode: (tableId) => {
            $(".project-watch-mode").hide();
            $(".project-edit-mode").show();
            $(`#${tableId} tr td`).each((index, val) => {
                if (index < 7) {
                    return;
                }
                giveEditModeElementVal(val);
            });
        }
    }
})();

var progressElement = (function () {
    const progressSep = "^#^";
    function progressAddEvent(event) {
        let ele = event.target.parentNode.parentNode;
        progressElement.createProgressInput(ele);
    }

    function progressDeleteEvent(event) {
        if ($(".progress-line").length > 1) {
            let line = event.target.parentNode;
            $(line).remove();
        }
    }

    return {
        createProgressInput: function (wrap) {
            var div = $(`
            <div class='progress-line'>
                <input type='date' name='progressTime'>
                <input type='text' name='progressText'>
            </div>
            `);
            $(div).append($("<button class='progress-add'></button>").click(progressAddEvent))
                .append($("<button class='progress-delete'></button>").click(progressDeleteEvent));
            $(wrap).append(div);
        },

        getProgressInputText: function (wrap) {
            let p = [];
            $(wrap).children(".progress-line").each((index, val) => {
                p.push($(val).children("input[name='progressTime']").val() + " - " + $(val).children("input[name='progressText']").val());
            });
            return p;
        },

        createProgressEdit: function (wrap) {
            var div = $(`
            <div class='progress-line'>
                <input type='date' name='progressTime'>
                <input type='text' name='progressText'>
            </div>
            `);
            $(div).append($("<button class='progress-add'></button>").click(progressAddEvent))
                .append($("<button class='progress-delete'></button>").click(progressDeleteEvent));
            $(wrap).append(div);
        }
    }
})();