var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('config.json', 'utf8'));
obj.userTable = "User";
obj.projectTable = "Project";

module.exports = obj;