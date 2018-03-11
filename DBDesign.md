# 数据库设计

​	该文档描述了数据库表的结构。

## 数据库表

### 表1：User

- *userId* INT(16) unsigned NOT NULL auto_increment，主键
- *username* VARCHAR(30) NOT NULL，标识用户名的同时也同时表示项目负责人
- *password* VARCHAR(30) NOT NULL
- *department* INT(2) NOT NULL，由于目前仅两种，用0、1表示不同的部门

### 表2：Project

- *projectId* INT(10) unsigned NOT NULL auto_increment，主键
- *projectStatus* INT(8) unsigned NOT NULL，用不同数字对应不同的状态，数字与状态的对应表在前端的界面上，如果是已完成的话则不会再更改，如果是未完成，则当修改*deadline*时，如果修改的日期是比*firstTime*后的话，则会判断成延期，否则是正常
- *projectName* VARCHAR(30) NOT NULL
- *projectTarget* TEXT NOT NULL，为空时会被设置为为`.`
- *deadline* DATE NOT NULL
- *projectProgress* TEXT NOT NULL
  - 项目进度默认使用`^*^`作为分隔符，按条划分，每一条包括一个日期和描述，日期和描述之间间隔一个` - `
- *milestone* TEXT NOT NULL
  - milestone默认使用`^#^`作为分隔符，按条划分
  - 每一条包括一个名称，一个工作日，一个开始时间和一个实际完成时间，格式为"工作日~开始时间~实际完成时间~名"
- *priority* INT(8) unsigned NOT NULL DEFAULT 0，数字越低优先级越高
- *firstTime* DATE NOT NULL，表示第一次设置的*deadline*，用来判断是否延期
- *createtime* timestamp not null default current_timestamp，表示创建项目的时间，一般不变
- *finishTime* Date NOT NULL
- *userId* INT(10) unsigned NOT NULL，用来与`User`联合查询得到项目负责人

## 初始数据

​	一个已注册的帐号：帐号名为`admin`，密码为`123456`，可以通过运行`/src/bin/`里面的`changePassword.py`文件来更改密码。