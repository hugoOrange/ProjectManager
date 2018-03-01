module.exports = {
    getNowDate: () => {
        return new Date().toISOString().slice(0, 10);
    },

    getNowTime: () => {
        new Date().toISOString().replace("T", "-").slice(0, 19);
    },

    getDateOffset: (AddDayCount) => {
        var dd = new Date();
        dd.setDate(dd.getDate() + AddDayCount);
        var y = dd.getFullYear();
        var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);
        var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
        return y + "-" + m + "-" + d;
    },
}