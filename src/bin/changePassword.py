#!/usr/bin/env python
# -*- coding: utf-8 -*-
import MySQLdb as mdb
import json
import getpass


# get database config
with open('../config.json') as json_data:
    config = json.load(json_data)


# input previous account
print("输入账户信息进行设置: ")
username = raw_input("输入账户(username): ")
password = getpass.getpass("输入密码(password): ")
databaseName = "ProjectManager"
userTable = "User"
isCorrectAccount = False
userId = ""
usernamePre = ""
passwordPre = ""
MAX_RETRY_TIME = 3

# connect database
db = mdb.connect(config["dbHost"], config["dbUser"], config["dbPassword"], databaseName)
cursor = db.cursor()

def getCountInput(retryTime = 1):
    passwordSet = getpass.getpass("请输入需要设置的密码(password)： ")
    passwordAgainSet = getpass.getpass("请再次输入密码(password)： ")
    if retryTime >= MAX_RETRY_TIME:
        disconnectDatabase()
        exit(0)
    if passwordSet != passwordAgainSet:
        retryTime += 1
        print("密码输入不一致，还有{}次机会".format(MAX_RETRY_TIME - retryTime))
        return getCountInput(retryTime)
    else:
        return passwordSet

def disconnectDatabase():
    cursor.close()
    db.close()

try:
    # query existed user to match input account
    cursor.execute('SELECT * FROM {};'.format(userTable))
    usersInfo = cursor.fetchall()
except:
    print("Query fail or incorrect username and password, rollback.")
    db.rollback()
    exit(0)

# get new set password
for userInfo in usersInfo:
    userId = userInfo[0]
    usernamePre = userInfo[1]
    passwordPre = userInfo[2]
    if username == usernamePre and password == passwordPre:
        isCorrectAccount = True
        break
if isCorrectAccount:
    password = getCountInput()
    try:
        cursor.execute('UPDATE {} SET password = "{}" WHERE userId = {};'.format(userTable, password, userId))
        db.commit()
        print("修改成功")
    except:
        print("Delete fail, rollback.")        
        db.rollback()
    finally:
        disconnectDatabase()
else:
    disconnectDatabase()
    exit(0)