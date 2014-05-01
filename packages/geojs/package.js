Package.describe({
  summary: 'Geojs packaged for Meteor'
});

Package.on_use(function (api) {
  api.use('jquery', 'client');
  api.use('d3', 'client');

  api.add_files('pre.js', 'client');
  api.add_files('gl-matrix.js', 'client');
  api.add_files('proj4.js', 'client');
  api.add_files('vgl.min.js', 'client');
  api.add_files('geojs.min.js', 'client');
  api.add_files('post.js', 'client');

  api.export('geo', 'client');
});
