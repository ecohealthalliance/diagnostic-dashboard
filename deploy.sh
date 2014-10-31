#!/bin/bash
# Remove the old bundle because extraneous files in the app dir can cause errors
# when rebundling.
rm -rf bundle
mrt update
mrt bundle bundle.tgz
tar -zxvf bundle.tgz
# Reinstall the fibers module because it is a native package.
# See: http://stackoverflow.com/questions/17606340/how-to-deploy-a-meteor-application-to-my-own-server
cd bundle/programs/server/node_modules
rm -rf fibers
npm install fibers
cd ../../../..
sudo supervisorctl restart dashboard
mongo .scripts/autocompleteCollections.js
