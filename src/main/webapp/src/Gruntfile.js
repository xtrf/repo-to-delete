module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-rev');
	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-rename');
	grunt.loadNpmTasks('grunt-chmod');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-sass')
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-cdnify');
	grunt.loadNpmTasks('grunt-google-cdn');
	grunt.loadNpmTasks('grunt-karma');

	var hashStamp = ((new Date()).valueOf().toString()) + (Math.floor((Math.random() * 1000000) + 1).toString());
	var os = require('os');
	var jsMVCAppFolder = 'main-app';
	var angularAppFolder = 'sign-in-app';
	var targetAppFolder = '../dest';
	var sass = require('node-sass');

	grunt.initConfig({
		targetAppFolder: targetAppFolder,
		signInAppSrc: {
			base: '',
			index: ['/index.html'],
			resetPassword: ['/reset-password.html'],
			js: ['/**/*.js'],
			sass: {
				dir: ['/assets/styles'],
				main: [ '/assets/styles/main.scss'],
				watch: ['/assets/styles/**/*.scss']
			},
			html: {
				app: ['/app/**/*.html'],
				files: ['<%= signInAppSrc.html.app %>']
			},
			images: {
				dir: ['/assets/images'],
				files: ['images/{,*/}*.{png,jpg,jpeg,gif,ico}'],
				svg: ['/assets/images/{,*/}*.{svg}'],
				watch: ['/assets/images/{,*/}*.{png,jpg,jpeg,gif,ico}']
			},
			fonts: {
				dir: ['/assets/font'],
				files: ['font/**/*'],
				watch: ['/assets/font/**/*']
			},
			bower: ['bower_components']
		},
		exec: {
			'dev': {
				cwd: targetAppFolder,
				cmd: 'js required/build.js'
			},
			'production': {
				cwd: targetAppFolder,
				cmd: function() {
					if (process.platform == "win32")
						return 'js required/build.js';
					return './js required/build.js';
				}
			}
		},
		chmod: {
			options: {
				mode: '755'
			},
			chmod1: {
				src: ['../dest/js', '../dest/js.bat']
			}
		},
		sass: {
			mainAppDev: {
				options: {
					implementation: sass,
					outputStyle: 'expanded',
					sourceMap: true
				},
				files: {
					"<%= targetAppFolder %>/static/css/main.min.css": jsMVCAppFolder + "/static/scss/bootstrap_updates.scss"
				}
			},
			mainAppProduction: {
				options: {
					implementation: sass,
					outputStyle: 'compressed'
				},
				files: {
					"<%= targetAppFolder %>/static/css/main.min.css": jsMVCAppFolder + "/static/scss/bootstrap_updates.scss"
				}
			},
			signInAppDev:{
				options: {
					implementation: sass,
					outputStyle: 'expanded',
					sourceMap: true,
				},
				files: {
					"<%= targetAppFolder %>/styles/main.css": angularAppFolder + "<%= signInAppSrc.sass.main %>"
				}
			},
			signInAppProduction:{
				options: {
					implementation: sass,
					outputStyle: 'compressed'
				},
				files: {
					"<%= targetAppFolder %>/styles/main.css": angularAppFolder + "<%= signInAppSrc.sass.main %>"
				}
			}
		},
		useminPrepare: {
			html: angularAppFolder + '<%= signInAppSrc.index %>',
			options: {
				dest: targetAppFolder
			}
		},
		autoprefixer: {
			options: ['last 1 version'],
			dist: {
				files: [
					{
						expand: true,
						cwd: '.tmp/styles/',
						src: '{,*/}*.css',
						dest: '.tmp/styles/'
					}
				]
			}
		},

		cdnify: {
			dist: {
				html: [targetAppFolder + '/*.html']
			}
		},
		uglify: {
			options: {
				mangle: false
			},
			dist: {
				files: [
					{
						'<%= targetAppFolder %>/scripts/scripts.js': [angularAppFolder + '/app/**/*.js', angularAppFolder + '/common/**/*.js']
					}
				]
			}
		},

		watch: {
			'mainAppStyles': {
				files: [jsMVCAppFolder + '/static/scss/*.scss'],
				tasks: ['sass:mainAppDev']
			},
			'mainAppScripts': {
				files: [jsMVCAppFolder + '/utils/*.js'],
				tasks: ['copy:mainAppScripts']
			},
			'mainAppTemplates': {
				files: [jsMVCAppFolder + '/templates/**/*.ejs'],
				tasks: ['copy:mainAppTemplates']
			},
			'i18n': {
				files: ['i18n/*.json'],
				tasks: ['copy:i18n']
			},
			signInAppStyles: {
				files: [angularAppFolder + '<%= signInAppSrc.sass.watch %>'],
				tasks: ['sass:signInAppDev']
			},
			signInAppHtml: {
				files: [angularAppFolder + '<%= signInAppSrc.index %>', angularAppFolder + '<%= signInAppSrc.html.files %>', angularAppFolder + '<%= signInAppSrc.resetPassword %>'],
				tasks: ['copy:signInAppHtml', 'htmlmin:dist']
			},
			signInAppAssets: {
				files: [angularAppFolder + '<%= signInAppSrc.images.watch %>', angularAppFolder + '<%= signInAppSrc.fonts.watch %>'],
				tasks: ['copy:signInAppAssets']
			},
			signInAppScripts: {
				files: [angularAppFolder + '<%= signInAppSrc.js %>'],
				tasks: ['copy:signInAppScripts']
			}
		},
		copy: {
			'mainAppRequired': {
				files: [
					{expand: true, cwd: jsMVCAppFolder + '/steal/', src: ['**/*'], dest: targetAppFolder + '/steal/'},
					{expand: true, cwd: jsMVCAppFolder + '/jquery/', src: ['**/*'], dest: targetAppFolder + '/jquery/'}
				]
			},
			'mainAppScripts': {
				files: [
					{expand: true, cwd: jsMVCAppFolder + '/utils/', src: ['**/*'], dest: targetAppFolder + '/utils/'},
					{expand: true, cwd: jsMVCAppFolder + '/required/', src: ['**/*'], dest: targetAppFolder + '/required/'}
				]
			},
			'mainAppTemplates': {
				files: [
					{expand: true, cwd: jsMVCAppFolder + '/templates/', src: ['**/*'], dest: targetAppFolder + '/templates/'}
				]
			},
			'mainAppStatic': {
				files: [
					{expand: true, cwd: jsMVCAppFolder + '/static/', src: ['**/*'], dest: targetAppFolder + '/static/'}
				]
			},
			'i18n': {
				files: [
					{expand: true, cwd: 'i18n/', src: ['*.json'], dest: targetAppFolder + '/i18n/'}
				]
			},
			'oldMain': {
				files: [
					{expand: true, cwd: jsMVCAppFolder + '/', src: ['*.*'], dest: targetAppFolder + '/'},
					{expand: true, cwd: jsMVCAppFolder + '/', src: ['js'], dest: targetAppFolder + '/'}
				]
			},
			signInAppAssets: {
				files: [
					{
						expand: true,
						dot: true,
						cwd: angularAppFolder + '/assets',
						dest: targetAppFolder,
						src: [
							'<%= signInAppSrc.images.files %>',
							'<%= signInAppSrc.fonts.files %>'
						]
					}
				]
			},
			signInAppBower: {
				files: [
					{
						expand: true,
						cwd: angularAppFolder,
						dest: targetAppFolder,
						src: 'bower_components/**/*.js'
					}
				]
			},
			signInAppScripts: {
				files: [
					{
						expand: true,
						cwd: angularAppFolder + '<%= signInAppSrc.base %>',
						dest: targetAppFolder,
						src: '{vendors,app,common}/**/*.js'
					}
				]
			},
			signInAppHtml: {
				files: [
					{
						expand: true,
						cwd: angularAppFolder + '<%= signInAppSrc.base %>',
						dest: targetAppFolder,
						src: '{app,common}/**/*.html'
					}
				]
			},
			all: {
				expand: true,
				cwd: jsMVCAppFolder + '/',
				src: ['**'],
				dest: targetAppFolder + '/'
			},
			js: {
				expand: true,
				cwd: jsMVCAppFolder + '/js'

			}
		},
		clean: {
			options: {
				force: true
			},
			first: {
				src: [targetAppFolder]
			},
			mainAppSassAndScripts: {
				src: [targetAppFolder + "/static/sass", targetAppFolder + "/utils"]
			},
			all: {
				src: [targetAppFolder]
			}
		},
		rev: {
			options: {
				encoding: 'utf8',
				algorithm: 'md5',
				length: 8
			},
			mainApp: {
				files: [
					{
						src: [
							targetAppFolder + '/static/css/*.css',
							targetAppFolder + '/static/img/*.*',
							targetAppFolder + '/static/img/tour/*.*'
						]
					}
				]
			},
			signInApp: {
				files: {
					src: [
						targetAppFolder + '/scripts/{,*/}*.js',
						targetAppFolder + '/styles/{,*/}*.css',
						targetAppFolder + '/images/generated/*',
						targetAppFolder + '/styles/fonts/*'
					]
				}
			}
		},
		'string-replace': {
			dist: {
				files: {
					'<%= targetAppFolder %>/': targetAppFolder + '/*.html'
				},
				options: {
					replacements: [
						{
							pattern: "steal.js?utils/utils.js",
							replacement: 'steal.js?production/site/production.' + hashStamp + '.js'
						},
						{
   							pattern: "required/baseurl.js",
   							replacement: 'required/baseurl.' + hashStamp + '.js'
   						},
					]
				}
			}
		},
		usemin: {
			html: [targetAppFolder + '/*.html', targetAppFolder + '/templates/**/*.ejs', targetAppFolder + '/production/**/*.js'],
			css: [targetAppFolder + '/static/css/*.css']
		},
		htmlmin: {
			dist: {
				files: [
					{
						expand: true,
						cwd: angularAppFolder + '<%= signInAppSrc.base %>',
						src: ['*.html', 'app/**/*.html', 'common/**/*.html'],
						dest: targetAppFolder
					}
				]
			}
		},
		rename: {
			site: {
				src: targetAppFolder + '/production/site/production.js',
				dest: targetAppFolder + '/production/site/production.' + hashStamp + '.js'
			},
			required: {
			    src: targetAppFolder + '/required/baseurl.js',
                dest: targetAppFolder + '/required/baseurl.' + hashStamp + '.js'
			}
		},
		connect: {
			server: {
				options: {
					port: 9001,
					base: targetAppFolder,
					hostname: 'localhost'
				}
			}
		},
		karma: {
			unit: {
				configFile: angularAppFolder + '/test/karma-unit.conf.js',
				autoWatch: false,
				singleRun: true
			}
		}

	});


	grunt.registerTask('server', ['connect:server', 'watch']);

	grunt.registerTask('copyMainApp', [
		'copy:mainAppRequired',
		'copy:mainAppStatic',
		'copy:mainAppTemplates',
		'copy:mainAppScripts',
		'copy:i18n',
		'copy:oldMain'
	]);


	grunt.registerTask('mainAppDev', [
		'copyMainApp',
		'sass:mainAppDev'
	]);

	grunt.registerTask('signInAppDev', [
		'sass:signInAppDev',
		'copy:signInAppAssets',
		'copy:signInAppBower',
		'copy:signInAppScripts',
		'htmlmin:dist'
	]);

	grunt.registerTask('signInAppBuild', [
		'useminPrepare',
		'sass:signInAppProduction',
		'htmlmin',
		'autoprefixer',
		'concat',
		'copy:signInAppAssets',
		'uglify',
		'rev:signInApp',
		'karma:unit',
		'usemin'
	]);


	grunt.registerTask('mainAppBuild', [
		'copyMainApp',
		'sass:mainAppProduction',
		'chmod:chmod1',
		'exec:production',
		'rev:mainApp',
		'clean:mainAppSassAndScripts',
		'string-replace',
		'rename:site',
		'rename:required',
		'usemin'
	]);

	grunt.registerTask('build', [
		'clean:all',
		'mainAppBuild',
		'signInAppBuild'
	]);

	grunt.registerTask('default', ['build']);

	grunt.registerTask('dev', [
		'clean:all',
		'connect:server',
		'mainAppDev',
		'signInAppDev',
		'watch'
	]);

	grunt.registerTask('test', ['karma:unit']);

};