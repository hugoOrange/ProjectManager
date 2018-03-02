module.exports = (function () {
    var dayMap = {
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
        Sun: 7
    };

    return {
        getNowDate: () => {
            return new Date().toISOString().slice(0, 10);
        },
    
        getNowTime: (offset = 8) => {
            var d = new Date();
            return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + (3600000 * offset)).toLocaleString();
        },
    
        getDateOffset: (AddDayCount) => {
            return module.exports.getDateOffsetSpec(new Date(), AddDayCount);
        },
    
        getDateOffsetSpec: (da, AddDayCount) => {
            var dd = new Date(da);
            dd.setDate(dd.getDate() + AddDayCount);
            var y = dd.getFullYear();
            var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);
            var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
            return y + "-" + m + "-" + d;
        },

        judgeInWeek: (jTime, offsetWeek = 0) => {
            var jTime = new Date(jTime);
            var nowDay = new Date();
            var jMon = module.exports.getDateOffsetSpec(jTime, 0 - dayMap[jTime.toString().slice(0, 3)] + 1);
            var nowMon = module.exports.getDateOffset(0 - dayMap[nowDay.toString().slice(0, 3)] + 1 + offsetWeek * 7);
            if (jMon === nowMon) {
                return true;
            } else {
                return false;
            }
        }
    }
})();