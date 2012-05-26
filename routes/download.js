var zipstream = require('zipstream');
var fs = require('fs');

/*
List of available packages, each having a list of files to be copied
*/
var packages = {
  'backbone': {
    files: [
      'backbone.js',
      'backbone.min.js'
    ]
  },
  'require': {
  },
  'zepto': {
  },
  'jquery': {
  }
};

var examples = {
  'todo': {
    npmName: 'backbone',
    example: 'examples/todos/index.html',
    files: [
      'examples'
    ]
  }
};

exports.download = function(req, res){
  
  var packages = req.query.package;
  
  res.send(packages);
  
  /*
  var zip = zipstream.createZip();

  zip.addFile(fs.createReadStream('README.md'), { name: 'README.md' }, function() {

    zip.finalize(function(written) {
      console.log(written + ' total bytes written');
    });
  });

  res.header('Content-Disposition', 'attachment; filename=backbone.zip');
  zip.pipe(res);*/
  
  /*
  Make list of dependencies based on URL params
  Package js dependencies
  If example is selected
    Grab example html
    Build list of JS dependencies
    for each js dependency:
       If require
         Add line to main.js
       Else 
         Add <script> to page

  */
  
};