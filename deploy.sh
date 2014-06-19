#!/bin/bash
mrt update
mrt bundle bundle.tgz
tar -zxvf bundle.tgz
# Reinstall the fibers module (why?)
cd bundle/programs/server/node_modules
rm -r fibers
npm install fibers
cd ../../../..
# Restart the forever server process
forever stop bundle/main.js || echo "no forever running"
MONGO_URL=mongodb://localhost:27017/diagnosis ROOT_URL=http://54.204.5.132 forever -a -o output.log -e error.log start bundle/main.js
