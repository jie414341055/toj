#!/bin/bash
node server/hdu/hduserver.js &
node server/poj/pojserver.js &
node Contest_server/hdu/Contest_hduserver.js &
node Contest_server/poj/Contest_pojserver.js &

