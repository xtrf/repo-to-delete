app.directive('passwordWithPreview', function(TrackingService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			password: '=',
			passwordPlaceholder: '=',
			strengthIndicatorEnabled: '=',
			emailForIndicator: '=',
			passwordRequired: '='
		},
		templateUrl: 'app/common/controls/password-with-preview/password-with-preview.html',
		link: function(scope) {
			scope.showPassword = false;

			scope.passwordFieldType = function() {
				return scope.showPassword ? 'text' : 'password';
			};

			scope.showPasswordChanged = function() {
				if (scope.showPassword) {
					TrackingService.trackEvent('Show Password', 'Show password Clicked');
				}
			};
		}
	}
});