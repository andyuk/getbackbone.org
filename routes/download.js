var zipstream = require('zipstream'),
    fs = require('fs'),
    _ = require('underscore')._,
    async = require('async');

var MODULES_PATH = 'node_modules/';

/*
List of available packages, each having a list of files to be copied
*/
var PACKAGES = [
  {
    id: 'backbone',
    files: [
      'backbone.js'
    ]
  },
  {
    id: 'underscore',
    files: [
      'underscore.js'
    ]
  },
  {
    id: 'jquery',
    module: 'backbone',
    files: [
      'test/vendor/jquery-1.7.1.js'
    ]
  },
  {
    id: 'backbone-localstorage',
    module: 'backbone',
    files: [
      'examples/backbone-localstorage.js'
    ]
  },
  {
    id: 'json2',
    module: 'backbone',
    files: [
      'test/vendor/json2.js'
    ]
  }
];

var EXAMPLES = [
  {
    id: 'todo',
    module: 'backbone',
    main: 'examples/todos/index.html',
    files: [
      'examples/todos/todos.js',
      'examples/todos/todos.css',
      'examples/todos/destroy.png'
    ]
  }
];

function Packager(packages, examples, zip) {
  this.packages = packages;
  this.examples = examples;
  this.zip = zip;
};
Packager.prototype.addExample = function(example, callback) {
  var self = this;
  async.series([
    function(next) {
      
      // TODO: modify example file and inject dependencies
      
      
      
      // Add example.main to the zip
      var filePath = example.module + '/' + example.main;
      var localFilePath = MODULES_PATH + filePath;
      self.zip.addFile(fs.createReadStream(localFilePath), { name: example.main }, next);    
    },
    function(next) {
      // Add example.files to the zip
      var addFile = function(path, cb) {
        self._addFile(MODULES_PATH + example.module + '/' + path, path, cb);
      };
      async.forEachSeries(example.files, addFile, next);
    }
  ],
  function(err) {
    callback(err);
  });
};
Packager.prototype.addPackage = function(package, callback, options) {
  var module = package.module || package.id,
      self = this;
  var addFile = function(path, cb) {
    // Add all files to js directory
    var fileName = path.split('/').pop(),
        localPath = MODULES_PATH + module + '/' + path,
        destPath = 'js/' + fileName;    
    self._addFile(localPath, destPath, cb);
  };
  async.forEachSeries(package.files, addFile, callback);
};
Packager.prototype._addFile = function(localPath, destPath, callback) {
  this.zip.addFile(fs.createReadStream(localPath), { name: destPath }, callback);
}

exports.download = function(req, res){
  var selectedPackages = req.query.package || [],
      selectedExamples = req.query.example || [];
      
  if (! (selectedPackages instanceof Array)) {
    selectedPackages = [selectedPackages];
  }
  if (! (selectedExamples instanceof Array)) {
    selectedExamples = [selectedExamples];
  }
  if (selectedPackages.length === 0) {
    return res.send(404);
  }
    
  function find(list, key) {
    return _.find(list, function(p) { return p.id === key });
  }
  // Create a list of package objects
  selectedPackages = _.map(selectedPackages, function findPackage(key) { 
    return find(PACKAGES, key);
  });
  selectedExamples = _.map(selectedExamples, function findExample(key) { 
    return find(EXAMPLES, key);
  });

  // Start streaming the zip file
  var zip = zipstream.createZip();
  res.header('Content-Disposition', 'attachment; filename=backbone.zip');
  zip.pipe(res);

  var packager = new Packager(selectedPackages, selectedExamples, zip);

  async.waterfall([
    // Add example files to zip
    function(next) {
      async.forEachSeries(
        selectedExamples,
        function(item, cb) { packager.addExample(item, cb); },
        function(err) { next(err); }
      );
    },
    // Add packages
    function(next) {
      async.forEachSeries(
        selectedPackages,
        function(item, cb) { packager.addPackage(item, cb); },
        function(err) { next(err); }
      );
    },
    function(next) {
      zip.finalize(function(written) {
        console.log(written + ' total bytes written');
        next(null);
      });
    }
  ], function(err) {
    // TODO??
    
  });
};
