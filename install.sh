#!/bin/bash

# These instructions were tested on a Ubuntu 14.04 LTS 64bit AWS Instance.

sudo apt-get update
sudo apt-get install -y git

git clone https://$GIT_USER:$GIT_PASSWORD@github.com/ecohealthalliance/diagnostic-dashboard.git

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
git checkout setup-instructions

# Deploy or redeploy the server:

chmod 700 deploy.sh
./deploy.sh

#By default meteor will run on port 3001. Run the Apache set-up script to put
#proxy the server on port 80:

chmod 700 apache_setup.sh
./apache_setup.sh
