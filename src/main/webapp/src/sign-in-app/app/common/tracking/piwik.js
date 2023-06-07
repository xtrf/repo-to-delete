'use strict';

app.directive('piwik', function() {
	return {
		restrict: 'E',
		templateUrl: 'app/common/tracking/piwik.html'
	};
});