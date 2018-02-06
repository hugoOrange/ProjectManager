# 项目管理系统

​	这是一个简易的项目管理系统。

## 业务需求

 	1. 项目成员任务分配及查看功能
 	2. 项目组长查看项目总进度的功能
 	3. 任务提醒功能
 	4. （可选）导出为excel功能

## 安装

​	本系统假设运行在`ubuntu 16.04LTS`操作系统上，不考虑`windows`。

### 安装工具

​	需要安装`mysql` `nodejs`两个工具，这里提供两种方法，也可自行安装：

#### mysql

```shell
sudo apt-get update
sudo apt-get install mysql-server
```

#### nodejs

```shell
# use nvm to install
sudo apt-get install build-essential checkinstall
sudo apt-get install libssl-dev
sudo apt-get install curl
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
# close current terminal
# check if install nvm
command -v nvm

nvm install 5.0
nvm use 5.0
nvm alias default node
```

### 安装依赖包

​	需要安装的依赖包括`express`：

```shell
# 进入到项目目录: cd ProjectManager
cd src
npm install express
```

