#!/bin/bash

cd ~
# Install node.js and meteorite:

sudo apt-get install -y python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install -y nodejs
curl https://install.meteor.com/ | sh
sudo npm install -g meteorite forever
# ~/tmp is an npm issue that will be fixed in the next release (https://github.com/npm/npm/issues/3470)
sudo rm -rf tmp
sudo rm -rf .npm
cd ~/diagnostic-dashboard

# Deploy or redeploy the server:

chmod 700 deploy.sh
./deploy.sh
