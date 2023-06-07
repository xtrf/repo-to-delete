'use strict';

app.service('SettingsView', function($q, $http) {
	var deferred = $q.defer();
	var deferredColors = $q.defer();

	$http.get(baseURL + 'system/settings')
		.then(function(response) {
			var settings = response.data;
			var readOnlySettings = _.mapObject(settings, function(value, key) {
				return function() {
					return settings[key];
				};
			});
			deferred.resolve(readOnlySettings);
		});

	$http.get(baseURL + 'branding/colors').then(function(response) {
		var colors = {
			topNavigationBackgroundColor: '#FBFBFB',
			topNavigationBackgroundHoverColor: '#FBFBFB',
			topNavigationFontColor: '#535353',
			mainComponentsPrimaryColor: '#00BA00',
			mainComponentsPrimaryHoverColor: '#00AD00',
			mainComponentsTabsColor: '#535353',

			mainComponentsFontColor: "#FFFFFF",
			topNavigationButtonsColor: "#B03127",
			topNavigationButtonsHoverColor: "#B03127"
	};
		angular.extend(colors, response.data);
		deferredColors.resolve(colors);
	});

	this.promise = deferred.promise;
	this.colors = deferredColors.promise;
});