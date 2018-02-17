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
    projectStatus INT(8) unsigned NOT NULL,
    projectName VARCHAR(30) NOT NULL,
    projectTarget TEXT NOT NULL,
    projectManager VARCHAR(30) NOT NULL,
    deadline DATE NOT NULL,
    projectProgress TEXT NOT NULL,
    priority INT(8) unsigned NOT NULL DEFAULT 0,
    userId INT(10) unsigned NOT NULL,

    PRIMARY KEY (projectId)
) CHARACTER SET = utf8;


-- row level
-- the manager account
INSERT INTO User VALUE (1, "admin", "123456");
INSERT INTO User VALUE (2, "member", "000000");
-- test， comment when in production

INSERT INTO Project VALUE (1, 0, "小型移动机器人与航空航天卫星巡游智能识别自动充电无导航系统", "打入国内市场", "张三", "2018-02-18", 
        "2018-01-15 - 海外部分已经完成65%，国内完成5%，国内反馈缓慢。^#^2018-01-25 - 已分配IP，除腾讯和淘宝外，其他已修改", 1, 2);
INSERT INTO Project VALUES
    (2, 1, "快速通讯", "中国日报创办“新时代大讲堂”，致敬新时代、拥抱新时代、阐释新时代、传播新时代", "李四", "2018-05-10",
        "2018-05-01 - 北京至天津线路已开通^#^2018-05-10 - 等待测试", 0, 2),
    (3, 0, "广深铁路", "中国进入新时代，将是世界历史的一个重要转折点", "李四", "2018-2-18",
        "2018-01-05 - 割接4个convertor客户", 2, 2),
    (4, 0, "黄沙快线交通系统", "刘欣分享了作为对外传播工作者的经历以及在新时代的使命", "李四", "2015-05-10",
        "2018-05-12 - 联通四条汉信线路割接完成", 1, 2),
    (5, 1, "客户通知系统", "部分国家倾向实施孤立主义和单边主义政策，将国际合作拒之门外", "李四", "2018-2-20",
        "2018-05-04 - 亦庄中信云GE总头割接完成", 1, 2),
    (6, 0, "智能交通系统", "甚至对于世贸组织的职能和定位也存在不同意见", "李四", "2018-01-10",
        "2018-02-05 - 完成7条联通线路的割接", 1, 2),
    (7, 1, "快捷通讯", "中国社会主要矛盾已经转化为人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾", "李四", "2018-02-19",
        "2018-06-05 - 科创机房的电信和联通设备已经安装完成", 0, 2),
    (8, 0, "稳定通讯", "中国希望在发展的同时兼顾公平，希望发展惠及所有中国人，这样的发展目标对其他国家具有示范意义", "李四", "2018-06-20",
        "2018-03-25 - 天津两条本地骨干移动500M^#^2018-04-01 - 中电中华1G设置了一些数据当做 session 存在内存中", 0, 2);
