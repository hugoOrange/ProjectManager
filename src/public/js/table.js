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

    return {
        addProjects: (projectsInfo, tableEle) => {
            for (let i = 0; i < projectsInfo.length; i++) {
                tableOperation.addProject(projectsInfo[i], tableEle);
            }
        },

        addProject: (project, tableEle) => {
            var tr = $(`
            <tr data-id="${project.projectId}">
                <td data-status="${project.projectStatus}">${project.projectStatus}</td>
                <td>${project.projectName}</td>
                <td>${project.projectTarget}</td>
                <td>${project.projectManager}</td>
                <td>${project.deadline}</td>
                <td class="project-progress" data-progress="${project.projectProgress}">
                    <button class="project-progressShow"></button>
                    <p></p>
                </td>
                <td><p class="project-priority" data-priority="${project.priority}"></p></td>
            </tr>`);
            tableEle.append(tr);
        },

        statusSet: (tableId) => {
            $(`#${tableId} tr td:nth-child(1)`).each((index, ele) => {
                if (index === 0) {
                    return;
                }
                let s = ele.dataset.status;
                if (s > statusMap.length) {
                    s = statusMap[statusMap.length - 1];
                }
                $(ele).css("color", statusMap[s].color);
                $(ele).text(statusMap[s].text);
            });
        },

        progressSet: (tableId) => {
            $(`#${tableId} tr td:nth-child(6) p`).each((index, ele) => {
                let p = ele.parentNode.dataset.progress.split(progressSep).pop();
                $(ele).text(p);
            });
            $(`#${tableId} tr td:nth-child(6) button`).click(event => {
                let ele = event.target;
                let p;
                if ($(ele.parentNode).children("p").text().search("\n") === -1) {
                    p = ele.parentNode.dataset.progress.split(progressSep).join("\n");
                    $(ele).css("background-image", 'url("/assets/minus.svg")');
                } else {
                    p = ele.parentNode.dataset.progress.split(progressSep).pop();
                    $(ele).css("background-image", 'url("/assets/plus.svg")');
                }
                $(ele.parentNode).children("p").text(p);
            });
        },

        prioritySet: (tableId) => {
            $(`#${tableId} tr td:nth-child(7) p`).each((index, ele) => {
                let p = ele.dataset.priority;
                if (p > priorityMap.length) {
                    p = priorityMap[priorityMap.length - 1];
                }
                $(ele).css("color", priorityMap[p].color);
                $(ele).text(priorityMap[p].text);
            });
        }
    }
})();