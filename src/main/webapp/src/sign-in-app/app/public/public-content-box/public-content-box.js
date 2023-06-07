'use strict';

publicModule
	.directive('publicContentBox', function($window, $timeout) {
		return {
			replace: false,
			link: function(scope, elem) {

				$timeout(setPublicContentBoxTopMargin, 50);

				angular.element($window).on('resize', setPublicContentBoxTopMargin);

				scope.$on('$stateChangeSuccess', function() {
					$timeout(setPublicContentBoxTopMargin, 500);
				});

				function setPublicContentBoxTopMargin() {
					var publicContentBoxHeight = 0;

					publicContentBoxHeight += $(elem).height();
					if($(".public-content-box.bottom-panel").height()) {
						publicContentBoxHeight += $(".public-content-box.bottom-panel").height();
					}

					if (($window.innerHeight - publicContentBoxHeight) > 0) {
						$(elem).css('margin-top', ($window.innerHeight - publicContentBoxHeight) / 3 + 'px');
					} else {
						$(elem).css('margin-top', 0);
					}
				}
			}
		};
	});

publicModule
	.directive('publicContentBoxHeader', function() {
		return {
			templateUrl: 'app/public/public-content-box/public-content-box-header.html',
			link: function(scope, element, attrs) {
				scope.isSignIn = function() {
					return attrs.publicContentBoxHeader === "sign-in";
				};
			}
		};
	});
