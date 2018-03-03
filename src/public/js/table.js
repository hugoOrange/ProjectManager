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
        color: "#d3d623",
        text: "中"
    }, {
        color: "blue",
        text: "低"
    }];
    const statusFiltMap = [{
        class: "all-arrow",
        title: "查看全部项目",
        filt: ""
    }, {
        class: "finish-arrow",
        title: "查看已完成项目",
        filt: "已完成"
    }, {
        class: "normal-arrow",
        title: "查看正常进度项目",
        filt: "正常"
    }, {
        class: "delay-arrow",
        title: "查看延期项目",
        filt: "延期"
    }];

    var changeRecord = {};

    // private method 
    function comparePriority(a, b) {
        if (a === "高") {
            return true;
        } else if (b === "高") {
            return false;
        } else if (a === "中") {
            return true;
        } else if (b === "中") {
            return false;
        } else {
            return true;
        }
    }

    // private method
    function getNowDate() {
        return new Date().toISOString().slice(0, 10);
    }
    
    // private method
    function getNowDateFixed (bit = 10, offset = 0) {
        var day = new Date();
        var nextDay = new Date(day);
        nextDay.setDate(day.getDate() + offset);
        return nextDay.toISOString().slice(0, bit);
    }

    // private method
    function valueChangeRecord(tableId, changeRecord) {
        changeRecord = {};
        var changeProjectId = -1;

        $("#" + tableId + " tr").each((index, val) => {
            if (index > 1) {
                $(val).children("td").each((i, v) => {
                    // attention: there exists all attribute except projectProgress
                    if (i === 0) {
                        // projectStatus
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["projectStatus"] = $(event.target).val();
                        });
                    } else if (i === 1) {
                        // projectName
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["projectName"] = $(event.target).val();
                        });
                    } else if (i === 2) {
                        // projectTarget
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["projectTarget"] = $(event.target).val() || ".";
                        });
                    } else if (i === 3) {
                        // projectManager
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["projectManager"] = $(event.target).val();
                        });
                    } else if (i === 4) {
                        // deadline
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["deadline"] = $(event.target).val() || getNowDateFixed(10);
                        });
                    } else if (i === 6) {
                        // priority
                        $(v).children(".project-edit-mode").on("change", event => {
                            changeProjectId = val.dataset.id;
                            if (changeRecord[changeProjectId] === undefined) {
                                changeRecord[changeProjectId] = {};
                            }
                            changeRecord[changeProjectId]["priority"] = $(event.target).val();
                        });
                    }
                });
            }
        });
    };

    return {
        initTable: (tableId) => {
            $("#" + tableId).empty().show().append(`
            <tr>
                <th>项目状态<button id="status_sort" class="all-arrow" title="查看全部项目"></button></th>
                <th>项目名称</th>
                <th>项目目的</th>
                <th>项目负责人</th>
                <th>预计完成时间<button id="deadline_sort" class="top-arrow"></button></th>
                <th>目前进度</th>
                <th>优先度<button id="priority_sort" class="top-arrow"></button></th>
                <th id="choose_all">
                    <button></button>
                    <p>全选</p>
                </th>
            </tr>
            <tr id="manager_mission_edit">
                <td>
                    <select name="staus" id="new_projectStatus" value="0" disabled>
                        <option value="0">正常</option>
                        <option value="1">延期</option>
                    </select>
                </td>
                <td>
                    <p style="color:red;">*</p>
                    <input type="text" name="projectName" id="new_projectName" placeholder="请输入6-30位字符">
                </td>
                <td>
                    <input type="text" name="projectTarget" id="new_projectTarget" placeholder="可为空">
                </td>
                <td>
                    <p style="color:red;">*</p>
                    <input type="text" name="projectManager" id="new_projectManager">
                </td>
                <td>
                    <input type="date" name="deadline" id="new_deadline">
                </td>
                <td><div id="new_projectProgress"></div></td>
                <td>
                    <select name="priority" id="new_priority" value="0">
                        <option value="0">高</option>
                        <option value="1">中</option>
                        <option value="2">低</option>
                    </select>
                </td>
            </tr>
            `);
            progressElement.createProgressInput(document.querySelector("#new_projectProgress"));
            tableOperation.bindEvent(tableId);
        },

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
            valueChangeRecord();
        },

        changeInWatchMode: (tableId) => {
            $(".project-watch-mode").show();
            $(".project-edit-mode").hide();
            changeRecord = {};
        },

        getValueAdd: (tableId) => {
            var addEle = $("#" + tableId).children("tr").eq(1).children("td");
            console.log(addEle)
            let name = addEle.eq(1).children("input").val();
            let target = addEle.eq(2).children("input").val() || ".";
            let manager = addEle.eq(3).children("input").val();
            let deadline = addEle.eq(4).children("input").val() || getNowDateFixed(10);
            let progressText = progressElement.getProgressInputText(document.querySelector("#new_projectProgress")) ||
                (getNowDateFixed(10) + " - .");
            let priority = addEle.eq(6).children("select").val();

            if(name.search(/\<|\>/) !== -1 || name.length < 5 || name.length > 31) {
                alert("不规范的项目文件名");
                console.error("Invalid project name");
                return {};
            }
            if(manager.search(/\<|\>|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\s/) !== -1 || manager === "" || manager.length > 31) {
                alert("不规范的项目负责人姓名");
                console.error("Invalid project manager name");
                return {};
            }

            return {
                projectName: name,
                projectTarget: target,
                projectManager: manager,
                deadline: deadline,
                projectProgress: progressText,
                priority: priority
            };
        },

        getValueChange: (tableId) => {
            let cr = progressElement.getChangeRecord();
            let progressChangeId = -1;
            var pStr = "";
            $("#manager_mission tr").each((index, val) => {
                progressChangeId = val.dataset.id;
                if (index > 1 && cr[progressChangeId] !== undefined) {
                    if (changeRecord[progressChangeId] === undefined) {
                        changeRecord[progressChangeId] = {};
                    }
                    changeRecord[progressChangeId]["projectProgress"] = progressElement.getProgressEditText($(val).children("td").eq(5).children(".project-edit-mode"));
                }
            });

            return changeRecord;
        },

        lineStickTop: (tableId, id) => {
            let focusEle = null;
            let firstEle = $("#manager_mission tr:nth-child(3)");

            if (id == firstEle[0].dataset.id) {
                return;
            }
            $("#" + tableId).children("tr").each((index, val) => {
                if (val.dataset.id === id) {
                    focusEle = $(val);
                }
            });
            window.scrollTo(0, 0);
            $("#manager_mission").append(firstEle.clone());
            firstEle.replaceWith(focusEle);
        },

        getDelay: (tableId, delay) => {
            let wellDate = getNowDateFixed(10, delay);
            let nowDate = getNowDateFixed(10);
            var deadline = "";
            var pName = "";
            var mName = "";
            var pId = -1;
            var mayDelay = [];
            var isDelay = [];
            var btnEvent = event => {
                tableOperation.lineStickTop(tableId, event.target.dataset.id);
            }

            $("#" + tableId + " tr").each((index, val) => {
                if (index > 1 && !$(val).is(":hidden")) {
                    deadline = $(val).children("td").eq(4).children(".project-watch-mode").text();
                    pName = $(val).children("td").eq(1).children(".project-watch-mode").text();
                    mName = $(val).children("td").eq(3).children(".project-watch-mode").text();
                    pId = val.dataset.id;
                    if ($(val).children("td").eq(0)[0].dataset.store !== "2") {
                        if (deadline < nowDate) {
                            // project delay
                            isDelay .push({
                                id: pId,
                                mName: mName,
                                pName: pName
                            });
                        } else {
                            if (deadline < wellDate) {
                                // maybe delayed
                                mayDelay.push({
                                    id: pId,
                                    mName: mName,
                                    pName: pName
                                });
                            }
                            // else: normal
                        }
                    }
                }
            });
            return {
                isDelay: isDelay,
                mayDelay: mayDelay
            }
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

        filtLine: (tableId, filtFunc) => {
            $("#" + tableId + " tr").each((index, val) => {
                if (index > 1) {
                    if(filtFunc(val)) {
                        $(val).hide();
                    } else {
                        $(val).show();
                    }
                }
            });
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
                        if (x === y) {
                            continue;
                        }
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
        },


        bindEvent: (tableId) => {
            $("#status_sort").click(event => {
                for (let i = 0; i < statusFiltMap.length; i++) {
                    if (event.target.classList.contains(statusFiltMap[i].class)) {
                        event.target.classList.remove(statusFiltMap[i].class);
                        event.target.classList.add(statusFiltMap[(i + 1) % statusFiltMap.length].class);
                        $(event.target).attr("title", statusFiltMap[(i + 1) % statusFiltMap.length].title);
                        tableOperation.filtLine(tableId, val => ($(val).children("td").eq(0).children(".project-watch-mode").text() !== statusFiltMap[i].filt) && statusFiltMap[i].filt !== "");
                        break;
                    }
                }
            });

            $("#deadline_sort").click(event => {
                if (event.target.classList.contains("top-arrow")) {
                    tableOperation.sortLineAccordingVal(4, false);
                    event.target.classList.remove("top-arrow");
                    event.target.classList.add("bottom-arrow");
                } else {
                    tableOperation.sortLineAccordingVal(4, true);
                    event.target.classList.remove("bottom-arrow");
                    event.target.classList.add("top-arrow");
                }
            });

            $("#priority_sort").click(event => {
                if (event.target.classList.contains("top-arrow")) {
                    tableOperation.sortLineAccordingVal(6, false);
                    event.target.classList.remove("top-arrow");
                    event.target.classList.add("bottom-arrow");
                } else {
                    tableOperation.sortLineAccordingVal(6, true);
                    event.target.classList.remove("bottom-arrow");
                    event.target.classList.add("top-arrow");
                }
            });

            $("#choose_all button").click(event => {
                let btn = $("#choose_all p");
                if ($(btn).text() === "全选") {
                    $(btn).text("全不选");
                    $(event.target).css("background", "#2568b4");
                    tableOperation.chooseAllDelete();
                } else {
                    $(btn).text("全选");
                    $(event.target).css("background", "#ffffff");
                    tableOperation.chooseZeroDelete();
                }
            });
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