/**
 * select html structure
 * <container class="selectJS">
 *  <div class="select-chooseNow" data-value="">
 *  </div>
 *  <div class="select-chooseArea">
 *   <div class="select-choose" data-value=""></div>
 *  </div>
 * <container>
 */
var selectElement = (function () {
    var changeRecord = {};

    var getText = (ele, value) => {
        let t = "";
        ele.children(".select-chooseArea").children("button").each((index, val) => {
            if (val.dataset.value === value) {
                t = val.innerText;
            }
        });
        return t;
    };

    var getValue = (ele, text) => {
        let value = "";
        ele.children(".select-chooseArea").children("button").each((index, val) => {
            if (val.innerText === text) {
                value = val.dataset.value;
            }
        });
        return value;
    };

    var triggerBtnEvent = event => {
        $(event.target).parent().children(".select-chooseArea").show();
        event.preventDefault();
    };
    
    var chooseBtnEvent = (event, id) => {
        var target = $(event.target);
        var preVal = target.parent().parent().children(".select-chooseNow").attr("data-value");
        var nowVal = target.attr("data-value");
        if (id !== undefined && nowVal !== preVal) {
            changeRecord[id] = nowVal;
        }
        target.parent().parent().children(".select-chooseNow").text(target.text()).attr("data-value", nowVal);
        target.parent().parent().children(".select-chooseArea").hide();
        event.preventDefault();
    };

    return {
        makeSelectById: (eleId, option, optionValue, bindId) => {
            if (option.length !== optionValue.length) {
                return false;
            }
            var container = $("#" + eleId);
            selectElement.makeSelectByEle(container, option, optionValue, bindId);
        },

        makeSelectByEle: (container, option, optionValue, bindId) => {
            if (option.length !== optionValue.length) {
                return false;
            }
            var chooseArea = $("<div class='select-chooseArea'></div>").hide().css("width", container.css("width"));

            for (let i = 0; i < option.length; i++) {
                chooseArea.append($("<button class='select-choose' data-value='" + optionValue[i] + "'></button>")
                    .text(option[i]).click(event => chooseBtnEvent(event, bindId)));
            }
            container.append($(`<div class='select-chooseNow' data-value="${optionValue[0]}">${option[0]}</div>`).click(triggerBtnEvent))
                .append(chooseArea).addClass("selectJS");
            return true;
        },

        selectValById: (eleId, text) => {
            if (text === undefined) {                
                return $("#" + eleId).children("div").eq(0).attr("data-value");
            } else {
                var v = getValue($("#" + eleId), text);
                $("#" + eleId).children("div").eq(0).attr("data-value", v).text(text);
            }
        },

        selectValByEle: (ele, text) => {
            if (text === undefined) {
                return ele.children("div").eq(0).attr("data-value");
            } else {
                var v = getValue(ele, text);
                ele.children("div").eq(0).attr("data-value", v).text(text);
            }
        },

        resetChangeRecord: () => changeRecord = {},

        getChangeRecord: () => changeRecord,
    }
})();