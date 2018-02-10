-- database level
DROP DATABASE IF EXISTS ProjectManager;
CREATE DATABASE ProjectManager;
USE ProjectManager;

-- table level
CREATE TABLE User (
    userId INT(10) unsigned NOT NULL auto_increment,
    username VARCHAR(10) NOT NULL,
    password VARCHAR(30) NOT NULL,

    PRIMARY KEY (userId)
);

CREATE TABLE Project (
    projectId INT(10) unsigned NOT NULL auto_increment,
    projectName VARCHAR(30) NOT NULL,
    projectProgress TEXT NOT NULL,
    deadline DATE NOT NULL,
    userId INT(10) unsigned NOT NULL,
    projectManager VARCHAR(30) NOT NULL,

    PRIMARY KEY (projectId)
) CHARACTER SET = utf8;

CREATE TABLE Milestone (
    milestoneId INT(10) unsigned NOT NULL auto_increment,
    projectId INT(10) unsigned NOT NULL,
    description TEXT NOT NULL,
    priority INT(10) unsigned NOT NULL DEFAULT 0,
    remarks TEXT NOT NULL,

    PRIMARY KEY (milestoneId),
    FOREIGN KEY (projectId) REFERENCES Project(projectId)
) CHARACTER SET = utf8;

-- row level
-- the manager account
INSERT INTO User VALUE (1, "admin", "123456");
INSERT INTO User VALUE (2, "member", "000000");
-- test， comment when in production

INSERT INTO Project VALUE (1, "小型移动机器人系统", "海外部分已经完成65%，国内完成5%，国内反馈缓慢。\n2018/1/25已分配IP，除腾讯和淘宝外，其他已修改",
        "2018-03-01", 2, "张三");
INSERT INTO Project VALUE (2, "快速通讯", "2018/5/1北京至天津线路已开通，等待测试",
        "2018-05-01", 2, "张三");
INSERT INTO Project VALUE (3, "黄沙快线交通系统", "2018/1/4天津至北京中新电路完成",
        "2017-05-01", 2, "张三");

INSERT INTO Milestone VALUE (1, 1, "联通传输设备铺设，并安排开通GP总头", 0, "");
INSERT INTO Milestone (projectId, description, priority, remarks) VALUES
    (1, "割接4个convertor客户", 0, ""),
    (1, "联通四条汉信线路割接完成", 1, ""),
    (2, "亦庄中信云GE总头割接完成", 2, ""),
    (2, "完成7条联通线路的割接", 2, ""),
    (3, "科创机房的电信和联通设备已经安装完成", 2, ""),
    (3, "天津两条本地骨干移动500M，中电中华1G", 2, "");

