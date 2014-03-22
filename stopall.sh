kill -KILL `ps aux | grep vjudge| awk '{print $2}'`

kill -KILL `ps aux | grep server| awk '{print $2}'`
