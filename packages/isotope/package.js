Package.describe({
  summary: 'Isotope packaged for Meteor'
});

Package.on_use(function (api) {
  api.add_files('isotope.pkgd.min.js', 'client');
});
