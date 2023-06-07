'use strict';

publicModule
	.directive('disclaimer', function(DisclaimerService, TrackingService, $sce) {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'app/public/disclaimer/disclaimer.html',
			link: function($scope) {
				var shortenedLength = 120;
				initDisclaimer();

				$scope.$on('language-changed', function() {
					DisclaimerService.reload();
					initDisclaimer();
				});

				function initDisclaimer() {
					$scope.disclaimer = '';
					$scope.hasDisclaimer = false;
					$scope.shortened = false;

					DisclaimerService.promise()
						.then(function(disclaimer) {
							if (disclaimer && disclaimer.length > 0) {
								showDisclaimer($sce.getTrustedHtml(disclaimer));
							}
						})
				}

				function showDisclaimer(disclaimer) {
					$scope.hasDisclaimer = true;
					if (disclaimer.length > shortenedLength) {
						showShorten(disclaimer);
						$scope.readMore = function() {
							showOriginal(disclaimer);
							TrackingService.trackEvent('Read Full Usage Warning Message', 'Read More Link Clicked');
						};
					} else {
						showOriginal(disclaimer);
					}
				}

				function showShorten(disclaimer) {
					$scope.disclaimer = disclaimer.substr(0, shortenedLength) + '...';
					$scope.shortened = true;
				}

				function showOriginal(disclaimer) {
					$scope.disclaimer = disclaimer;
					$scope.shortened = false;
				}
			}
		}
	});

publicModule
	.service('DisclaimerService', function($q, $http, $translate) {

		var deferred = $q.defer();
		loadDisclaimer();

		return {
			promise: function() {
				return deferred.promise;
			},
			reload: function() {
				deferred = $q.defer();
				loadDisclaimer();
			}
		};

		function loadDisclaimer() {
			$http.get(baseURL + 'system/disclaimer?lang=' + $translate.use())
				.then(function(response) {
					deferred.resolve(response.data);
				});
		}
	});