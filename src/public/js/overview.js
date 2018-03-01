var overviewElement = (function () {
    var departmentNameMap = {
        0: "NQA",
        1: "COPS"
    }

    return {
        initContainer: (containerID) => {
            $("#" + containerID).append("<div id='project_overview_department'></div>")
                .append("<div id='project_overview_manager'><h2>个人项目概况</h2></div>");
        },

        addDepartment: (containerID, departmentId) => {
            var container = $("#" + containerID);
            var departmentName = departmentName[departmentId];
            var departmentOverview = $(`<div class='project-overview-department-cell' data-id='${departmentId}'><h2>${departmentName} 部门</h2><p>上周已完成：XX</p><p>进行中：XX</p><p>本周新增：XX</p></div>`);
            var departmentManager = $(`<div class='project-overview-manager-cell' data-id='${departmentId}'><h3>${departmentName} 部门</h3><table></table></div>`);

            if (containerID.children().length === 0) {
                overviewElement.initContainer();
            }

            $("#project_overview_department").append(departmentOverview).append(departmentManager);
        },

        initDepartment: (containerID, departmentId, overviewData, managerList) => {
            var container = $("#" + containerID);
            var departmentOverview = $(".project-overview-department-cell").filter(index => {
                return this.dataset.id === departmentId;
            });
            var departmentManager = $(".project-overview-manager-cell").filter(index => {
                return this.dataset.id === departmentId;
            });
            var departmentTable = departmentManager.children("table");

            departmentOverview.children("p").eq(0).text("上周已完成: " + overviewData.finished)
                .end().eq(1).text("进行中： " + overviewData.working)
                .end().eq(2).text("本周新增： " + overviewData.new);
            
            departmentTable.empty().append("<tr><th>项目负责人</th><th>数量</th></tr>");
            for (let i = 0; i < managerList.length; i++) {
                departmentTable.append($(`<tr><td>${managerList[i].name}</td><td>${managerList[i].num}</td></tr>`));
            }
        }
    }
})();