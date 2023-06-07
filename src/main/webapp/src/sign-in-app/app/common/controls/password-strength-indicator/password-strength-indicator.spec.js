'use strict';

describe('Password Strength Indicator', function () {

	var weakPasswordRules = [];
	var mediumPasswordRules = ['minLength','notContainLogin','lowerLetter','upperLetter'];
	var strongPasswordRules = ['minLength','notContainLogin','lowerLetter','upperLetter','digit','specialChar'];

	beforeEach(module('customerPortal'));

	it('should require 8 characters when minLength rule',inject(function(PasswordStrengthValidator) {
		var ruleName = 'minLength';
		var passwordStrengthValidator = new PasswordStrengthValidator([ruleName]);
		expect(passwordStrengthValidator.firstInvalidRule('a','login')).toEqual(ruleName);
		expect(passwordStrengthValidator.firstInvalidRule('prettylongpassword','login')).toBeNull();
	}));

	it('should require digit characters when digit rule',inject(function(PasswordStrengthValidator) {
		var ruleName = 'digit';
		var passwordStrengthValidator = new PasswordStrengthValidator([ruleName]);
		expect(passwordStrengthValidator.firstInvalidRule('a','login')).toEqual(ruleName);
		expect(passwordStrengthValidator.firstInvalidRule('prettylongpassword','login')).toEqual(ruleName);
		expect(passwordStrengthValidator.firstInvalidRule('a8','login')).toBeNull();
	}));

	it('should require special character when specialChar rule',inject(function(PasswordStrengthValidator) {
		var ruleName = 'specialChar';
		var passwordStrengthValidator = new PasswordStrengthValidator([ruleName]);
		expect(passwordStrengthValidator.firstInvalidRule('a','login')).not.toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('prettylongpassword','login')).not.toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('a@','login')).toBeNull();
	}));

	it('should require upper letter character when upperLetter rule',inject(function(PasswordStrengthValidator) {
		var ruleName = 'upperLetter';
		var passwordStrengthValidator = new PasswordStrengthValidator([ruleName]);
		expect(passwordStrengthValidator.firstInvalidRule('a','login')).toEqual(ruleName);
		expect(passwordStrengthValidator.firstInvalidRule('prettylongpassword','login')).toEqual(ruleName);
		expect(passwordStrengthValidator.firstInvalidRule('aA','login')).toBeNull();
	}));

	it('should require lower letter character when lowerLetter rule',inject(function(PasswordStrengthValidator) {
		var ruleName = 'lowerLetter';
		var passwordStrengthValidator = new PasswordStrengthValidator([ruleName]);
		expect(passwordStrengthValidator.firstInvalidRule('A','login')).toEqual(ruleName);
		expect(passwordStrengthValidator.firstInvalidRule('LONGPASSWORD','login')).toEqual(ruleName);
		expect(passwordStrengthValidator.firstInvalidRule('aA','login')).toBeNull();
	}));

	it('should require to not contain login when notContainLogin rule',inject(function(PasswordStrengthValidator) {
		var ruleName = 'notContainLogin';
		var passwordStrengthValidator = new PasswordStrengthValidator([ruleName]);
		expect(passwordStrengthValidator.firstInvalidRule('A','login')).toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('LONGPASSWORD','login')).toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('aAlogin','login')).toEqual(ruleName);
	}));


	it('should not require any rule when weak password', inject(function(PasswordStrengthValidator) {
		var passwordStrengthValidator = new PasswordStrengthValidator(weakPasswordRules);
		expect(passwordStrengthValidator.firstInvalidRule('a','login')).toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('124','login')).toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('prettyLongPassword','login')).toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('prettylongpassword','login')).toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('shortP','login')).toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('Containslogin','login')).toBeNull();
	}));


	it('should require proper rules when medium password', inject(function(PasswordStrengthValidator) {
		var passwordStrengthValidator = new PasswordStrengthValidator(mediumPasswordRules);
		expect(passwordStrengthValidator.firstInvalidRule('prettyLongPassword','login')).toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('prettylongpassword','login')).not.toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('shortP','login')).not.toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('Containslogin','login')).not.toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('UPPERCASEPASS','login')).not.toBeNull();
	}));

	it('should require proper rules when strong password', inject(function(PasswordStrengthValidator) {
		var passwordStrengthValidator = new PasswordStrengthValidator(strongPasswordRules);
		expect(passwordStrengthValidator.firstInvalidRule('prettyLongPassword','login')).not.toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('prettylongpassword','login')).not.toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('shortP','login')).not.toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('Containslogin','login')).not.toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('UPPERCASEPASS','login')).not.toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('Test123','login')).not.toBeNull();
		expect(passwordStrengthValidator.firstInvalidRule('Test123!','login')).toBeNull();
	}));


});
