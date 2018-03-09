# 数据库设计

​	该文档描述了数据库表的结构。

## 数据库表

### 表1：Project

| projectId                                | projectName          | projectProgress | deadline | milestoneId                           | projectManager       |
| ---------------------------------------- | -------------------- | --------------- | -------- | ------------------------------------- | -------------------- |
| int(10) unsigned primary key not null auto_increment | varchar(30) not null | text not null   | date     | int(10) unsigned foreign key not null | varchar(30) not null |

### 表2：Milestone

| milestoneId                              | projectId                             | description   | priority                  | remarks                                  |
| ---------------------------------------- | ------------------------------------- | ------------- | ------------------------- | ---------------------------------------- |
| int(10) unsigned primary key not null auto_increment | int(10) unsigned foreign key not null | text not null | int(10) unsigned not null | int(10) unsigned default '0' |

*　优先度这里用数字表示，数字越小优先级越低，最大为10,最小为1.
*　项目进度默认使用`^*^`作为分隔符，按条划分，每一条包括一个日期和描述，日期和描述之间间隔一个` - `
*　milestone默认使用`^#^`作为分隔符，按条划分，每一条包括一个名称，一个工作日，一个开始时间和一个实际完成时间，格式为"工作日~开始时间~实际完成时间~名"