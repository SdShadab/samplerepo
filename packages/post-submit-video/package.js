Package.describe({
  summary: "Lets users uplod files to Amazon S3",
  version: '0.1.0',
  name: "postvideo"
});

Package.onUse(function (api) {

  api.use(['templating', 'telescope-base', 'telescope-theme-hubble'], ['client','server']);

  api.add_files([
    'lib/client/templates/post_video.html',
    'lib/client/post_video.js'
    ], ['client','server']);

});