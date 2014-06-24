Diagnostic Dashboard Set-up
===========================

These instructions were tested on a Ubuntu 14.04 LTS 64bit AWS Instance.
They assume you cloned this repository and this readme is in your current directory.

Install node.js and meteorite:

    sudo apt-get install python-software-properties python g++ make
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs
    curl https://install.meteor.com/ | sh
    sudo npm install -g meteorite forever
    cd ~/diagnostic-dashboard

Deploy or redeploy the server:

    chmod 700 deploy.sh
    ./deploy.sh

By default meteor will run on port 3001. Run the Apache set-up script to put
proxy the server on port 80:

    apache_setup.sh
