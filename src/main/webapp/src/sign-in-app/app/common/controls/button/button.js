'use strict';

app.directive('loading', function(){
	return {
		restrict: 'A',
		transclude: true,
		template: '<span translate ng-transclude></span>',
		scope: {
			loading: '@'
		},
		link: function(scope, element){

			scope.$watch('loading', function(newValue){
				if(newValue !== 'true'){
					element.removeClass('btn-loading');
				}
				else{
					element.addClass('btn-loading');
				}
			});

		}
	};
});


app.directive('translatedLoading', function(){
	return {
		restrict: 'A',
		transclude: true,
		template: '<span ng-transclude></span>',
		scope: {
			loading: '@'
		},
		link: function(scope, element){

			scope.$watch('loading', function(newValue){
				if(newValue !== 'true'){
					element.removeClass('btn-loading');
				}
				else{
					element.addClass('btn-loading');
				}
			});

		}
	};
});