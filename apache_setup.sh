sudo apt-get install apache2
sudo a2enmod proxy proxy_http
# Install a config file for proxying the meteor dashboard
# and girder
sudo tee /etc/apache2/conf-available/proxy.conf <<EOF
<VirtualHost *:80>
  ServerName grits-dev.ecohealth.io
  ProxyPreserveHost On
  ProxyPass /gritsdb/ http://localhost:9999/
  ProxyPassReverse /gritsdb/ http://localhost:9999/
  ProxyPass / http://localhost:3001/
  ProxyPassReverse / http://localhost:3001/
</VirtualHost>
EOF
sudo a2enconf proxy
sudo apache2ctl restart
