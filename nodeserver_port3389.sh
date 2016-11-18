#!/bin/bash
export LANG="ko_KR.UTF-8"
echo "=================================================="
echo "node.js 기반 간단한 게임서버"
echo "제작자 : 공대여자(mins01.com)"
echo "임의사용금지"
echo "=================================================="
export PATH=$PATH:/home/mins01/public_html/nodejs/node/bin

node server.js --nowebserver --port 3389