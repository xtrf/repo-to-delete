'use strict';

var sharedConfig = require('./karma.conf.js');

module.exports = function(config) {
	var conf = sharedConfig();

	// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
	conf.logLevel = config.LOG_INFO;
	conf.reporters = ['dots'];
	conf.runnerPort = 9100;
	conf.colors = true;
//  conf.autoWatch = false;
//  conf.singleRun = true;

	conf.files = conf.files.concat([
		'./bower_components/angular-mocks/angular-mocks.js',
		'./app/**/*.spec.js'
	]);

	config.set(conf);
};