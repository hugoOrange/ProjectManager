var selectElement = (function () {

    var triggerBtnEvent = event => {
        $(event.target).parent().children(".signup-department-chooseArea").show();
        event.preventDefault();
    };
    var chooseBtnEvent = event => {
        var target = $(event.target);
        target.parent().parent().children(".signup-department-chooseNow").text(target.text()).attr("data-value", target.attr("data-value"));
        target.parent().parent().children(".signup-department-chooseArea").hide();
        event.preventDefault();
    };

    return {
        makeSelect: (eleId, option, optionValue) => {
            if (option.length !== optionValue.length) {
                return false;
            }

            var container = $("#" + eleId);
            var chooseArea = $("<div class='signup-department-chooseArea'></div>").hide();

            for (let i = 0; i < option.length; i++) {
                chooseArea.append($("<button class='signup-department-choose' data-value='" + optionValue[i] + "'></button>")
                    .text(option[i]).click(chooseBtnEvent));
            }
            container.append($(`<div class='signup-department-chooseNow' data-value="${optionValue[0]}">${option[0]}</div>`).click(triggerBtnEvent)).append(chooseArea);
            return true;
        }
    }
})();