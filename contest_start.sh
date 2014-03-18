#!/bin/bash
#node Contest_server/hdu/Contest_hduserver.js &
#node Contest_server/poj/Contest_pojserver.js &
cd Contest_vjudge/hdu
./contest_hduvjudge 127.0.0.1 7071 &
cd ../poj
./contest_pojvjudge 127.0.0.1 7073 &

