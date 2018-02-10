var tableOperation = (function () {
    const status = ["red", "yellow", "blue", "green"];

    return {
        addProject: (projectsInfo, tableEle) => {
            for (let i = 0; i < projectsInfo.length; i++) {
                tableOperation.addMilestone(projectsInfo[i], tableEle);
            }
        },

        addMilestone: (milestone, tableEle) => {
            var tr = $(`
            <tr>
                <td>${milestone.projectName}</td>
                <td>${milestone.projectManager}</td>
                <td>${milestone.projectProgress}</td>
                <td>${milestone.deadline}</td>
                <td>${milestone.description}</td>
                <td><p class="project-status" data-status="${milestone.priority}"></p></td>
            </tr>`);
            tableEle.append(tr);
        },

        statusColorReset: (tableId) => {
            $(`#${tableId} tr td:nth-child(6) p`).each((index, ele) => {
                let color = status[ele.dataset.status];
                $(ele).css("background", color);
            });
        }
    }
})();