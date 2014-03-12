#!/bin/bash

sudo su
mongod
supervisor app.js
node ./server/server.js
./vjudge/hdu/a.out 127.0.0.1 6970
