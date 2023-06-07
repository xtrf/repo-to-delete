if (!baseURL)
	var baseURL = '';
if (!buildNumber)
	var buildNumber = '';
var addToURL = "";
var contacts = null;
var companyName = "";
var portalName = "";
var fallbackLanguage = 'en-us';
var sessionObject = {'locale': fallbackLanguage};
var settings = {};
var helperController;
var loaderString = ' <div class="overlay"><div class="loader"><img src="static/img/js_img/351.gif"></div></div>';
steal(
	'./session.js',
	'./settings.js',
	'jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	'jquery/jquery.js').then(function($) {
		steal('./../static/js/underscore.js',
			'./../static/js/jquery.localize.js',
			'./contacts.js',
			'./helper.js',
			'./../static/js/jquery.cookie.js',
			'./../static/js/bootstrap/bootstrap-modal.js',
			'./../static/js/bootstrap/bootstrap-transition.js',
			'./../static/js/bootstrap/bootstrap-dropdown.js',
			'./../static/js/bootstrap/bootstrap-tooltip.js',
			'./../static/js/jQuery.XDomainRequest.js',


			function($) {
				$.ajaxSetup({ cache: false });
				helperController = new Helper(document.body);
				$.loadFallbackLanguage(fallbackLanguage);
				$.each(['append', 'prepend', 'after', 'before', 'html'], function(i, funcName) {
					if (!$.fn[funcName]) return;
					var old = $.fn[funcName];
					$.fn[funcName] = function() {
						if (typeof this.attr("data-localize") == 'undefined') {
							var r = old.apply(this, arguments);
							if ($.cookie("xnl") == "true") {
								if ($(this).find("[data-localize]").length > 0)
									$.each($(this).find("[data-localize]"), function() {
										$(this).html($(this).data('localize'));
									});
							}
							else {
								if ($.cookie("language") != null)
									$(this).find("[data-localize]").localize("i18n/customers", { language: $.cookie("language") });
							}
							return r;
						} else {
							var r = old.apply(this, arguments);
							return r;
						}
					}
				});


				if (!$.support.cors && window.XDomainRequest) {
					addToURL = ".json";
				}

				$.route.ready(false);

				var url = window.location.pathname;
				var filename = url.substring(url.lastIndexOf('/') + 1);

				loadSettings(function(_settings) {
					settings = _settings;
				});

				if (filename != "reset-password.html") {

					getSession();

				} else {
					resetPasswordPage();
				}


			});
		/*END*/
	});
function loginFail(httpObj) {
	if (!$("#password-group").hasClass("error")) {
		$("#password-group").append('<span class="help-inline">Here we go - an error occured!</span>');
		$("#password-group").addClass("error");
	}
}


function loginSuccess(httpObj) {

	location.href = "index2.html";
}


function fillSession(httpObj) {
	if (httpObj != null) {
		location.href = "index2.html";
	} else {
		$.cookie("jsessionid", null);
		$("body .overlay").remove();
		$("#all-content").css('display', 'block');
		readyPage();
	}
}

function setDefaultLogo(img) {
		img.src = baseURL + 'branding/images?type=BRANDING_IMAGE';
}


function loginPage() {

	autoLogin(function() {

		$.ajax({
			url: baseURL + 'system/locales',
			dataType: 'json',
			type: "GET",
			xhrFields: { withCredentials: true},
			success: function(locales) {


				$("body #all-content").remove();

				$("body").append("templates/layouts/login_lay.ejs", {locales: locales, buildNumber: buildNumber});

				if ($.cookie('routeLang') != null) {
					var routeLang = $.cookie('routeLang');
					$.cookie('routeLang', null);
					setLanguage(locales, routeLang);

				} else {
					setLanguage(locales);
				}


				if ($.cookie("language") != null) {
					$('.dropdown-menu a[language="' + $.cookie("language") + '"]').click();
				}

				$("#form-container").html("templates/login/login.ejs", {"logoUrl": baseURL + 'system/loginPageLogo', buildNumber: buildNumber});
				$("#username").focus();
				$("[data-localize]").localize("i18n/customers", { language: $.cookie("language") });

				if ($.cookie('password_changed') == 1) {

					$("#login-form").prepend('<div class="alert alert-info alert-pass-recovery"><i class="icon-info"></i><span class="info" data-localize="general.your-password-has-been-changed">Your password has been changed. You can now login with new password.</span></div>');

					$.cookie('password_changed', null);
				}

				hideAds();

				$("#login-form").submit(function() {

					currentElement = $("#login-button");
					if (!currentElement.hasClass('disabled')) {
						currentElement.addClass('disabled');
						$("#login-form .form-actions").append('<div class="overlay"><div class="loader"><img src="static/img/js_img/351.gif" /></div></div>');
						$("#login-form #password-group").removeClass('error');
						$("#login-form #username-group").removeClass('error');
						$("#login-form .alert-pass-recovery").remove();

						$.ajax({
							url: baseURL + 'system/login' + addToURL,
							dataType: 'json',
							data: ({username: $("#login-form #username").val(), password: $("#login-form #password").val()}),
							timeout: 60000,
							type: "POST",
							contentType: "application/x-www-form-urlencoded; charset=UTF-8",
							xhrFields: { withCredentials: true},
							success: function(data, textStatus) {
								if (!$.support.cors && window.XDomainRequest) {
									$.cookie("jsessionid", data.jsessionid);
									getSession();
								} else
									getSession();

							},
							error: function(XHR, textStatus, errorThrown) {
								currentElement.removeClass('disabled');
								$("#login-form").addClass('error');
								$("#login-form #password-group").addClass('error');
								$("#login-form #username-group").addClass('error');
								$("#login-form").prepend('<div class="alert alert-error alert-pass-recovery"><i class="icon-error"></i><span class="info" data-localize="login.invalid">Login you have entered is not valid!</span></div>');
								$("[data-localize]").localize("i18n/customers", { language: $.cookie("language") });
								$("#login-form .form-actions .overlay").remove();
							}

						});

					}
					return false;
				});

				function hideAds() {
					if (settings && settings.adsDisabled) {
						$('.xtrf-logo').hide();
					}
				}
			},
			error: function(error) {
			}
		});
	});
}


function setLanguage() {
	var locales = arguments[0];
	var newLang = fallbackLanguage;

	if (arguments[1]) {
		var routeLocale = arguments[1];

		var isInLocales = false
		$.each(locales, function(index, value) {
			if (routeLocale == value.id)
				isInLocales = true;
		});

		if (isInLocales == true) {
			newLang = routeLocale;

		}
	} else {

		if ($.cookie("language") != null) {
			newLang = $.cookie("language");
		} else {
			var userLang = (navigator.language) ? navigator.language : navigator.userLanguage;
			userLang = userLang.replace('-', '_');
			var isInLocales = false;
			$.each(locales, function(index, value) {
				if (userLang == value.id)
					isInLocales = true;
			});
			if (userLang != null && userLang != '' && isInLocales == true) {
				newLang = userLang;
			}
		}

	}

	$("[data-localize]").localize("i18n/customers", { language: newLang });
	$.cookie("language", newLang, {expires: 30});
	sessionObject.locale = newLang;


}


function passwordRecovery() {
	$("#form-container").html("templates/login/password_recovery.ejs", {"logoUrl": baseURL + 'system/loginPageLogo'});
	$("[data-localize]").localize("i18n/customers", { language: $.cookie("language") });

	setTitle('Password Recovery', 'page-titles.password-recovery');


	$("#pass-recovery-btn").click(function() {

		if ($("#username").val() == "") {
			$("#pass-recovery-form #username-group").addClass('error');

		} else {
			$("#pass-recovery-form #username-group").removeClass('error');
			$.ajax({
				url: baseURL + 'system/mail/resetPassword' + addToURL,
				dataType: 'json',
				type: "POST",
				data: {"loginOrEmail": $("#username").val()},
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",
				xhrFields: { withCredentials: true},
				success: function(msg) {
					$("#pass-recovery-form .alert").remove();
					$("#username-group").after('<div class="alert alert-success alert-pass-recovery"><i class="icon-success"></i> <span data-localize="login.password-recovery.recovery-success">We sent you an email with instructions on how to reset your password!</span></div>');
					$("[data-localize]").localize("i18n/customers", { language: $.cookie("language") });
				},
				error: function(error) {


					$("#pass-recovery-form .alert").remove();
					$("#username-group").after('<div class="alert alert-error alert-pass-recovery">' +
						'<i class="icon-error"></i><span data-localize="login.password-recovery.recovery-failed">Account with given e-mail address does not exist or is inactive.</span> ' +
						'<span data-localize="login.password-recovery.try-again">Please try again or</span> ' +
						'<a class="contact-us password-recovery"><span data-localize="login.password-recovery.report-problem">report the problem</span></a>.</div>');
					$("[data-localize]").localize("i18n/customers", { language: $.cookie("language") });
				}
			});
		}

		return false;
	});

}


function readyPage() {

	$.Controller("Routing", {
		"route": function() {
			setTitle('Login', 'page-titles.login');
			loginPage();
			$("[data-localize]").localize("i18n/customers", { language: $.cookie("language") });

		},
		"password-recovery route": function() {
			passwordRecovery();

		},
		"#language-bar ul li a click": function(element) {
			var newLang = element.attr("language");
			$("#language-choosen").html(element.parent().html() + '<b class="caret"></b>');

			$("[data-localize]").localize("i18n/customers", { language: newLang });
			$.cookie("language", newLang, {expires: 30});

			sessionObject.locale = newLang;

			$.cookie("changedLanguage", true);
			displayDisclaimer(newLang);

		},
		".disclaimer-text .read-more click": function() {
			$(".disclaimer-text .long-text").show();
			$(".disclaimer-text .short-text").hide();
		},
		".disclaimer-text .read-less click": function() {
			$(".disclaimer-text .long-text").hide();
			$(".disclaimer-text .short-text").show();
		},
		":lang route": function(data) {
			$.cookie('routeLang', data.lang);
			location.hash = '#!';
		}


	});

	if (contacts != null) {
		contacts.init($("body"), {inSingle: true});
	} else {
		contacts = new Contacts($("body"), {inSingle: true});
	}


	route2 = new Routing(document.body);
	setTimeout("$.route.ready(true);", 300);

	function displayDisclaimer(languageCode) {
		$.ajax({
			url: baseURL + 'system/disclaimer?lang=' + languageCode + addToURL,
			type: "GET",
			xhrFields: { withCredentials: true},
			success: function(msg, code, xhrObject) {
				if (xhrObject.status === 200) {
					$(".disclaimer").show();
					if (msg.length > 120) {
						$(".disclaimer-text .long-text .text").html(msg);
						$(".disclaimer-text .short-text .text").html(msg.substr(0, 120) + '(...)');
						$(".disclaimer-text .short-text .read-more").show();
					} else {
						$(".disclaimer-text .short-text .text").html(msg);
						$(".disclaimer-text .short-text").show();
						$(".disclaimer-text .long-text").hide();
						$(".disclaimer-text .short-text .read-more").hide();
					}

				} else {
					$(".disclaimer").hide();
				}
			}
		});
	}
}

function resetPasswordPage() {
	document.title = "Password reset | XTRF Customer Portal";
	var prmstr = window.location.search.substr(1);
	var prmarr = prmstr.split("&");
	var params = {};

	for (var i = 0; i < prmarr.length; i++) {
		var tmparr = prmarr[i].split("=");
		params[tmparr[0]] = tmparr[1];
	}
	if (params['resetToken'] == null || params['login'] == null)
		location.href = "index.html";


	$.ajax({
		url: baseURL + 'system/validateToken' + addToURL,
		dataType: 'json',
		type: "POST",
		data: {"token": params['resetToken']},
		xhrFields: { withCredentials: true},
		success: function(msg) {
			if (msg == false) {
				$("body").append('templates/errors/token_invalid.ejs', {});
				$('#myModal').on('hidden', function() {
					location.href = "index.html";
				});
				$("#myModal").modal('show');
			}
		},
		error: function(msg) {
			location.href = "index.html";
		}
	});


	$.ajax({
		url: baseURL + 'system/locales',
		dataType: 'json',
		type: "GET",
		success: function(locales) {
			$("body #all-content").remove();

			$("body").append("templates/layouts/login_lay.ejs", {locales: locales, buildNumber: buildNumber});
			if ($.cookie("language") != null) {
				$('.dropdown-menu a[language="' + $.cookie("language") + '"]').click();
			}

			$("#form-container").html("templates/login/reset-password.ejs", {"logoUrl": baseURL + 'system/loginPageLogo', buildNumber: buildNumber});


			$("#username").focus();
			$("[data-localize]").localize("i18n/customers", { language: $.cookie("language") });


		},
		error: function(error) {
		}
	});


	$.Controller("Routing", {
		"#language-bar ul li a click": function(element) {
			$("#language-choosen").html(element.parent().html() + '<b class="caret"></b>');
			$("[data-localize]").localize("i18n/customers", { language: element.attr("language") });
			$.cookie("language", element.attr("language"), {expires: 30});
		},
		"#pass-recovery-btn click": function(element) {
			if (element.hasClass('disabled')) return false;
			var pwdReset = $.ajax({
				url: baseURL + 'system/account/password' + addToURL,
				dataType: 'json',
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",
				type: "POST",
				data: {"login": params['login'].replace('%20', ' '), "token": params['resetToken'], 'password': $("#new-pass-1").val(), 'passwordConfirmation': $("#new-pass-2").val()},
				success: function(msg) {
					$.cookie('password_changed', 1);
					location.href = "index.html";
					//$("section.content .alert").remove();
					//$("#pass-2-group").after('<div class="alert alert-success alert-pass-recovery"><i class="icon-success"></i>Your password has been changed. You can now <a href="index.html">login</a> with new password.</div>');
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					var headers = XMLHttpRequest.getAllResponseHeaders();
					$("section.content .alert").remove();

					var errorObject = {};
					var addErrorMessage = "";
					if (errorObject = $.parseJSON(XMLHttpRequest.responseText)) {
						if (errorObject.errorMessage) {
							$("body").append('<span id="temp2" style="display:none;" data-localize="login.errors.' + errorObject.errorMessage.toLowerCase() + '"></span>');
							$("#temp2[data-localize]").localize("i18n/customers", { language: sessionObject.locale });
							addErrorMessage = '(<span data-localize="login.errors.' + errorObject.errorMessage.toLowerCase() + '">' + $("#temp2").html() + '</span>)';
							$("#temp2").remove();
						}
					}


					$("#pass-2-group").after('<div class="alert alert-error alert-pass-recovery"><i class="icon-error"></i> <span data-localize="login.errors.we-apologise">We apologise but we were unable to change your password</span>' + addErrorMessage + '. <span data-localize="login.errors.please-try-again">Please try again or report the problem.</span></div>');

				}
			});


			return false;
		},
		"#language-bar ul li a click": function(element) {
			var newLang = element.attr("language");
			$("#language-choosen").html(element.parent().html() + '<b class="caret"></b>');

			$("[data-localize]").localize("i18n/customers", { language: newLang });
			$.cookie("language", newLang, {expires: 30});
			sessionObject.locale = newLang;
		},
		"#new-pass-1 keyup": function(element) {
			var self = this;
			if (typeof self.options.passwordStrength == 'undefined') {
				HelperModel.getPasswordStrength(function(passwordStrength) {
					passwordStrength.digit = true;
					if (passwordStrength.minLength == 0) passwordStrength.minLength = 1;

					self.options.passwordStrength = passwordStrength;
					$(".password-hints").html('templates/account/account_pwd_hints.ejs', {passwordStrength: passwordStrength});
					$(".password-hints .pass-length-hint").html($(".password-hints .pass-length-hint").html().replace("{0}", self.options.passwordStrength.minLength));
					helperController.validateNewPassword($("#new-pass-1"), self.options.passwordStrength, $("#pass-recovery-btn"), $("#new-pass-2"));

				});
			} else
				helperController.validateNewPassword($("#new-pass-1"), self.options.passwordStrength, $("#pass-recovery-btn"), $("#new-pass-2"));
		},
		"#new-pass-2 keyup": function(element) {
			var self = this;
			if (typeof self.options.passwordStrength == 'undefined') {
				HelperModel.getPasswordStrength(function(passwordStrength) {
					passwordStrength.digit = true;
					if (passwordStrength.minLength == 0) passwordStrength.minLength = 1;

					$(".password-hints").html('templates/account/account_pwd_hints.ejs', {passwordStrength: passwordStrength});
					$(".password-hints .pass-length-hint").html($(".password-hints .pass-length-hint").html().replace("{0}", self.options.passwordStrength.minLength));
					self.options.passwordStrength = passwordStrength;
					helperController.validateNewPassword($("#new-pass-1"), self.options.passwordStrength, $("#pass-recovery-btn"), $("#new-pass-2"));
				});
			} else
				helperController.validateNewPassword($("#new-pass-1"), self.options.passwordStrength, $("#pass-recovery-btn"), $("#new-pass-2"));
		},
		validateNewPassword: function() {
			if ($("#new-pass-1").val() != "" || $("#new-pass-2").val() != "") {
				$(".password-hints").css('opacity', '1');
			} else {
				$(".password-hints").css('opacity', '0');
			}

			var passwordValidated = true;

			function addError(inSelector) {
				if (!inSelector.hasClass('alert-error')) {
					inSelector.removeClass('alert-success').addClass('alert-error');
					inSelector.find(".icon-success").addClass('icon-error').removeClass('icon-success');
				}
				passwordValidated = false;
			}

			function removeError(inSelector) {
				if (inSelector.hasClass('alert-error')) {
					inSelector.addClass('alert-success').removeClass('alert-error');
					inSelector.find(".icon-error").addClass('icon-success').removeClass('icon-error');
				}
			}


			var pswd = $("#new-pass-1").val();
			if (pswd.length < 8) {
				addError($(".pass-length"));
			} else {
				removeError($(".pass-length"));
			}

			if (pswd.match(/[a-z]/)) {
				removeError($(".pass-l-letter"));
			} else {
				addError($(".pass-l-letter"));
				//$('#letter').removeClass('valid').addClass('invalid');
			}

			if (pswd.match(/[A-Z]/)) {
				removeError($(".pass-u-letter"));
			} else {
				addError($(".pass-u-letter"));
			}

			if (pswd.match(/[0-9]/)) {
				removeError($(".pass-numeral"));
			} else {
				addError($(".pass-numeral"));
			}

			if (pswd.match(/[\W\_]/)) {
				removeError($(".pass-special"));
			} else {
				addError($(".pass-special"));
			}

			if ($("#new-pass-1").val() != $("#new-pass-2").val()) {
				addError($(".pass-matches"));
			} else {
				removeError($(".pass-matches"));

			}

			if (passwordValidated) {
				$("#pass-recovery-btn").removeClass('disabled');
			} else {
				$("#pass-recovery-btn").addClass('disabled');
			}

		}
	});

	if (contacts != null) {
		contacts.init($("body"), {inSingle: true});
	} else {
		contacts = new Contacts($("body"), {inSingle: true});
	}


	route2 = new Routing(document.body);
	setTimeout("$.route.ready(true);", 300);

}


function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if (results == null)
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function autoLogin(error) {
	var autoLoginHash = getParameterByName('loginHash');

	if (autoLoginHash) {
		// $.cookie("jsessionid",null);
		$.ajax({
			url: baseURL + 'system/loginWithHash' + addToURL,
			dataType: 'json',
			type: "POST",
			data: {"loginHash": autoLoginHash},
			timeout: 60000,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			success: function(data, textStatus) {
				//TODO nie pokazywac formularza logowania
				if (!$.support.cors && window.XDomainRequest) {
					$.cookie("jsessionid", data.jsessionid);
					getSession();
				} else
					getSession();

				//location.href="index.html";
			},
			error: error

		});


	} else {
		error();
	}
}


function setVerticalModalMargin() {
	if ($(".indicator").length > 0)
		$(".indicator").css("left", ($("#primary-nav ul li.active").position().left + $("#primary-nav li.active").width() / 2 - 7) + "px");

	if ($(".modal-iconic").length > 0) {
		$(".modal-iconic").css('top', '0');
		if ($(window).height() > $(".modal-iconic").height()) {
			$(".modal-iconic").css('margin-top', ($(window).height() - $(".modal-iconic").height()) / 2 + "px");
		} else {
			$(".modal-iconic").css('margin-top', "0");
		}
	}
}
