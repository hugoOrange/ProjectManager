from fabric.api import *
import optparse

host_ip = "192.168.3.179"


###############
# configurate remote account
###############
env.hosts = ['server@{}'.format(host_ip)]


###############
# configurate remote passwd
###############
env.password = '123456'

def deploy():
    local('tar -cvf projectManager.tar src/')
    # run('mkdir haohao')
    put('projectManager.tar', '~/haohao')
    with cd('~/haohao'):
        run('tar -xvf projectManager.tar')
