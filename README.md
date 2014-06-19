Diagnostic Dashboard Set-up
===========================

These instructions were tested on a Ubuntu 14.04 LTS 64bit AWS Instance.
They assume you cloned this repository and this readme is in your current directory.

Install node.js and meteorite:

    sudo apt-get install g++ make
    cd ~
    git clone git://github.com/ry/node.git
    cd node
    ./configure
    make
    sudo make install
    sudo ln -s ~/node/out/Release/node /usr/bin/node 
    sudo apt-get install npm
    curl https://install.meteor.com/ | sh
    cd ../diagnostic-dashboard
    sudo npm install -g meteorite forever

Deploy or redeploy the server:

    chmod 700 deploy.sh           
    ./deploy.sh
