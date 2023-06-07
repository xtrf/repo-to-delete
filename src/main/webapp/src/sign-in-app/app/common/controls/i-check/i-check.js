'use strict';

app.directive('iCheck', function($timeout) {
  return {
    require: 'ngModel',
    link: function($scope, element, $attrs, ngModel) {
      return $timeout(function() {
        var value;
        value = $attrs['value'];
        var skin = $attrs['skin'] || 'square-grey';

        $scope.$watch($attrs['ngModel'], function(){
          $(element).iCheck('update');
        });

        return $(element).iCheck({
          checkboxClass: 'icheckbox_' + skin,
          radioClass: 'iradio_' + skin

        }).on('ifChanged', function(event) {
            if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
              $scope.$apply(function() {
                return ngModel.$setViewValue(event.target.checked);
              });
            }
            if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
              return $scope.$apply(function() {
                return ngModel.$setViewValue(value);
              });
            }
          });
      });
    }
  };
});
