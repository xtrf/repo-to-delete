'use strict';

var app = angular.module('customerPortal', [
	'public',
	'pascalprecht.translate',
	'ngCookies',
	'angulartics',
	'angulartics.piwik',
	'ngSanitize'
])
.config(function($stateProvider, $translateProvider, $provide, $locationProvider) {
	var $cookies;
	angular.injector(['ngCookies']).invoke(['$cookies', function(_$cookies_) {
		$cookies = _$cookies_;
	}]);

	var defaultLocale = 'en-us';
	var locale = $cookies.get('language') || defaultLocale;
	var i18nDeferred = $.Deferred();
	locale = locale.toLowerCase().replace('_', '-');
	$provide.value('i18nDeferred', i18nDeferred);

	$translateProvider.useStaticFilesLoader({
		prefix: 'i18n/customers-',
		suffix: '.json'
	});

	$stateProvider
		.state('app', {
			abstract: true,
			template: '<div ui-view></div>',
			resolve: {
				translations: function(i18nService) {
					return i18nService.loadLanguage(defaultLocale, locale);
				}
			}
		});
	$locationProvider.hashPrefix('');
})
.run(function($rootScope, SettingsView) {
	SettingsView.promise.then(function(settings) {
		$rootScope.trackingEnabled = settings.trackingEnabled();
		$rootScope.adsDisabled = settings.adsDisabled();
	});
	SettingsView.colors.then(function(colors) {
		Object.keys(colors).forEach(function (key) {
			var variableName = '--' + key;
			document.body.style.setProperty(variableName, colors[key]);
		});
	});
})
if (typeof Function.prototype.bind === "undefined") {
	Function.prototype.bind = function(bind) {
		var self = this;
		return function() {
			var args = Array.prototype.slice.call(arguments);
			return self.apply(bind || null, args);
		};
	};
}

