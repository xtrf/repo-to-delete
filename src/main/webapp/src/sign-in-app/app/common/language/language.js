'use strict';

app.directive('languageSelect', function($timeout) {
	return {
		restrict: 'E',
		templateUrl: 'app/common/language/language.html',
		link: function(scope, element) {
			/*prevent dropdown from hiding*/
			$timeout(function() {
				element.find('select').on('click', function(e) {
					e.stopPropagation();
				});
			}, 0);
		}
	};
});

app.controller('LanguageController',
	function($scope, $rootScope, $translate, $cookies, LanguagesRepository, TrackingService) {
		var languages = new LanguagesRepository();
		$scope.selectedLanguage = $translate.use();
		$scope.availableLanguages = languages.available();
		$scope.changeLanguage = function() {
			$translate
				.use($scope.selectedLanguage)
				.then(function() {
					$rootScope.$broadcast('language-changed');
				});
			$cookies.put('language', $scope.selectedLanguage);
			TrackingService.trackEvent('Change Language', $scope.selectedLanguage);
		};
	}
);

app.service('i18nService', function($translate, $q, $translateStaticFilesLoader) {
	return {
		loadLanguage: function(defaultLocale, locale) {
			var i18nDeferred = $q.defer();
			// first load fallback lang
			$translateStaticFilesLoader({
				key: defaultLocale,
				prefix: 'i18n/customers-',
				suffix: '.json'
			}).then(function(data) {
					$translate
						//.translations(defaultLocale, data)
						.fallbackLanguage(defaultLocale);

					// then try to load desired lang
					if (locale !== defaultLocale) {
						$translateStaticFilesLoader({
							key: locale,
							prefix: 'i18n/customers-',
							suffix: '.json'
						}).then(function(data) {
								$translate
									//.translations(locale, data)
									.use(locale);
								i18nDeferred.resolve();
							}, function() {
								// on lack of translation file use fallback lang
								$translate.use(defaultLocale);
								i18nDeferred.resolve();
							});
					} else {
						$translate.use(defaultLocale);
						i18nDeferred.resolve();
					}
				}, function(lang) {
					// this should never happen
					console.error('Error loading', lang, 'lang file');
				});
			return i18nDeferred.promise;
		}
	}
});

app.factory('LanguagesRepository', function() {
	var available = [
		{ code: 'be', name: 'Беларуская'},
		{ code: 'bg', name: 'Български'},
		{ code: 'da', name: 'Dansk'},
		{ code: 'de', name: 'Deutsch'},
		{ code: 'et', name: 'Eesti'},
		{ code: 'el', name: "Ελληνικά"},
		{ code: 'en', name: 'English (UK)'},
		{ code: 'en-us', name: 'English (US)'},
		{ code: 'es', name: 'Español'},
		{ code: 'fr', name: 'Français'},
		{ code: "ga", name: "Gaeilge"},
		{ code: 'is', name: 'Íslenska'},
		{ code: 'it', name: 'Italiano'},
		{ code: 'ja', name: '日本語'},
		{ code: 'lv', name: 'Latviešu'},
		{ code: 'lt', name: 'Lietuvių'},
		{ code: 'nl-be', name: 'Nederlands (België)'},
		{ code: 'nl', name: 'Nederlands'},
		{ code: 'hu', name: 'Magyar'},
		{ code: 'no', name: 'Norsk'},
		{ code: 'pl', name: 'Polski'},
		{ code: "pt", name: 'Português'},
		{ code: 'pt-br', name: 'Português (Brasil)'},
		{ code: 'ro', name: 'Română'},
		{ code: 'ru', name: 'Pусский'},
		{ code: 'sk', name: 'Slovenčina'},
		{ code: 'sl', name: 'Slovenščina'},
		{ code: 'sv', name: 'Svenska'},
		{ code: 'tr', name: 'Türkçe'},
		{ code: 'uk', name: 'Українська'},
		{ code: 'zh-cn', name: '中文 (中国)'}
	];

	return function() {
		// be careful - order of elements determine order on UI

		var codesOf = function(languages) {
			return _.pluck(languages, 'code');
		};

		return {
			available: function() {
				return available;
			},

			isAvailable: function(code) {
				return _.contains(codesOf(available), code);
			},

			isNotAvailable: function(code) {
				return !this.isAvailable(code);
			}
		};
	};
});