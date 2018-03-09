-- database level
DROP DATABASE IF EXISTS ProjectManager;
CREATE DATABASE ProjectManager;
USE ProjectManager;

-- table level
CREATE TABLE User (
    userId INT(16) unsigned NOT NULL auto_increment,
    username VARCHAR(30) NOT NULL,
    password VARCHAR(30) NOT NULL,
    department INT(2) NOT NULL,

    PRIMARY KEY (userId)
);
CREATE INDEX dName ON User (department);

CREATE TABLE Project (
    projectId INT(10) unsigned NOT NULL auto_increment,
    projectStatus INT(8) unsigned NOT NULL,
    projectName VARCHAR(30) NOT NULL,
    projectTarget TEXT NOT NULL,
    deadline DATE NOT NULL,
    projectProgress TEXT NOT NULL,
    milestone TEXT NOT NULL,
    priority INT(8) unsigned NOT NULL DEFAULT 0,
    firstTime DATE NOT NULL,
    createtime timestamp not null default current_timestamp,
    finishTime Date NOT NULL,
    userId INT(10) unsigned NOT NULL,

    PRIMARY KEY (projectId)
) CHARACTER SET = utf8;
CREATE INDEX uId ON User (userId);


-- row level
INSERT INTO User VALUE (1, "admin", "123456", 0);