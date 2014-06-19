Diagnostic Dashboard Set-up
===========================

These instructions were tested on a Ubuntu 14.04 LTS 64bit AWS Instance.
You can execute all the commands in this readme via `grep "    " README.md | /bin/bash`

Install node.js and meteorite:

    sudo apt-get install python-software-properties python g++ make
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs
    npm install -g meteorite
    
Deploy or redeploy the server:

    ./deploy.sh
