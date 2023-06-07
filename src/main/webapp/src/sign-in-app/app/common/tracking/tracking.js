'use strict';

app.service('TrackingService', function($rootScope, $translate, $analytics, SettingsView) {

	var category = 'Sign In Pages';
	var trackingEnabled = false;
	var releaseVersion = 'unknown';
	var ownerName = 'unknown';
	var locale = 'unknown';

	SettingsView.promise.then(function(settings) {
		trackingEnabled = settings.trackingEnabled();
		releaseVersion = settings.releaseVersion();
		ownerName = settings.ownerName();
	});

	$translate.onReady().then(changeLocale);
	$rootScope.$on('$translateChangeEnd', changeLocale);

	function changeLocale() {
		locale = $translate.use();
	}

	this.trackEvent = _.debounce(function(action, label, value) {
		if (trackingEnabled) {
			$analytics.setCustomVariable(1, "version", releaseVersion, "visit");
			$analytics.setCustomVariable(2, "locale", locale, "visit");
			$analytics.setCustomVariable(3, "owner", ownerName, "visit");
			$analytics.eventTrack(action, {
				category: category,
				label: label,
				value: value
			});
		}
	}, 100);

});
