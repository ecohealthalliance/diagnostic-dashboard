#!/bin/bash

cd ~
# Install meteor and meteorite:

curl https://install.meteor.com/ | sh
sudo npm install -g meteorite
# ~/tmp is an npm issue that will be fixed in the next release (https://github.com/npm/npm/issues/3470)
sudo rm -rf tmp
sudo rm -rf .npm
cd ~/diagnostic-dashboard

# Deploy or redeploy the server:
./deploy.sh
