// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function() {
	return{
		basePath: '../',
		frameworks: ['jasmine'],
		plugins: [
			'karma-phantomjs-launcher',
			'karma-jasmine',
			'karma-ng-html2js-preprocessor'
		],

		preprocessors: {
			"src/app/**/*.html": ["ng-html2js"]
		},
		ngHtml2JsPreprocessor: {
			stripPrefix: 'src/',
			moduleName: 'templates'
		},
		files: [
			'../main-app/required/baseurl.js',
			'bower_components/angular/angular.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
			'bower_components/jquery/dist/jquery.js',
			'bower_components/angular-cookies/angular-cookies.js',
			'bower_components/angular-translate/angular-translate.js',
			'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
			'bower_components/underscore/underscore.js',
			'bower_components/underscore.string/dist/underscore.string.js',
			'bower_components/angular-ui-router/release/angular-ui-router.js',
			'bower_components/angulartics/src/angulartics.js',
			'bower_components/angulartics/src/angulartics-piwik.js',
			'app/public/public.js',
			'app/app.js',
			'app/**/!(*.spec).js',
			'app/**/*.html'
		],
		exclude: [],
		port: 9876,
		urlRoot: '/',
		autoWatch: true,
		browsers: ['PhantomJS'],
		singleRun: false
	};
};
