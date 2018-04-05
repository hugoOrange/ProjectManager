var tableOperation = (function () {
    const statusMap = [{
        color: "#0303b3",
        text: "正常",
    }, {
        color: "#ff00dc",
        text: "延期",
    }, {
        color: "green",
        text: "已完成"
    }, {
        color: "red",
        text: "过期"
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

    var userList = [];
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
    function valueChangeRecord(tableId) {
        changeRecord = {};
        var changeProjectId = -1;

        $("#" + tableId).children("tr").each((index, val) => {
            if (index % 2 !== 0 && index > 1) {
                $(val).children("td").each((i, v) => {
                    if (i === 1) {
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
                <td><p id="new_projectStatus">---</p></td>
                <td>
                    <p style="color:red;">*</p>
                    <input type="text" name="projectName" id="new_projectName" placeholder="请输入1-100位字符">
                </td>
                <td><input type="text" name="projectTarget" id="new_projectTarget" placeholder="可为空"></td>
                <td>
                    <p style="color:red;">*</p>
                    <div id="new_projectManager"></div>
                </td>
                <td><div id="new_deadline"></div></td>
                <td><div id="new_projectProgress"></div></td>
                <td><div id="new_priority"></div></td>
            </tr>
            <tr>
                <td colspan="8"><div id="new_milestone"></div></td>
            </tr>
            `);
            datePickerElement.makeElementByEle($("#new_deadline"));
            selectElement.makeSelectByEle($("#new_priority"), ["低", "中", "高"], [2, 1, 0]);
            progressElement.createProgressInput($("#new_projectProgress"));
            milestoneElement.createMilestoneInput($("#new_milestone"), true).parent().parent().hide();
            tableOperation.bindEvent(tableId);
            serverIO.queryUser((userL) => {
                userList = userL.ret_con;
                selectElement.makeSelectByEle($("#new_projectManager").css("width", "100px"), userList.map(v => v.username), userList.map(v => v.userId));
            });
        },

        addProjects: (projectsInfo, tableEle) => {
            for (let i = 0; i < projectsInfo.length; i++) {
                if (projectsInfo[i].projectId) {
                    tableOperation.addProject(projectsInfo[i], tableEle);
                }
            }
        },

        addProject: (project, tableEle) => {
            var tr = $(`
            <tr data-id="${project.projectId}">
                <td data-store="${project.projectStatus}">
                    <p class="project-watch-mode"></p>
                    <p class="project-edit-mode"></p>
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
                    <p class="project-watch-mode">${project.username}</p>
                    <div class="project-edit-mode"></div>
                </td>
                <td class="project-deadline">
                    <p class="project-watch-mode">${project.deadline}</p>
                    <div class="project-edit-mode"></div>
                </td>
                <td class="project-progress" data-progress="${project.projectProgress.replace(/"/g, "&quot;")}">
                    <button class="project-progressShow"></button>
                    <div class="project-watch-mode"></div>
                    <div class="project-edit-mode"></div>
                </td>
                <td class="project-priority" data-store="${project.priority}">
                    <p class="project-priority project-watch-mode"></p>
                    <div class="project-edit-mode"></div>
                </td>
                <td class="choose-part">
                    <input type="checkbox" name="project-choose" value="${project.projectId}">
                </td>
            </tr>`);
            var milestoneTr = $("<tr></tr>").hide().append(`<td colspan="8"><div></div></td>`);
            datePickerElement.makeElementByEle(tr.children("td").eq(4).children(".project-edit-mode"), undefined, undefined, "d" + project.projectId);
            selectElement.makeSelectByEle(tr.children("td").eq(3).children(".project-edit-mode"), userList.map(v => v.username), userList.map(v => v.userId), "m" + project.projectId);
            selectElement.makeSelectByEle(tr.children("td").eq(6).children(".project-edit-mode"), ["低", "中", "高"], [2, 1, 0], "p" + project.projectId);
            milestoneElement.createMilestone(milestoneTr.children("td").children("div"), true, project.projectId);
            milestoneElement.valInWatch(milestoneTr.children("td").children(".milestoneJS"), project.projectId, project.milestone);
            tableEle.append(tr).append(milestoneTr);
        },

        statusSet: (tableId) => {
            $(`#${tableId} tr td:nth-child(1)`).each((index, ele) => {
                if (ele.dataset.store !== undefined) {
                    let s = ele.dataset.store;
                    if (s > statusMap.length) {
                        s = statusMap[statusMap.length - 1];
                    }
                    $(ele).children(".project-watch-mode").css("color", statusMap[s].color);
                    $(ele).children(".project-watch-mode").text(statusMap[s].text);
                }
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
                var ele = $(event.target).parent().children(".project-watch-mode").children("p");
                var tr = $(event.target).parent().parent();
                if (tr.next().is(":hidden")) {
                    ele.show();
                    tr.next().show();
                    $(event.target).css("background-image", 'url("/assets/minus.svg")');
                } else {
                    ele.hide();
                    ele.last().show();
                    tr.next().hide();
                    $(event.target).css("background-image", 'url("/assets/plus.svg")');
                }
            });
        },

        prioritySet: (tableId) => {
            $(`#${tableId} tr td:nth-child(7)`).each((index, ele) => {
                if (ele.dataset.store !== undefined) {
                    let p = ele.dataset.store;
                    if (p > priorityMap.length) {
                        p = priorityMap[priorityMap.length - 1];
                    }
                    $(ele).children(".project-watch-mode").css("color", priorityMap[p].color);
                    $(ele).children(".project-watch-mode").text(priorityMap[p].text);
                }
            });
        },

        changeInEditMode: (tableId) => {
            var mEle = null;
            $(".project-watch-mode").hide();
            $(".project-edit-mode").show();
            $("#" + tableId).children("tr").each((index, val) => {
                if (index % 2 !== 0 && index > 1 && !$(val).is(":hidden")) {
                    tableOperation.giveEditModeElementVal($(val), val.dataset.id);
                    $(val).next().show();
                    mEle = $(val).next().children("td").children(".milestoneJS");
                    milestoneElement.valInEdit(mEle, val.dataset.id, milestoneElement.valInWatch(mEle, val.dataset.id));
                    milestoneElement.beInEditMode(mEle, val.dataset.id);
                }
            });
            valueChangeRecord(tableId);
        },

        changeInWatchMode: (tableId) => {
            $(".project-watch-mode").show();
            $(".project-edit-mode").hide();
            $("#" + tableId).children("tr").each((index, val) => {
                if (index > 1 && index % 2 === 0) {
                    $(val).hide();
                    if (index > 2) {
                        milestoneElement.beInWatchMode($(val).children("td").children(".milestoneJS"));
                    }
                }
            });
            changeRecord = {};
            progressElement.resetChangeRecord();
            selectElement.resetChangeRecord();
            milestoneElement.resetChangeRecord();
            datePickerElement.resetChangeRecord();
        },

        getValueAdd: (tableId) => {
            var addEle = $("#" + tableId).children("tr").eq(1).children("td");
            let name = addEle.eq(1).children("input").val();
            let target = addEle.eq(2).children("input").val() || ".";
            let manager = selectElement.selectValByEle(addEle.eq(3).children(".selectJS"));
            let deadline = datePickerElement.valueByEle(addEle.eq(4).children(".datePickerJS"));
            let progressText = progressElement.getProgressInputText($("#new_projectProgress"));
            let priority = selectElement.selectValByEle(addEle.eq(6).children(".selectJS"));
            let milestone = milestoneElement.valInEdit($("#" + tableId).children("tr").eq(2).children("td").children(".milestoneJS"));

            if(name.search(/\<|\>/) !== -1 || name.length < 1 || name.length > 31) {
                alert("不规范的项目文件名");
                console.error("Invalid project name");
                return {};
            }

            return {
                projectName: name,
                projectTarget: target,
                deadline: deadline,
                projectProgress: progressText,
                priority: priority,
                userId: manager,
                milestone: milestone
            };
        },

        getValueChange: (tableId) => {
            let crP = progressElement.getChangeRecord();
            let crS = selectElement.getChangeRecord();
            let crD = datePickerElement.getChangeRecord();
            let crM = milestoneElement.getChangeRecord();
            let changeId = -1;
            var pStr = "";
            $("#" + tableId).children("tr").each((index, val) => {
                changeId = val.dataset.id;
                if (index % 2 !== 0 && index > 1 && !$(val).is(":hidden")) {
                    if (crP[changeId] !== undefined || crD["p" + changeId] !== undefined) {
                        if (changeRecord[changeId] === undefined) {
                            changeRecord[changeId] = {};
                        }
                        changeRecord[changeId]["projectProgress"] = progressElement.getProgressInputText($(val).children("td").eq(5).children(".project-edit-mode"));
                    }
                    if (crM[changeId] !== undefined || crD["m" + changeId] !== undefined || crS["s" + changeId] !== undefined) {
                        if (changeRecord[changeId] === undefined) {
                            changeRecord[changeId] = {};
                        }
                        changeRecord[changeId]["milestone"] = milestoneElement.valInEdit($(val).next().children("td").children(".milestoneJS"));
                    }
                    if (crS["p" + changeId] !== undefined) {
                        if (changeRecord[changeId] === undefined) {
                            changeRecord[changeId] = {};
                        }
                        changeRecord[changeId]["priority"] = crS["p" + changeId];
                    }
                    if (crS["m" + changeId] !== undefined) {
                        if (changeRecord[changeId] === undefined) {
                            changeRecord[changeId] = {};
                        }
                        changeRecord[changeId]["userId"] = crS["m" + changeId];
                    }
                    if (crD["d" + changeId] !== undefined) {
                        if (changeRecord[changeId] === undefined) {
                            changeRecord[changeId] = {};
                        }
                        changeRecord[changeId]["deadline"] = crD["d" + changeId];
                    }
                }
            });
            for (const key in changeRecord) {
                if (changeRecord.hasOwnProperty(key)) {
                    for (const key2 in changeRecord[key]) {
                        if (changeRecord[key].hasOwnProperty(key2)) {
                            changeRecord[key][key2] = changeRecord[key][key2].replace(/\\/g, "\\\\");
                            changeRecord[key][key2] = changeRecord[key][key2].replace(/"/g, "\\\"");
                        }
                    }                    
                }
            }
            return changeRecord;
        },

        lineStickTop: (tableId, id) => {
            var tableEle = document.getElementById(tableId);
            var archor = tableEle.childNodes[7];
            var focusEle = null;
            var focusMileStone = null;
            
            for (let i = 0; i < tableEle.childNodes.length; i++) {
                if (tableEle.childNodes[i].dataset !== undefined && tableEle.childNodes[i].dataset.id === id) {
                    focusEle = tableEle.childNodes[i];
                    focusMileStone = focusEle.nextElementSibling;
                    break;
                }
            }
            if (focusEle === archor) {
                $(focusEle).show();
                return;
            } else {
                tableEle.insertBefore(focusEle, archor);
                tableEle.insertBefore(focusMileStone, archor);
                $(focusEle).show();
            }
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

            $("#" + tableId).children("tr").each((index, val) => {
                if (index % 2 !== 0 && index > 1 && !$(val).is(":hidden")) {
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

        giveEditModeElementVal: (tr, id) => {
            var eleW = null;
            var eleE = null;
            var t = [];

            tr.children("td").each((i, val) => {
                eleW = $(val).children(".project-watch-mode");
                eleE = $(val).children(".project-edit-mode");
                if (i === 0) {
                    eleE.text(" - ")
                }
                if (i === 1 || i === 2) {
                    eleE.val(eleW.text());
                }
                if (i === 3) {
                    selectElement.selectValByEle(eleE, eleW.text());
                }
                if (i === 4) {
                    datePickerElement.valueByEle(eleE, eleW.text());
                }
                if (i === 5) {
                    eleW.children("p").each((j, v) => t.push($(v).text()));
                    progressElement.setProgressEditContent(eleE, t.join(progressSep), id);
                }
                if (i === 6) {
                    selectElement.selectValByEle(eleE, eleW.text());
                }
            });
        },

        chooseAllDelete: () => {
            $(".choose-part input[name='project-choose']").attr("checked", true);
        },

        chooseZeroDelete: () => {
            $(".choose-part input[name='project-choose']").attr("checked", false);
        },

        filtLine: (tableId, filtFunc, hideMilestone = false) => {
            $("#" + tableId).children("tr").each((index, val) => {
                if (index % 2 !== 0 && index > 1) {
                    if(filtFunc(val)) {
                        $(val).hide();
                        $(val).next().hide();
                    } else {
                        $(val).show();
                    }
                } else if (hideMilestone && index > 1) {
                    $(val).hide();
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
                rows = Array.prototype.slice.call(table.childNodes).filter((v, i) => v.tagName === "TR");
                for (i = 3; i < (rows.length - 2); i+=2) {
                    shouldSwitch = false;
                    x = rows[i].getElementsByTagName("TD")[lineOffset].getElementsByClassName("project-watch-mode")[0].innerHTML;
                    y = rows[i + 2].getElementsByTagName("TD")[lineOffset].getElementsByClassName("project-watch-mode")[0].innerHTML;
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
                    rows[i].parentNode.insertBefore(rows[i + 2], rows[i]);
                    rows[i].parentNode.insertBefore(rows[i + 3], rows[i]);
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
        }, 

        deleteLineById: (tableId, id) => {
            $("#" + tableId + " tr").each((i, v) => {
                if (v.dataset.id === id) {
                    $(v).next().remove();
                    $(v).remove();
                    return;
                }
            });
        },

        deleteLineByEle: (ele) => {
            $(ele).next().remove();
            $(ele).remove();
        }
    }
})();


/**
 * progress html structure:
 * <container class="progressJS">
 *  <button class="progress-delete"></button>
 *  <div class="progress-line">
 *   <datePicker class="datePickerJS"></datePicker>
 *   <textarea name="progress-text"></textarea>
 *  </div>
 * </container>
 */
var progressElement = (function () {
    const progressSep = "^#^";
    var progressChangeRecord = {};

    function getNowDate() {
        return (new Date().toISOString()).slice(0, 10);
    }

    // add button event
    function addEvent(event, id) {
        if (id !== undefined) {
            progressChangeRecord[id] = id;
        }
        progressElement.createProgressInput($(event.target.parentNode), false, id);
    }

    // delete button event
    function deleteEvent(event, id) {
        if ($(event.target.parentNode.parentNode).children(".progress-line").length > 1) {
            if (id !== undefined) {
                progressChangeRecord[id] = id;
            }
            $(event.target.parentNode).remove();
            return;
        }
        alert("最小的项目进度数为1");
    }

    function lineChangeEvent(event, id) {
        if (id !== undefined) {
            progressChangeRecord[id] = id;
        }
    }

    return {
        createProgressInput: function (container, firstCreate = true, id) {
            var div = null;

            if (firstCreate) {
                container.empty();
                container.append($("<button class='progress-add'></button>").click(event => addEvent(event, id)));
            }
            div = $('<div class="progress-line"></div>')
                .append(datePickerElement.makeElementByEle($("<div></div>"), undefined, undefined, "p" + id))
                .append($("<button class='progress-delete'></button>").click(event => deleteEvent(event, id)))
                .append("<textarea name='progressText' rows='4'></textarea>").on("change", event => lineChangeEvent(event, id));
            container.append(div).addClass("progressJS");
        },

        getProgressInputText: function (container) {
            let p = [];
            var d = "";
            container.children(".progress-line").each((index, val) => {
                d = datePickerElement.valueByEle($(val).children(".datePickerJS"));
                p.push(d + " - " + $(val).children("textarea[name='progressText']").val());
            });
            return p.join(progressSep);
        },

        setProgressEditNum: function (container, num, id) {
            container.empty();
            num = Math.max(num, 1);
            container.append($("<button class='progress-add'></button>").click(event => addEvent(event, id)))
            for (let i = 0; i < num; i++) {
                container.append($(`<div class='progress-line'></div>`)
                    .append(datePickerElement.makeElementByEle($("<div></div>"), undefined, undefined, "p" + id))
                    .append($("<button class='progress-delete'></button>").click(event => deleteEvent(event, id)))
                    .append($("<textarea name='progressText' rows='4'></textarea>").on("change", event => lineChangeEvent(event, id))));
            }
        },

        setProgressEditContent: function (container, str, id) {
            var lineTxt = str.split(progressSep);
            progressElement.setProgressEditNum(container, lineTxt.length, id);
            container.children(".progress-line").each((index, value) => {
                datePickerElement.valueByEle($(value).children(".datePickerJS"), lineTxt[index].slice(0, 10));
                $(value).children("textarea").val(lineTxt[index].slice(13));
            });
        },

        resetChangeRecord: function () {
            progressChangeRecord = {};
            datePickerElement.clearChangeRecordByFunc(id => id[0] === "p");
        },

        getChangeRecord: function () {
            return progressChangeRecord;
        }
    }
})();

/**deleteEvent
 * milestone html constructure:
 * <container class='milestoneJS'>
 *  <h3>项目子任务</h3>
 *  <table class="milestone-table">
 *   <tr>
 *    <th>名</th>
 *    <th>工作日</th>
 *    <th>负责人</th>
 *    <th>状态</th>
 *    <th>开始时间</th>
 *    <th>实际完成时间
 *     <button class="milestone-table-add"></button>
 *    </th>
 *   </tr>
 *   <tr>
 *    <td>
 *     <p class="milestone-watch-mode"></p>
 *     <textarea name="milestoneName" class="milestone-edit-mode" rows="2"></textarea>
 *    </td>
 *    <td>
 *     <p class="milestone-watch-mode"></p>
 *     <textarea name="milestoneWork" class="milestone-edit-mode" rows="1"></textarea>
 *    </td>
 *    <td>
 *     <p class="milestone-watch-mode"></p>
 *     <textarea name="milestoneManager" class="milestone-edit-mode" rows="1"></textarea>
 *    </td>
 *    <td>
 *     <p class="milestone-watch-mode"></p>
 *     <div class="milestone-edit-mode selectJS"></div>
 *    </td>
 *    <td>
 *     <p class="milestone-watch-mode"></p>
 *     <datePicker class="milestone-edit-mode"></datePicker>
 *    </td>
 *    <td>
 *     <p class="milestone-watch-mode"></p>
 *     <datePicker class="milestone-edit-mode"></datePicker>
 *     <button class="milestone-table-delete"></button>
 *    </td>
 *  </tr>
 * </table>
 * </container>
 */
var milestoneElement = (function () {
    var changeRecord = {};
    var milestoneSep = "^#^";
    const statusMapVal = [0, 1];
    const statusMapTxt = ["未完成", "已完成"];

    var textChangeEvent = (event, id) =>　{
        if (id !== undefined) {
            changeRecord[id] = id;
        }
    };

    var addLineEvent = (event, id) => {
        milestoneElement.createMilestone($(event.target).parent().parent().parent().parent(), false, id);
        if (id !== undefined) {
            changeRecord[id] = id;
        }
    };

    var deleteLineEvent = (event, id) => {
        var tr = $(event.target).parent().parent();
        if (tr.parent().children("tr").length > 2) {
            tr.remove();
            if (id !== undefined) {
                changeRecord[id] = id;
            }
        } else {
            alert("数量不能少于１");
        }
    };  

    return {

        createMilestoneInput: (container, firstCreate = false) => {
            var table = null;
            var tr = $(`
            <tr>
                <td>
                    <input name="milestoneName">
                </td>
                <td>
                    <input name="milestoneWork">
                </td>
                <td>
                    <input name="milestoneManager">
                </td>
                <td><div></div></td>
                <td><div></div></td>
                <td>
                    <div></div>
                    <button class="milestone-table-delete"></button>
                </td>
            </tr>
            `);

            datePickerElement.makeElementByEle(tr.children("td").eq(4).children("div"), undefined, undefined, undefined, true);
            datePickerElement.makeElementByEle(tr.children("td").eq(5).children("div"), "9999-01-01", undefined, undefined, true);
            selectElement.makeSelectByEle(tr.children("td").eq(3).children("div"), statusMapTxt, statusMapVal);
            tr.children("td").eq(5).children(".milestone-table-delete").click(event => {
                var tr = $(event.target).parent().parent();
                if (tr.parent().children("tr").length > 2) {
                    tr.remove();
                } else {
                    alert("数量不能少于１");
                }
            });

            if (firstCreate) {
                table = $("<table></table>").append($("<tr></tr>")
                    .append("<th>任务</th>")
                    .append("<th>工作日</th>")
                    .append("<th>负责人</th>")
                    .append("<th>状态</th>")
                    .append("<th>开始时间</th>")
                    .append($("<th>实际完成时间</th>").append($("<button></button>").addClass("milestone-table-add").click(event => milestoneElement.createMilestoneInput($(event.target).parent().parent().parent().parent())))));
                container.empty().append($("<h3>项目子任务</h3>")).append(table).addClass("milestoneJS");
            } else {
                table = container.children("table");
            }
            table.append(tr);

            return container;
        },

        createMilestone: (container, firstCreate = false, id) => {
            var table = null;
            var tr = $(`
            <tr data-id="${id}">
                <td>
                    <p class="milestone-watch-mode"></p>
                    <input name="milestoneName" class="milestone-edit-mode">
                </td>
                <td>
                    <p class="milestone-watch-mode"></p>
                    <input name="milestoneWork" class="milestone-edit-mode">
                </td>
                <td>
                    <p class="milestone-watch-mode"></p>
                    <input name="milestoneManager" class="milestone-edit-mode">
                </td>
                <td>
                    <p class="milestone-watch-mode"></p>
                    <div class="milestone-edit-mode"></div>
                </td>
                <td>
                    <p class="milestone-watch-mode"></p>
                    <div class="milestone-edit-mode"></div>
                </td>
                <td>
                    <p class="milestone-watch-mode"></p>
                    <div class="milestone-edit-mode"></div>
                    <button class="milestone-table-delete"></button>
                </td>
            </tr>
            `);

            datePickerElement.makeElementByEle(tr.children("td").eq(4).children(".milestone-edit-mode"), undefined, undefined, "m" + id, true);
            datePickerElement.makeElementByEle(tr.children("td").eq(5).children(".milestone-edit-mode"), "9999-01-01", undefined, "m" + id, true);
            selectElement.makeSelectByEle(tr.children("td").eq(3).children(".milestone-edit-mode"), statusMapTxt, statusMapVal, "s" + id);
            tr.children("td").eq(0).children(".milestone-edit-mode").on("change", event => textChangeEvent(event, id));
            tr.children("td").eq(1).children(".milestone-edit-mode").on("change", event => textChangeEvent(event, id));
            tr.children("td").eq(2).children(".milestone-edit-mode").on("change", event => textChangeEvent(event, id));
            tr.children("td").eq(5).children(".milestone-table-delete").click(event => deleteLineEvent(event, id));

            if (firstCreate) {
                table = $("<table></table>").append($("<tr></tr>")
                    .append("<th>任务</th>")
                    .append("<th>工作日</th>")
                    .append("<th>负责人</th>")
                    .append("<th>状态</th>")
                    .append("<th>开始时间</th>")
                    .append($("<th>实际完成时间</th>").append($("<button></button>").addClass("milestone-table-add").click(event => addLineEvent(event, id)))));
                container.empty().append($("<h3>项目子任务</h3>")).append(table).addClass("milestoneJS");
            } else {
                table = container.children("table");
            }
            table.append(tr);

            return container;
        },

        valInWatch: (container, id, value) => {
            var lineTxt = null;
            var contentTxt = null;
            var tds = null;
            var txt = "";
            var milestoneLength = container.children("table").children("tr").length - 1;
            if (value === undefined) {   // get
                container.children("table").children("tr").each((i, v) => {
                    if (i > 0) {
                        tds = $(v).children("td");
                        txt += [1, 2, 3, 4, 5, 0].map(num => num === 3 ? statusMapTxt.indexOf(tds.eq(num).children("p").text()) : tds.eq(num).children("p").text()).join("~");
                        if (i < container.children("table").children("tr").length - 1) {
                            txt += milestoneSep;
                        }
                    }
                });
                
                return txt;
            } else {   // set
                lineTxt = value.split("^#^");
                while (lineTxt.length > container.children("table").children("tr").length - 1) {
                    milestoneElement.createMilestone(container, false, id);
                }
                container.children("table").children("tr").each((i, v) => {
                    if (i > 0) {
                        contentTxt = lineTxt[i - 1].split("~");
                        if (contentTxt.length > 6) {
                            contentTxt[5] = contentTxt.slice(4).join("~");
                        }
                        [5, 0, 1, 2, 3, 4].forEach((num, offset) => offset === 3 ? $(v).children("td").eq(offset).children("p").text(statusMapTxt[contentTxt[num]]) :
                            $(v).children("td").eq(offset).children("p").text(contentTxt[num]));
                    }
                });
                return container;
            }
        },

        valInEdit: (container, id, value) => {
            var txt = "";
            var tds = null;
            var lineTxt = null;
            let contentTxt = null;
            if (value === undefined) {   // get
                container.children("table").children("tr").each((index, v) => {
                    if (index > 0) {
                        tds = $(v).children("td");
                        txt += `${tds.eq(1).children("input").val() || "."}~${tds.eq(2).children("input").val() || "."}~`;
                        txt += `${selectElement.selectValByEle(tds.eq(3).children(".selectJS"))}~`;
                        txt += `${datePickerElement.valueByEle(tds.eq(4).children(".datePickerJS"))}~${datePickerElement.valueByEle(tds.eq(5).children(".datePickerJS"))}~`;
                        txt += `${tds.eq(0).children("input").val() || "."}`;
                        if (index < container.children("table").children("tr").length - 1) {
                            txt += milestoneSep;
                        }
                    }
                });
                return txt;
            } else {   // set
                lineTxt = value.split("^#^");
                while (lineTxt.length > container.children("table").children("tr").length - 1) {
                    milestoneElement.createMilestone(container, false, id);
                }
                container.children("table").children("tr").each((i, v) => {
                    if (i > 0) {
                        contentTxt = lineTxt[i - 1].split("~");
                        if (contentTxt.length > 6) {
                            contentTxt[5] = contentTxt.slice(5).join("~");
                        }
                        tds = $(v).children("td");
                        [5, 0, 1].forEach((num, offset) => tds.eq(offset).children("input").val(contentTxt[num]));
                        selectElement.selectValByEle(tds.eq(3).children(".selectJS"), statusMapTxt[contentTxt[2]]);
                        datePickerElement.valueByEle(tds.eq(4).children(".datePickerJS"), contentTxt[3]);
                        datePickerElement.valueByEle(tds.eq(5).children(".datePickerJS"), contentTxt[4]);
                    }
                });
                return container;
            }
        },

        beInWatchMode: (container) => {
            milestoneElement.resetChangeRecord();
            container.children("table").children("tr").each((index, value) => {
                if (index > 0) {
                    $(value).children("td").each((i, v) => {
                        $(v).children("p").show();
                        $(v).children(".datePickerJS").hide();
                        $(v).children(".selectJS").hide();
                        $(v).children("input").hide();
                    });
                    $(value).children("td").eq(5).children(".milestone-table-delete").hide();
                } else {
                    $(value).children("th").eq(5).children(".milestone-table-add").hide();
                }
            });
        },

        beInEditMode: (container, id) => {
            milestoneElement.resetChangeRecord();
            container.children("table").children("tr").each((index, value) => {
                if (index > 0) {
                    $(value).children("td").each((i, v) => {
                        $(v).children("p").hide();
                        $(v).children(".datePickerJS").show();
                        $(v).children(".selectJS").show();
                        $(v).children("input").show();
                    });
                    $(value).children("td").eq(5).children(".milestone-table-delete").show();
                } else {
                    $(value).children("th").eq(5).children(".milestone-table-add").show();
                }
            });
        },

        resetChangeRecord: () => {
            changeRecord = {};
            datePickerElement.clearChangeRecordByFunc(id => id[0] === "m");
        },

        getChangeRecord: () => changeRecord,
    }
})();