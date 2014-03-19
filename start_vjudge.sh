#!/bin/bash
cd vjudge/hdu
./hduvjudge 127.0.0.1 6970 &
cd ../poj
./pojvjudge 127.0.0.1 6970 &

cd ../../Contest_vjudge/hdu
./contest_hduvjudge 127.0.0.1 7071 &
cd ../poj
./contest_pojvjudge 127.0.0.1 7073 &

