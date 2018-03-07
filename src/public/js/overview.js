var overviewElement = (function () {
    var departmentNameMap = {
        0: "NQA",
        1: "COPS"
    }

    return {
        initContainer: (containerID) => {
            $("#" + containerID).empty().append("<div id='project_overview_department'></div>")
                .append("<div id='project_overview_manager'><h2>个人项目概况</h2></div>");
        },

        addDepartment: (containerID, departmentId) => {
            var container = $("#" + containerID);
            var departmentName = departmentNameMap[departmentId + ""];
            var departmentOverview = $(`<div class='project-overview-department-cell' data-id='${departmentId}'><h2>${departmentName}</h2><p>上周已完成：XX</p><p>进行中：XX</p><p>本周新增：XX</p></div>`);
            var departmentManager = $(`<div class='project-overview-manager-cell' data-id='${departmentId}'><h3>${departmentName}</h3><table></table></div>`);

            $("#project_overview_department").append(departmentOverview);
            $("#project_overview_manager").append(departmentManager);
        },

        initDepartment: (containerID, departmentId, overviewData, managerList) => {
            console.dir(managerList)
            var container = $("#" + containerID);
            var projectNum = 0;
            var departmentOverview = $(".project-overview-department-cell").filter(function(index) {
                return this.dataset.id === departmentId;
            });
            var departmentManager = $(".project-overview-manager-cell").filter(function(index) {
                return this.dataset.id === departmentId;
            });
            var departmentTable = departmentManager.children("table");

            if (overviewData === undefined) {
                departmentOverview.children("p").eq(0).text("上周已完成： 0")
                    .end().eq(1).text("进行中： 0")
                    .end().eq(2).text("本周新增： 0");
            } else {
                departmentOverview.children("p").eq(0).text("上周已完成： " + overviewData.finished)
                    .end().eq(1).text("进行中： " + overviewData.working)
                    .end().eq(2).text("本周新增： " + overviewData.new);
            }
            
            departmentTable.empty().append("<tr><th>项目负责人</th><th>数量</th></tr>");
            if (managerList === undefined) {
                departmentTable.append($("<tr><td> - </td><td> - </td></tr>"));
            } else {
                for (const managerName in managerList) {
                    if (managerList.hasOwnProperty(managerName)) {
                        for (let i = 0; i < managerList[managerName].length; i++) {
                            if (managerList[managerName][i].projectId !== null) {
                                projectNum += 1;
                            }
                        }
                        departmentTable.append($(`<tr><td>${managerList[managerName][0].username}</td><td>${projectNum}</td></tr>`));
                    }
                }
            }
        }
    }
})();