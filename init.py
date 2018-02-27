# -*- coding: utf-8 -*-
import sys
import os

# 接收配置参数
print("进行数据库配置: ")
dbHost = raw_input("请输入数据库地址(database hostname)(默认为localhost): ")
if dbHost == "":
    dbHost = "localhost"
dbUser = raw_input("输入数据库用户名(username): ")
dbPassword = raw_input("输入数据库用户名密码(password): ")

print("进行ip配置: ")
indexUrlHost = raw_input("输入服务器主机名(hostname)(默认为localhost): ")
if indexUrlHost[0:6] == "http://":
    indexUrlHost = indexUrlHost[7:]
if indexUrlHost == "":
    indexUrlHost = "localhost"
indexUrlPort = raw_input("输入端口号(port)(默认为4200): ")
if indexUrlPort == "":
    indexUrlPort = "4200"
sessionTime = raw_input("输入会话保留时间/ms(session)(默认为15 * 60 * 1000): ")
if sessionTime == "":
    sessionTime = "15 * 60 * 1000"
configFp = open("src/config.js", "w+")

# 初始化数据库
os.system("mysql -u{} -p{} < src/sql/init.sql".format(dbUser, dbPassword))

# 创建配置文件
indexUrlHost = "indexUrlHost: \"{}\",\n".format(indexUrlHost)
indexUrlPort = "indexUrlPort: \"{}\",\n".format(indexUrlPort)
sessionTime = "sessionTime: {},\n".format(sessionTime)
dbHost = "dbHost: \"{}\",\n".format(dbHost)
dbUser = "dbUser: \"{}\",\n".format(dbUser)
dbPassword = "dbPassword: \"{}\",\n".format(dbPassword)
dbDatabase = "dbDatabase: \"{}\",\n".format("ProjectManager")

configContent = "module.exports={\n" + indexUrlHost + indexUrlPort + sessionTime + dbHost + dbUser + dbPassword + dbDatabase + "}"

configFp.write(configContent)
