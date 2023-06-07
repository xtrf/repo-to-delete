'use strict';

var publicModule = angular.module('public', ['ui.router']);

publicModule.service('PublicService', function($http, $q) {

	return {
		isSignedIn: isSignedIn,
		signIn: signIn,
		sendResetPasswordEmail: sendResetPasswordEmail,
		validateResetPasswordToken: validateResetPasswordToken,
		resetPassword: resetPassword,
		signInByToken: signInByToken,
		getCloudAuthUrl: getCloudAuthUrl,
		getSecurityConfiguration: getSecurityConfiguration
	};

	function signIn(username, password) {
		var deferred = $q.defer();

		$http.post(baseURL + 'system/login', $.param({username: username, password: password}))
			.then(function() {
				deferred.resolve();
			}, function() {
				deferred.reject();
			});

		return deferred.promise;
	}

	function isSignedIn() {
		return $http.get(baseURL + 'system/session');
	}

	function sendResetPasswordEmail(loginOrEmail) {
		return $http.post(baseURL + 'system/mail/resetPassword', $.param({loginOrEmail: loginOrEmail}));
	}

	function validateResetPasswordToken(token) {
		var validTokenDeferred = $q.defer();

		$http.post(baseURL + 'system/validateToken', $.param({token: token}))
			.then(function(response) {
				if (response.data === true) {
					validTokenDeferred.resolve();
				} else {
					validTokenDeferred.reject();
				}
			})
			.catch(function() {
				validTokenDeferred.reject();
			});

		return validTokenDeferred.promise;
	}

	function resetPassword(username, password, token) {
		return $http.post(baseURL + 'system/account/password',
			$.param({login: username, password: password, passwordConfirmation: password, token: token}));
	}

	function signInByToken(token) {
		return $http.post(baseURL + 'system/loginWithHash', $.param({loginHash: token}));
	}

	function getCloudAuthUrl() {
		return $http.get(baseURL + 'system/oauth2/authurl');
	}

	function getSecurityConfiguration() {
		var defer = $q.defer();
		$http.get(homeApiUrl + 'settings/security/client-portal').then(function(response){
			defer.resolve(response.data);
		}, function() {
			defer.reject();
		})
		return defer.promise;
	}
});

publicModule.controller('PublicController', function($scope, PublicService, settings) {
	$scope.adsDisabled = settings.adsDisabled();
	$scope.logoURL = baseURL + 'system/loginPageLogo?v='+ window.brandingChanged;

	PublicService.isSignedIn().then(function() {
		window.location = 'main.html';
	});
});