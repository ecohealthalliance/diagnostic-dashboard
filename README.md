# GRITS Diagnostic Dashboard

The diagnostic dashboard provides the web-based user interface for the GRITS system. Here users can create accounts and log in, view their usage history, submit new articles for processing, and view the complete results of processing an article.  The output of processing includes extracted features such as locations, dates, symptoms, case counts, a timeline, visualizations, and the differential diagnosis for diseases inferred from the article.

# Dependencies

The diagnostic dashboard is a [meteor](https://www.meteor.com/ "meteor") application. It uses several meteor plugins which may be installed using the instructions and scripts detailed below.

The dashboard relies on a Python backend whose code is available in the [grits-api](https://github.com/ecohealthalliance/grits-api) project.

# Diagnostic Dashboard set-up

## As part of total GRITS deployment

You may elect to install all GRITS components at once by following the instructions in the [grits-deploy-scripts](https://github.com/ecohealthalliance/grits-deploy-scripts) project.

## Config for quick deploy and quick install

Create a new `config` file that sets the variables from [config.sample](config.sample):

    $ cp config.sample config

and edit the values to suit your environment.

## Quick deploy

If you've done this before and have a server instance ready to go with `diagnostic-dashboard` in your home, and you have your `config` file set up, use the shorthand method:

      $ ssh -i key.pem ubuntu@instance GIT_USER=user GIT_PASSWORD=password 'bash -s' < install.sh

## Quick install

If you already have the codebase and have set up your `config` file, simply run [install.sh](install.sh) from the project directory:

      $ sh install.sh

Note this script assumes your `diagnostic-dashboard` directory is in your home; edit to suit. It also requires that you have an environment variable named `APACHE_URL` set to the root URL of your server, e.g.:

      $ export APACHE_URL=http://localhost

or

      $ export APACHE_URL=http://my-server.com

This will install meteor, [meteorite](https://github.com/oortcloud/meteorite/) and [forever])(https://github.com/nodejitsu/forever). It then will run [deploy.sh](deploy.sh) which will update the Meteor package dependencies, create a bundle of the app, and begin running the server.

The service will start on port 3001: [http://localhost:3001/profile](http://localhost:3001/)

Functionality will be very limited without a correpondsing [grits-api](https://github.com/ecohealthalliance/grits-api) backend, so make sure to install that project as well.

## Detailed setup

Clone this repository if you don't already have a local copy:

    $ git clone git@github.com:ecohealthalliance/diagnostic-dashboard.git

If you wish to install all dependencies, bundle the app, and begin running it immediately, simply execute the [install.sh](install.sh) script, which in turn invokes [deploy.sh](deploy.sh) as described above:

    $ sh install.sh

Otherwise, you may complete the following steps and omit any that may not be necessary for you.

If for example you already have Meteor >= 0.8 installed, you can omit the followng step:

    $ curl https://install.meteor.com/ | sh

Install npm if necessary:

    $ curl http://npmjs.org/install.sh | sh
mInstall meteorite and forever, globally:

    $ sudo npm install -g meteorite forever

Change directory to wherever you've put the diagnostic-dashboard repository:

    $ cd ~/diagnostic-dashboard

Update the meteorite dependencies:

    $ mrt update

Start the service:

    $ meteor

The service will start on port 3000: [http://localhost:3000/profile](http://localhost:3000/)

Before you can use the most interesting parts of the GRITS application, you'll need to make sure your diagnostic-dashboard server has access to its corresponding backend API server, so consult the documentation in the [grits-api](https://github.com/ecohealthalliance/grits-api) project and install that as well.

## Full local setup

The following are all the commands needed for a local setup.

    git clone git@github.com:ecohealthalliance/diagnostic-dashboard.git
    cd diagnostic-dashboard
    cp config.sample config
    export APACHE_URL=http://localhost
    curl https://install.meteor.com/ | sh
    curl http://npmjs.org/install.sh | sh
    sudo rm -rf ~/tmp
    sudo rm -rf ~/.npm
    sudo npm install -g meteorite forever
    mrt update
    meteor

