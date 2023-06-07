'use strict';

app.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise("/sign-in/");


	$stateProvider
		.state('app.public', {
			abstract: true,
			controller: 'PublicController',
			templateUrl: 'app/public/public.html',
			authenticationRequired: false,
			resolve: {
				settings: function(SettingsView) {
					return SettingsView.promise;
				}
			}
		})
		.state('app.public.sign-in', {
			url: '/sign-in/:token?',
			controller: 'SignInController',
			templateUrl: 'app/public/sign-in/sign-in.html',
			authenticationRequired: false,
			resolve: {
                token: function($q, $stateParams, $state, $timeout, Alerts, PublicService, TrackingService, $window) {

                    return $q(function (resolve, reject) {
                       if($stateParams.token) {

                          PublicService
                               .signInByToken($stateParams.token)
                               .then(function() {
                                   reject(
                                       $window.location = "main.html",
                                       TrackingService.trackEvent('Sign In', 'Successfully Signed In via Token')

                                   );
                               })
                               .catch(function() {
                                   resolve(
                                        Alerts('public').error('public.errors.invalid-token', { preserve: true, closable: true })
                                   );
                               });

                       } else {
                        resolve();
                       }
                    });

				},
				securityConfiguration: function(PublicService) {
					return PublicService.getSecurityConfiguration().then(
						function(res) {
							return res;
						},
						function(err) {
							console.log('default login option loaded');
							return { localAuthEnabled: true }
						}
					);
				}

            }
		})
		.state('app.public.forgotten-password', {
			url: '/forgotten-password',
			controller: 'ForgottenPasswordController',
			templateUrl: 'app/public/reset-password/forgotten-password.html',
			authenticationRequired: false
		})
		.state('app.public.reset-password', {
			url: '/reset-password/:username/:token',
			controller: 'ResetPasswordController',
			templateUrl: 'app/public/reset-password/reset-password.html',
			authenticationRequired: false
		});
});
