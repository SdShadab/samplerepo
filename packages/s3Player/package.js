Package.describe({
  summary: "Plays User S3 VIdeos",
  version: '0.1.0',
  name: "s3player"
});

Package.onUse(function (api) {

  api.use(['templating', 'telescope-base', 'telescope-theme-hubble','mrt:popcorn'], ['client']);

  api.use(['telescope-lib'], ['client', 'server']);

  api.add_files([
    'lib/client/templates/s3_post_page.html',
    'lib/client/s3_post_page.js'
    ], ['client']);

   
});