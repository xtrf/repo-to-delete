'use strict';

publicModule
	.controller('ForgottenPasswordController', function($scope, PublicService, Alerts, TrackingService) {

		TrackingService.trackEvent('Trouble Signing In', 'Having trouble signing in? Link Clicked');
		$scope.sendingInProgress = false;

		$scope.sendResetPasswordEmail = function() {
			$scope.sendingInProgress = true;
			PublicService
				.sendResetPasswordEmail($scope.username)
				.then(function() {
					$scope.sendingInProgress = false;
					$scope.resetPasswordEmailSent = true;
					Alerts('public').clearAllExceptPreserved();
					Alerts('public').success({
						title: 'public.forgotten-password.reset-email-sent.title',
						message: 'public.forgotten-password.reset-email-sent.message'
					}, { closable: true });
				})
				.catch(function() {
					$scope.sendingInProgress = false;
					Alerts('public').error('public.forgotten-password.errors.user-not-found', { closable: true });
				});
			TrackingService.trackEvent('Send Password Reset E-mail', 'Send Password Reset E-mail Button Cliked');
		}
	});