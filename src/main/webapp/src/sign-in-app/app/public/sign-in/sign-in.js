'use strict';

publicModule
	.controller('SignInController', function($scope, $timeout, $translate, PublicService, Alerts, TrackingService, securityConfiguration) {
		$scope.signIn = function() {
			TrackingService.trackEvent('Sign In', 'Sign In Button Clicked');
			$scope.signInInProgress = true;
			PublicService
				.signIn($scope.username, $scope.password)
				.then(function() {
					TrackingService.trackEvent('Sign In', 'Successfully Signed In via Sign In Form');
					$timeout(function() {
						window.location = 'main.html';
					}, 100);
				})
				.catch(function() {
					Alerts('public').error('public.sign-in.errors.username-or-password-invalid', { closable: true });
					$scope.signInInProgress = false;
				});
		}
		$scope.cloudLogIn = function() {
			PublicService.getCloudAuthUrl().then(function(res) {
				console.log(res);
				window.location.href = res.data.authUrl;
			}).catch(function(err) {
				console.log(err);
				// Alerts('public').error('');
			});
		}

		$scope.securityConfiguration = securityConfiguration;

	});