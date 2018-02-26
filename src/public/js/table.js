var tableOperation = (function () {
    const statusMap = [{
        color: "blue",
        text: "正常",
    }, {
        color: "red",
        text: "延期",
    }, {
        color: "green",
        text: "已完成"
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
    function comparePriority(a, b) {
        return a === "高" ? true : b === "高" ? false : a === "中" ? true : b === "中" ? false : true;
    }

    // private method
    function getNowDate() {
        return new Date().toISOString().slice(0, 10);
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
                    <select class="project-edit-mode" disabled>
                        <option value="0">正常</option>
                        <option value="1">延期</option>
                        <option value="2">已完成</option>
                    </select>
                </td>
                <td>
                    <p class="project-watch-mode">${project.projectName}</p>
                    <textarea class="project-edit-mode" rows="4"></textarea>
                </td>
                <td>
                    <p class="project-watch-mode">${project.projectTarget}</p>
                    <textarea class="project-edit-mode" rows="4"></textarea>
                </td>
                <td>
                    <p class="project-watch-mode">${project.projectManager}</p>
                    <textarea class="project-edit-mode" rows="2"></textarea>
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
                <td class="choose-part">
                    <input type="checkbox" name="project-choose" value="${project.projectId}">
                </td>
            </tr>`);
            tableEle.append(tr);
        },

        projectAttriSet: (lineEle, attri, value) => {
            let ele = null;
            switch (attri) {
                case "projectName":
                    ele = $(lineEle).children("td").eq(1);
                    ele.children(".project-watch-mode").text(value);
                    ele.children(".project-edit-mode").val(value);
                    break;
            
                case "projectTarget":
                    ele = $(lineEle).children("td").eq(2);
                    ele.children(".project-watch-mode").text(value);
                    ele.children(".project-edit-mode").val(value);
                    break;
            
                case "projectManager":
                    ele = $(lineEle).children("td").eq(3);
                    ele.children(".project-watch-mode").text(value);
                    ele.children(".project-edit-mode").val(value);
                    break;
            
                case "deadline":
                    ele = $(lineEle).children("td").eq(4);
                    ele.children(".project-watch-mode").text(value);
                    ele.children(".project-edit-mode").val(value);
                    // change projectStatus at the same time
                    lineEle.querySelector("td").dataset.store = value >= getNowDate() ? 0 : 1;
                    break;
            
                case "projectProgress":
                    ele = $(lineEle).children("td").eq(5);
                    ele.attr("data-progress", value);
                    break;
            
                case "priority":
                    ele = $(lineEle).children("td").eq(6);
                    ele.attr("data-store", value);
                    break;
            
                default:
                    break;
            }
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
                $(ele).empty();
                for (let i = 0; i < p.length; i++) {
                    $(ele).append($("<p></p>").text(p[i]).hide());
                }
                $(ele).children("p").last().show();
            });
            $(`#${tableId} tr td:nth-child(6) button.project-progressShow`).click(event => {
                let ele = $(event.target.parentNode).children(".project-watch-mode").children("p");
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
                tableOperation.giveEditModeElementVal(val);
            });
        },

        changeInWatchMode: (tableId) => {
            $(".project-watch-mode").show();
            $(".project-edit-mode").hide();
        },

        giveEditModeElementVal: (td) => {
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
            } else if (pTo[0].tagName === "INPUT") {
                // edit deadline
                pTo.val(p);
            } else if (pTo[0].tagName === "DIV") {
                // edit progress
                var pCon = "";
                var pDate = "";
                var pCount = 0;
                var pTxt = "";
                progressElement.setProgressEditNum(pTo, $(td).children(".project-watch-mode").children("p").length);
                $(td).children(".project-watch-mode").children("p").each((index, val) => {
                    pCon = $(val).text();
                    pCount = pCon.search(" - ");
                    pDate = pCon.slice(0, pCount);
                    pTxt = pCon.slice(pCount + 3);
                    $($(td).children(".project-edit-mode").children(".progress-line")[index]).children("input").val(pDate);
                    $($(td).children(".project-edit-mode").children(".progress-line")[index]).children("textarea").text(pTxt);
                });
            }
        },

        chooseAllDelete: () => {
            $(".choose-part input[name='project-choose']").attr("checked", true);
        },

        chooseZeroDelete: () => {
            $(".choose-part input[name='project-choose']").attr("checked", false);
        },

        /**
         * @param lineOffset 0~6 represent projectStatus ~ priority
         * @param order true represent sort from large to small, and false sort the opposite
         */
        sortLineAccordingVal: (lineOffset, order = true) => {
            var table, rows, switching, i, x, y, shouldSwitch;
            table = document.getElementById("manager_mission");
            switching = true;
            while (switching) {
                switching = false;
                rows = table.getElementsByTagName("TR");
                for (i = 2; i < (rows.length - 1); i++) {
                    shouldSwitch = false;
                    x = rows[i].getElementsByTagName("TD")[lineOffset].getElementsByClassName("project-watch-mode")[0].innerHTML;
                    y = rows[i + 1].getElementsByTagName("TD")[lineOffset].getElementsByClassName("project-watch-mode")[0].innerHTML;
                    if (lineOffset === 6) {
                        if ((order && comparePriority(x, y)) || (!order && comparePriority(y, x))) {
                            shouldSwitch = true;
                            break;
                        }
                    }
                    if (lineOffset === 4) {
                        if ((order && x > y) || (!order && x < y)) {
                            shouldSwitch = true;
                            break;
                        }
                    }
                }
                if (shouldSwitch) {
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                }
            }
        }
    }
})();

var progressElement = (function () {
    const progressSep = "^#^";
    var progressChangeRecord = {};

    function getNowDate() {
        return (new Date().toISOString()).slice(0, 10);
    }

    // add button event
    function addEvent(event) {
        let ele = event.target.parentNode.parentNode;

        let changeProjectId = ele.parentNode.dataset.id;
        progressChangeRecord[changeProjectId] = changeProjectId;

        progressElement.createProgressInput($(event.target.parentNode), false);
    }

    // delete button event
    function deleteEvent(event) {
        if ($(event.target.parentNode.parentNode).children(".progress-line").length > 0) {
            let line = event.target.parentNode;

            let changeProjectId = line.parentNode.parentNode.parentNode.dataset.id;
            progressChangeRecord[changeProjectId] = changeProjectId;

            $(line).remove();
            return;
        }
        alert("最小的项目进度数为1");
    }

    // date input and textarea change event
    function lineChangeEvent(event) {
        let changeProjectId = event.target.parentNode.parentNode.parentNode.parentNode.dataset.id;
        progressChangeRecord[changeProjectId] = changeProjectId;
    }

    return {
        createProgressInput: function (wrap, firstCreate = true) {
            if (firstCreate) {
                $(wrap).empty();
                $(wrap).append($("<button class='progress-add'></button>").click(addEvent));
            }
            var div = $(`
            <div class='progress-line'>
                <input type='date' name='progressTime'>
                <textarea name='progressText'></textarea>
            </div>
            `);
            $(div).append($("<button class='progress-delete'></button>").click(deleteEvent));
            $(wrap).append(div);
        },

        getProgressInputText: function (wrap) {
            let p = [];
            var d = "";
            $(wrap).children(".progress-line").each((index, val) => {
                d = $(val).children("input[name='deadline']").val() || getNowDate();;
                p.push(d + " - " + $(val).children("textarea[name='progressText']").val());
            });
            return p.join(progressSep);
        },

        getProgressEditText: function (wrap) {
            let progressText = "";
            let tmpTxt = "";
            $(wrap).children(".progress-line").each((index, val) => {
                if (index > 0) {
                    tmpTxt = progressSep;
                } else {
                    tmpTxt = "";
                }
                tmpTxt += $(val).children("input[type='date']").val() || getNowDate();
                tmpTxt += " - ";
                tmpTxt += $(val).children("textarea").val();
                progressText += tmpTxt;
            });
            return progressText;
        },

        setProgressEditNum: function (wrap, num) {
            wrap.empty();
            num = Math.max(num, 1);
            wrap.append($("<button class='progress-add'></button>").click(addEvent))
            for (let i = 0; i < num; i++) {
                wrap.append($(`<div class='progress-line'></div>`)
                            .append($(`<input type='date' name='progressTime'>`).on("change", lineChangeEvent))
                            .append($(`<textarea name='progressText' rows="4"></textarea>`).on("change", lineChangeEvent))
                            .append($("<button class='progress-delete'></button>").click(deleteEvent)));
            }
        },

        resetChangeRecord: function () {
            progressChangeRecord = {};
        },

        getChangeRecord: function () {
            return progressChangeRecord;
        }
    }
})();