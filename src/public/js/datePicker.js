var datePickerElement = (function () {
    // const monthMap = ["Jan", "Fab", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthMap = new Array(12).fill(1).map((val, i) => ((i + 1 < 10 ? "0" : "") + (i + 1)));
    const dayMap = new Array(31).fill(1).map((val, i) => ((i + 1 < 10 ? "0" : "") + (i + 1)));
    var dayInMonth = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var changeRecord = {};

    var getDayInMonth = (year) => {
        year = parseInt(year);
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
            dayInMonth[1] = 29;
        } else {
            dayInMonth[1] = 28;
        }
        return dayInMonth;
    };
    var judgeDateValidate = (y, m, d) => +d <= getDayInMonth(+y)[+m];
    var getDateList = (date) => [date.slice(0, 4), date.slice(5, 7), date.slice(8, 10)];

    var getChooseNow = container => {
        var uls = container.children("div").eq(0).children("ul");
        return `${uls.eq(0).attr("data-value")}-${uls.eq(1).attr("data-value")}-${uls.eq(2).attr("data-value")}`;
    };

    var triggerBtnEvent = event => {
        var container = $(event.target).parent().parent();
        var scrollTarget = [];
        container.children("button").hide();
        container.children("div").show();
        // initialize list
        container.children(".datePicker-list").children("ul").each((index, val) => {
            val.dataset.value = $(event.target).parent().children("span").eq(index).text();
            $(val).children("li").each((i, v) => {
                $(v).children("button").removeClass("datePicker-list-choose");
                if ($(v).children("button").text() === val.dataset.value) {
                    $(v).children("button").addClass("datePicker-list-choose");
                    scrollTarget.push(i);
                }
            });
        });
        // scroll
        container.children(".datePicker-list").children("ul").eq(0)[0].scrollTop = (scrollTarget[0] - 2) * 20;
        container.children(".datePicker-list").children("ul").eq(1)[0].scrollTop = (scrollTarget[1] - 2) * 20;
        container.children(".datePicker-list").children("ul").eq(2)[0].scrollTop = (scrollTarget[2] - 2) * 20;

        event.stopPropagation();
    };

    var chooseBtnEvent = event => {
        $(event.target).parent().parent().children("li").each((index, val) => {
            if ($(val).children("button").hasClass("datePicker-list-choose")) {
                $(val).children("button").removeClass("datePicker-list-choose");
                return;
            }
        });
        $(event.target).addClass("datePicker-list-choose");
        $(event.target).parent().parent().attr("data-value", $(event.target).text());
    };

    var okBtnEvent = event => {
        var container = $(event.target).parent().parent();
        datePickerElement.valueByEle(container, getChooseNow(container));
        container.children("div").hide();
        container.children("button").show();
    };

    var okBtnBindEvent = (event, id) => {
        var container = $(event.target).parent().parent();
        var lastValue = datePickerElement.valueByEle(container);
        var nowValue = getChooseNow(container);
        datePickerElement.valueByEle(container, nowValue);
        container.children("div").hide();
        container.children("button").show();

        if (lastValue !== nowValue) {
            // value changed
            changeRecord[id] = nowValue;
        }
    };

    var cancelBtnEvent = event => {
        var container = $(event.target).parent().parent();
        container.children("div").hide();
        container.children("button").show();
    };

    return {
        makeElementByEle: (container, defaultValue = new Date().toISOString().slice(0, 10), offsetYear = 10, isBind = false, id = "") => {
            var nowYear = new Date().getFullYear();
            var defaultV = getDateList(defaultValue);
            var yearMap = new Array(offsetYear * 2).fill(1).map((val, index) => nowYear + index - offsetYear);
            var yearList = $("<ul></ul>").addClass("datePicker-list-year").attr("data-value", defaultV[0]);
            var monthList = $("<ul></ul>").addClass("datePicker-list-month").attr("data-value", defaultV[1]);
            var dayList = $("<ul></ul>").addClass("datePicker-list-day").attr("data-value", defaultV[2]);

            container.append($("<button></button>").addClass("datePicker-show")
                .append($("<span>" + defaultV[0] + "</span>").addClass("datePicker-show-year").click(triggerBtnEvent))
                .append($("<span>" + defaultV[1] + "</span>").addClass("datePicker-show-month").click(triggerBtnEvent))
                .append($("<span>" + defaultV[2] + "</span>").addClass("datePicker-show-day").click(triggerBtnEvent)));

            yearMap.forEach(val => yearList.append($("<li></li>").append($("<button>" + val + "</button>").click(chooseBtnEvent))));
            monthMap.forEach(val => monthList.append($("<li></li>").append("<button>" + val + "</button>").click(chooseBtnEvent)));;
            dayMap.forEach(val => dayList.append($("<li></li>").append("<button>" + val + "</button>").click(chooseBtnEvent)));

            container.addClass("datePicker")
                .append($("<div></div>").addClass("datePicker-list").append(yearList).append(monthList).append(dayList).hide()).append($("<div></div>").addClass("datePicker-button")
                .append($("<button class='datePicker-button-ok'>&radic;</button>").click(isBind ? event => okBtnBindEvent(event. id) : okBtnEvent))
                .append($("<button class='datePicker-button-cancel'>&Chi;</button>").click(cancelBtnEvent)).hide());

            return container;
        },

        // get && set
        valueByEle: (container, value) => { // value format: "yyyy-mm-dd"
            var btn = container.children("button");
            if (value === undefined) {
                return `${btn.children(".datePicker-show-year")}-${btn.children(".datePicker-show-month")}-${btn.children(".datePicker-show-day")}`;
            } else {
                btn.children(".datePicker-show-year").text(value.slice(0, 4));
                btn.children(".datePicker-show-month").text(value.slice(5, 7));
                btn.children(".datePicker-show-day").text(value.slice(8, 10));
                return value;
            }
        },
        
        resetChangeRecord: () => changeRecord = {},

        getChangeRecord: () => changeRecord,
    }
})();