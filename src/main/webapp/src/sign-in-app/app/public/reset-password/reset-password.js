'use strict';

publicModule.controller('ResetPasswordController', function($scope, $stateParams, Alerts, PublicService, TrackingService) {
	$scope.showResetPasswordForm = true;
	$scope.username = $stateParams.username;
	PublicService
		.validateResetPasswordToken($stateParams.token)
		.catch(function() {
			$scope.showResetPasswordForm = false;
			Alerts('public').error({
				title: 'public.reset-password.token-invalid.title',
				message: 'public.reset-password.token-invalid.message'
			});
		});

	$scope.resetPassword = function() {
		$scope.resettingInProgress = true;
		PublicService
			.resetPassword($scope.username, $scope.password, $stateParams.token)
			.then(function() {
				Alerts('public').clearAllExceptPreserved();
				Alerts('public').success({
					title: 'public.reset-password.password-changed.title',
					message: 'public.reset-password.password-changed.message'
				});
				$scope.showResetPasswordForm = false;
				$scope.resettingInProgress = false;
			})
			.catch(function() {
				$scope.resettingInProgress = false;
				Alerts('public').error('public.reset-password.errors.password-change-problem', { closable: true })
			});
		TrackingService.trackEvent('Change Password', 'Change Password Button Clicked');
	}
});