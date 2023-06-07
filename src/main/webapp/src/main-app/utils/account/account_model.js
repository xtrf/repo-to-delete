steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	function($) {
		$.Model('Account', {

			changePassword: function(oldPass, newPass1, newPass2, success, error) {
				return $.ajax({
					url: baseURL + 'system/account/password' + addToURL,
					dataType: 'json',
					type: "PUT",
					contentType: "application/x-www-form-urlencoded",
					data: {oldPassword: oldPass, newPassword: newPass1, newPasswordConfirmation: newPass2},
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			getAccountPreferences: function(success, error) {
				return $.ajax({
					url: baseURL + 'system/account/preferences' + addToURL,
					dataType: 'json',
					type: "GET",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			getContactPersons: function(success, error) {
				return $.ajax({
					url: baseURL + 'customers/' + customerID + '/persons' + addToURL,
					dataType: 'json',
					type: "GET",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			getContactPersonDetails: function(personID, success, error) {
				return $.ajax({
					url: baseURL + 'customers/' + customerID + '/persons/' + personID + addToURL,
					dataType: 'json',
					type: "GET",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			setAccountPreferences: function(accountData, success, error) {
				if(typeof accountData.locale !== 'undefined' && accountData.locale != null) {
					$.cookie('language', accountData.locale);
				}
				return $.ajax({
					url: baseURL + 'system/account/preferences' + addToURL,
					dataType: 'json',
					type: "PUT",
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(accountData),
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			updatePerson: function(personID, contactPerson, success, error) {
				contactPerson.contact.phones = _.uniq(contactPerson.contact.phones);
				return $.ajax({
					url: baseURL + 'customers/' + customerID + '/persons/' + personID + addToURL,
					dataType: 'json',
					type: "PUT",
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(contactPerson),
					xhrFields: { withCredentials: true},
					success: function(data) {
						if(sessionObject.type == "CustomerPerson" && personID == sessionObject.id) {
							if(typeof contactPerson.email !== undefined && contactPerson.email != undefined &&
								typeof contactPerson.name !== undefined && contactPerson.name != undefined
								) {
								sessionObject.email = contactPerson.email;
								sessionObject.name = contactPerson.name;

							}
						}
						success(data);
					},
					error: error
				});
			},
			addPerson: function(contactPerson, success, error) {
				contactPerson.contact.phones = _.uniq(contactPerson.contact.phones);
				return $.ajax({
					url: baseURL + 'customers/' + customerID + '/persons' + addToURL,
					dataType: 'json',
					type: "POST",
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(contactPerson),
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			deletePerson: function(personID, success, error) {
				return $.ajax({
					url: baseURL + 'customers/' + customerID + '/persons/' + personID + addToURL,
					type: "DELETE",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			updateCompanyInfo: function(companyInfo, success, error) {
				companyInfo.contact.phones = _.uniq(companyInfo.contact.phones);
				return $.ajax({
					url: baseURL + 'customers/' + customerID + addToURL,
					data: JSON.stringify(companyInfo),
					dataType: 'json',
					contentType: "application/json; charset=utf-8",
					type: "PUT",
					xhrFields: { withCredentials: true},
					success: function(data) {
						if(sessionObject.type == "Customer") {
							if(typeof companyInfo.contact.email !== undefined && companyInfo.contact.email != undefined) {
								sessionObject.email = companyInfo.contact.email;
							}
						}
						success(data);
					},
					error: error
				});
			},

			getLocales: function(success, error) {
				var availableLanguages = [
					{"id": "be", "name": "Беларуская"},
					{"id": "bg", "name": "Български"},
					{"id": "da", "name": "Dansk"},
					{"id": "de", "name": "Deutsch"},
					{"id": "et", "name": "Eesti"},
					{"id": "el", "name": "Ελληνικά"},
					{"id": "en", "name": "English (UK)"},
					{"id": "en-us", "name": "English (US)"},
					{"id": "es", "name": "Español"},
					{"id": "fr", "name": "Français"},
					{"id": "ga", "name": "Gaeilge"},
					{"id": "is", "name": "Íslenska"},
					{"id": "it", "name": "Italiano"},
					{"id": "ja", "name": "日本語"},
					{"id": "lv", "name": "Latviešu"},
					{"id": "lt", "name": "Lietuvių"},
					{"id": "nl", "name": "Nederlands"},
					{"id": "nl-be", "name": "Nederlands (België)" },
					{"id": "hu", "name": "Magyar"},
					{"id": "no", "name": "Norsk"},
					{"id": "pl", "name": "Polski"},
					{"id": "pt", "name": "Português"},
					{"id": "pt-br", "name": "Português (Brasil)"},
					{"id": "ro", "name": "Română"},
					{"id": "ru", "name": "Pусский"},
					{"id": "sk", "name": "Slovenčina"},
					{"id": "sl", "name": "Slovenščina"},
					{"id": "sv", "name": "Svenska"},
					{"id": "tr", "name": "Türkçe"},
					{"id": "uk", "name": "Українська"},
					{"id": "zh-cn", "name": "中文 (中国)"}
				];
				success(availableLanguages);
			},
			getTimeZones: function(success, error) {
				return $.ajax({
					url: baseURL + 'system/timeZones' + addToURL,
					dataType: 'json',
					type: "GET",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			getCompanyInfo: function(success, error) {
				return $.ajax({
					url: baseURL + 'customers/' + customerID + addToURL,
					dataType: 'json',
					type: "GET",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			getCountries: function(success, error) {
				return $.ajax({
					url: baseURL + 'system/values/countries' + addToURL,
					dataType: 'json',
					type: "GET",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			getProvinces: function(countryID, success, error) {
				if(countryID == 0) {
					return new Array();
				}
				return $.ajax({
					url: baseURL + 'system/values/countries/' + countryID + '/provinces' + addToURL,
					dataType: 'json',
					type: "GET",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			getSocialNetworks: function(success, error) {
				return $.ajax({
					url: baseURL + 'system/values/socialNetworks' + addToURL,
					dataType: 'json',
					type: "GET",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			getCommunicators: function(success, error) {
				return $.ajax({
					url: baseURL + 'system/values/communicators' + addToURL,
					dataType: 'json',
					type: "GET",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			getSocialMedia: function(success, error) {
				return $.ajax({
					url: baseURL + 'system/values/socialMedia' + addToURL,
					dataType: 'json',
					type: "GET",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			}

		}, {});

	});