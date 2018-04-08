var db = require('./DB.js');
const milestoneSep = "^#^";

db.connect();

db.queryProjectsAttr("milestone", (res) => {
    // console.dir(res)
    let tmpPart = [], tmpRes = "";
    // console.log(res.map((v, i) => {
    db.changeProjectsAttri(res.map((v, i) => {
        tmpPart = v.milestone.split(milestoneSep);
        tmpRes = "";
        for (let i = 0; i < tmpPart.length; i++) {
            tmpRes += tmpPart[i].split("~")[0] + "~.~.~" + tmpPart[i].split("~").slice(1).join("~") + milestoneSep;
        }
        v.milestone = tmpRes;
        return v;
    }), "milestone");
});