#!/usr/bin/env python
# -*- coding: utf-8 -*-
import MySQLdb as mdb
import json
import getpass


# get database config
with open('../config.json') as json_data:
    config = json.load(json_data)


# input previous account
print("输入账户密码进行设置: ")
databaseName = "ProjectManager"
userTable = "User"
projectTable = "Project"
isCorrectAccount = False
userId = ""
MAX_RETRY_TIME = 3
username = raw_input("输入账户(username): ")
password = getpass.getpass("输入密码(password): ")

# connect database
db = mdb.connect(config["dbHost"], config["dbUser"], config["dbPassword"], databaseName)
cursor = db.cursor()

def disconnectDatabase():
    cursor.close()
    db.close()

try:
    # query existed user to match input account
    cursor.execute('SELECT userId FROM {} WHERE username = "{}" and password = "{}";'.format(userTable, username, password))
    usersInfo = cursor.fetchall()
except:
    print("Query fail or incorrect username and password, rollback.")
    db.rollback()
    exit(0)

print(usersInfo)
if not usersInfo:
    print("Unexisted user, please check your account.")
else:        
    userId = usersInfo[0][0]
    if userId == 1:
        print("Can't delete the user: admin.")
        disconnectDatabase()
        exit(0)
    else:
        try:
            cursor.execute('DELETE FROM {} WHERE userId = {};'.format(userTable, userId))
            cursor.execute('DELETE FROM {} WHERE userId = {};'.format(projectTable, userId))
            db.commit()
            print("删除成功")
        except:
            print("Delete fail, rollback.")
            db.rollback()
        finally:
            disconnectDatabase()