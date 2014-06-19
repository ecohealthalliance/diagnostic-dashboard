#!/bin/bash
mrt update
mrt bundle bundle.tgz
tar -zxvf bundle.tgz
# Reinstall the fibers module (why?)
cd bundle/programs/server/node_modules
rm -rf fibers
npm install fibers
cd ../../../..
# Restart the forever server process
forever stop bundle/main.js || echo "no forever running"
# using port 3001 because port 80 only works if running as root
PORT=3001 MONGO_URL=mongodb://localhost:27017/diagnosis ROOT_URL=http://grits-dev.ecohealth.io forever -a -o output.log -e error.log start bundle/main.js
