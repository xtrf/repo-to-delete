'use strict';

app.directive('passwordStrengthIndicator', function($q, PasswordStrengthService, PasswordStrengthValidator, $translate) {
	return {
		restrict: 'E',
		replace: true,
		require: '?ngModel',
		template: '<div class="password-strength-indicator"></div>',
		link: function(scope, element, attrs, model) {
			PasswordStrengthService.promise.then(function(passwordStrength) {
				var passwordStrengthValidator = new PasswordStrengthValidator(passwordStrength.rules);

				scope.$watch(attrs.ngModel, function(password) {
					var login = scope.$eval(attrs.login);
					validate(password, login);
				});

				scope.$watch('login', function(login) {
					validate(model.$modelValue, login);
				});

				function validate(password, login) {
					var firstInvalidRule = passwordStrengthValidator.firstInvalidRule(password, login);
					if (firstInvalidRule) {
						model.$setValidity('strong', false);
						element.text($translate.instant('public.reset-password.strength-rules.' + firstInvalidRule));
					} else {
						model.$setValidity('strong', true);
						element.text('');
					}
				};

			});
		}
	};
});

app.factory('PasswordStrengthValidator', function() {
	var rules = {
		minLength: function(password) {
			if (password.length < 8) {
				return false;
			}
			return true;
		},
		notContainLogin: function(password, login) {
			if (!s.isBlank(login) && password.indexOf(login) !== -1) {
				return false;
			}
			return true;
		},
		lowerLetter: function(password) {
			var reg = new RegExp('[a-z]', 'g');
			if (!reg.test(password)) {
				return false;
			}
			return true;
		},
		upperLetter: function(password) {
			var reg = new RegExp('[A-Z]', 'g');
			if (!reg.test(password)) {
				return false;
			}
			return true;
		},
		digit: function(password) {
			var reg = new RegExp('[0-9]', 'g');
			if (!reg.test(password)) {
				return false;
			}
			return true;
		},
		specialChar: function(password) {
			var reg = new RegExp('[^0-9a-zA-Z]', 'g');
			if (!reg.test(password)) {
				return false;
			}
			return true;
		}
	};

	return function(passwordStrengthRules) {
		this.firstInvalidRule = function(password, login) {
			var invalidRule = null;
			if (password && passwordStrengthRules) {
				_.each(passwordStrengthRules, function(ruleName) {
					if (!invalidRule && !isPassingRule(ruleName, password, login)) {
						invalidRule = ruleName;
					}
				});
			}
			return invalidRule;
		};
	};

	function isPassingRule(ruleName, password, login) {
		return rules[ruleName](password, login);
	};

});

app.service('PasswordStrengthService', function($q, $http) {
	var deferred = $q.defer();

	$http.get(baseURL + 'system/account/password/strength').then(function(response) {
		var passwordStrength = {
			rules: toRulesArray(response.data)
		};
		deferred.resolve(passwordStrength);
	});

	this.promise = deferred.promise;

	function toRulesArray(rules) {
		var passwordRules = [];
		_.each(rules, function(isActive, ruleName) {
			if (isActive) {
				passwordRules.push(ruleName);
			}
		});
		return passwordRules;
	}

});