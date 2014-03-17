#!/bin/bash
node server/hdu/hduserver.js &
node server/poj/pojserver.js &
vjudge/hdu/hduvjudge 127.0.0.1 6970 &
vjudge/poj/pojvjudge 127.0.0.1 6972 &

