'use strict';

app.factory('HttpRequestsInterceptor', function () {
	return {
		request: function (config) {
			config.withCredentials = true;
			config.headers['Content-Type'] = "application/x-www-form-urlencoded; charset=UTF-8"
			return config;
		}
	};
});

app.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('HttpRequestsInterceptor');
}]);
