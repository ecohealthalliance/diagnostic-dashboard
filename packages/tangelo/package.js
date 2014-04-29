Package.describe({
  summary: 'Tangelo packaged for Meteor'
});

Package.on_use(function (api) {
  api.use('jquery', 'client');
  api.use('d3', 'client');

  api.add_files('pre.js', 'client');
  api.add_files('vega.min.js', 'client');
  api.add_files('jquery-ui.min.js', 'client');
  api.add_files('autobahn.min.js', 'client');
  api.add_files('vtkweb-all.min.js', 'client');
  api.add_files('tangelo.js', 'client');
  api.add_files('dendrogram.js', 'client');
  api.add_files('google-maps-api.js', 'client');
  api.add_files('spacemap.js', 'client');
  api.add_files('post.js', 'client');

  api.export('tangelo', 'client');
});
