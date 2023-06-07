steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	function($) {

		$.Controller("AccountController", {
			init: function(element, options) {
				this.showAccountModal(element, options);
				this.options.companyInfo = {};
				account.socialMedia = new AccountSocialMedia($("body"), options);
				account.profile = new AccountProfile($("body"), options);
			},
			".modal-my-account .btn-close click": function(element) {
				$("#bigModal").modal('hide');
			},

			disableTabsByPermissions: function() {

				if(permissionsTable['company_info_view'] == 0) {
					$('#my-account-tabs a[tab="company-info"]').parent().remove();
				}
				if(permissionsTable['persons_browse'] == 0) {
					$('#my-account-tabs a[tab="contact-persons"]').parent().remove();
				}
				if(permissionsTable['person_view'] == 0) {
					$('#my-account-tabs a[tab="my-profile"]').parent().remove();
				}
			},

			showAccountModalInner: function(tab) {
				$('#bigModal div.tab-content div[tab="' + tab + '"]').addClass('active');
				$('#bigModal ul.nav-tabs a[tab="' + tab + '"]').parent().addClass('active');

				$('#bigModal').on('hidden', function() {
					$("#bigModal").remove();
				});
				$('#bigModal .close').click(function() {
					$('#bigModal').modal('hide');
				});
				$("#bigModal").modal({
					backdrop: 'static'
				});
				$("#my-account .icon-loader-green").remove();
				$("#my-account").removeClass('loading');
				this.disableTabsByPermissions();
				if(permissionsTable['request_quote'] == 1) {
					$(".raq").removeClass('disabled');
					$(".rap").removeClass('disabled');
				}
			},

			showAccountModal: function(element, options) {
				$("#bigModal").remove();
				element.append("templates/account/account_modal.ejs", {activeTab: "1"});

				if(sessionObject.type == "Customer") {
					$('#bigModal ul.nav-tabs a[tab="my-profile"]').parent().remove();
				}

				$(".raq").addClass('disabled');
				$(".rap").addClass('disabled');

				// $('#bigModal').css("top", $('#bigModal').height()*(-1));
				$('#bigModal').css("top", 0);
				var self = this;
				if(options['tab'] == "settings")
					this.showAccountSettings($('#bigModal div.tab-content div[tab="settings"]'), function() {
						self.showAccountModalInner('settings');
					});

				if(options['tab'] == "company-info")
					this.showCompanyInfo($('#bigModal div.tab-content div[tab="company-info"]'), function() {
						self.showAccountModalInner('company-info');
					});

				if(options['tab'] == "my-profile")
					account.profile.showMyProfile($('#bigModal div.tab-content div[tab="my-profile"]'), function() {
						self.showAccountModalInner('my-profile');
					});

			},
			showAccountSettings: function(element, success) {
				Account.getAccountPreferences(function(accountPreferences) {
					Account.getLocales(function(locales) {
						Account.getTimeZones(function(timeZones) {


							$(".modal-my-account .tab-pane .wrapper").html("");

							element.find(".wrapper").html("templates/account/account_settings.ejs", {timeZones: timeZones, locales: locales});
							$("#bigModal .chosen-process").select2({
								width: 'element',
								minimumResultsForSearch: 10,
								allowClear: false
							});

							localizeAttribute("#language-select", "placeholder", null);
							$("#language-select").select2("val", accountPreferences.locale);
							$("#timezone-select").select2("val", accountPreferences.timeZone.id);
							$("#display-tutorial").attr("checked", accountPreferences.displayTutorial);


							if(!settings.securitySettings.localAuthEnabled
								&& settings.securitySettings.ssoEnabled) {
									$("[rel=tooltip]").tooltip();
									$("[rel=tooltip]").on('click', function() {
										$(this).tooltip('hide');
									});
									$('#pass-placeholder .btn-change').addClass('disabled')
							}

							if(success)
								success();

						}, function(error) {
							if(permissionsTable['request_quote'] == 1) {
								$(".raq").removeClass('disabled');
								$(".rap").removeClass('disabled');
							}
							errorHandle(error)
						});
					}, function(error) {
						if(permissionsTable['request_quote'] == 1) {
							$(".raq").removeClass('disabled');
							$(".rap").removeClass('disabled');
						}
						errorHandle(error)
					});

				}, function(error) {
					if(permissionsTable['request_quote'] == 1) {
						$(".raq").removeClass('disabled');
						$(".rap").removeClass('disabled');
					}
					if(error.status == 403) {
						$('#bigModal').remove();
					}
					$("#my-account .icon-loader-green").remove();
					$("#my-account").removeClass('loading');
					errorHandle(error);


				});
			},


			"#pass-placeholder .btn-change click": function(element) {
				if(element.hasClass('disabled')) return;
				var self = this;
				HelperModel.getPasswordStrength(function(passwordStrength) {
					if(passwordStrength.minLength == 0) passwordStrength.minLength = 1;
					self.options.passwordStrength = passwordStrength;


					$(".password-hints").css('display', 'none');
					$(".password-hints").html('templates/account/account_pwd_hints.ejs', {passwordStrength: passwordStrength});
					$(".password-hints .pass-length-hint").html($(".password-hints .pass-length-hint").html().replace("{0}", self.options.passwordStrength.minLength));

					$("#pass-info form").css('display', 'block').css('visibility', 'visible');
					$("#pass-placeholder").css('display', 'none');
				}, function(error) {
					errorHandle(error);
				});


			},
			"#pass-info form .btn-next click": function(element) {

				if(element.hasClass('disabled')) return false;
				element.addClass('loading');
				element.prepend('<i class="icon-loader-green"></i>');
				Account.changePassword($("#old-pass").val(), $("#new-pass1").val(), $("#new-pass2").val(), function(response) {
					$("#old-pass").val("");
					$("#new-pass1").val("");
					$("#new-pass2").val("");

					element.removeClass('loading');
					element.find('i').remove();
					$("#pass-info .content > .alert").remove();
					$("#pass-info #pass-placeholder > .alert").remove();
					$("#pass-info #pass-placeholder").prepend('<div class="alert alert-pass alert-success"><i class="icon-success"></i> <span data-localize="modules.my-account.passoword-changed">The password has been changed successfully!</span></div>');
					$("#pass-info form").css('display', 'none').css('visibility', 'hidden');
					$("#pass-placeholder").css('display', 'block');
					$("#pass-info form .btn-next").addClass('disabled');
					return false;
				}, function(error) {
					element.removeClass('loading');
					element.find('i').remove();
					$("#pass-info .content > .alert").remove();

					var err;
					if(err = $.parseJSON(error.responseText)) {
						if(err.errorMessage != null && err.errorMessage != "")
							$("#pass-info .content").prepend('<div class="alert alert-message alert-error"><i class="icon-error"></i> ' + err.errorMessage + '</div>');
						else
							$("#pass-info .content").prepend('<div class="alert alert-message alert-error"><i class="icon-error"></i> <span data-localize="modules.my-account.passoword-unknown-error">Unknown error while changing password</span></div>');
					} else
						$("#pass-info .content").prepend('<div class="alert alert-message alert-error"><i class="icon-error"></i> <span data-localize="modules.my-account.passoword-unknown-error">Unknown error while changing password</span></div>');
					return false;

				});
			},
			"#pass-change-form submit": function(element) {
				return false;
			},

			"#pass-info .btn-cancel click": function(element) {
				$('#pass-info input[type="text"]').val("");
				$('#pass-info input[type="password"]').val("");
				$("#pass-info form").css('display', 'none').css('visibility', 'hidden');
				$("#pass-placeholder").css('display', 'block');
				return false;
			},

			addEditMode: function(element, success) {
				element.css('width', '580px');
				success();


			},

			removeEditMode: function(element, success) {
				element.animate({width: 485}, 1000, function() {
					success();
				});


			},

			changeAccountSettings: function() {

				Account.getAccountPreferences(function(accountPreferences) {
					accountPreferences.locale = $("#language-select").select2("val");
					accountPreferences.timeZone = {id: $("#timezone-select").select2("val") };

					$("#primary-nav").attr("class", " ").addClass(accountPreferences.locale);
					var currentHash = window.location.hash;
					Account.setAccountPreferences(accountPreferences, function(successData) {

						$("[data-localize]").localize("i18n/customers", { language: accountPreferences.locale });


						sessionObject.locale = accountPreferences.locale;
						localizeAttribute(".filter-files", "placeholder", "");
						localizeAttribute("#contacts", "data-original-title", "");

						setTimeout(function() {
							location.hash = currentHash
						}, 300);
						location.hash = "#!loading";

						//element.removeClass('disabled');
						//element.removeClass('loading');
					}, function(error) {
						errorHandle(error)
					});

				}, function(error) {
					errorHandle(error)
				});

				return false;
			},
			"#locale-info-form #language-select change": function(element) {
				this.changeAccountSettings();
			},
			"#locale-info-form #timezone-select change": function(element) {
				this.changeAccountSettings();
			},

			"#locale-info-form .btn-next click": function(element) {
				if(!element.hasClass('disabled')) {
					element.addClass('disabled');
					element.addClass('loading');

					Account.getAccountPreferences(function(accountPreferences) {
						accountPreferences.displayTutorial = $("#display-tutorial").is(':checked');
						accountPreferences.locale = $("#language-select").select2("val");
						Account.setAccountPreferences(accountPreferences, function(successData) {
							$("[data-localize]").localize("i18n/customers", { language: accountPreferences.locale });
							sessionObject.locale = accountPreferences.locale;
							element.removeClass('disabled');
							element.removeClass('loading');
						}, function(error) {
							errorHandle(error)
						});

					}, function(error) {
						errorHandle(error)
					});

				}
				return false;
			},
			"#locale-info-form .btn-cancel click": function(element) {
				element.addClass('disabled');
				this.showAccountSettings($('#bigModal div.tab-content div[tab="settings"]'), function() {
					element.removeClass('disabled');
				});
			},

			//przelaczanie miedzy kartami
			".modal-my-account .nav-tabs li a click": function(element) {

				if(element.parent().hasClass('disabled')) return false;
				if(!(element.parent().hasClass("active"))) {

					element.addClass('loading');
				} else {

				}
				$(".modal-my-account .nav-tabs li").addClass('disabled');
				if(!element.hasClass('disabled')) {
					element.parents("#bigModal").find(".tab-content").removeClass("moved");
					element.parents("#bigModal").find(".modal-footer").remove();


					var self = this;
					if(!element.parent().hasClass('active') || $('.modal-my-account .tab-content div[tab="' + element.attr('tab') + '"]').hasClass('edit-mode')) {

						$('.modal-my-account .tab-content div[tab="' + element.attr('tab') + '"] .wrapper').html("");
						var timeoutOffset = 0;
						if($(".modal-my-account .tab-content div.active").hasClass('edit-mode')) {
							timeoutOffset = 500;
						}

						setTimeout(function() {
							if(element.attr("tab") == "company-info") {
								account.profile.showCompanyInfo($('#bigModal div.tab-content div[tab="company-info"]'), function() {
									element.parents("ul").children().removeClass('active');
									element.parents("li").addClass('active');
									$(".modal-my-account .tab-content div").removeClass('active');
									$('.modal-my-account .tab-content div[tab="company-info"]').addClass('active');
									$(".modal-my-account .nav-tabs li").removeClass('disabled');
									self.disableTabsByPermissions();
									element.removeClass('loading');
								});

							}
							if(element.attr("tab") == "contact-persons") {
								account.profile.showContactPersons($('#bigModal div.tab-content div[tab="contact-persons"]'), function() {
									element.parents("ul").children().removeClass('active');
									element.parents("li").addClass('active');
									$(".modal-my-account .tab-content div").removeClass('edit-mode');
									$("#my-account-tabs, #id-data").removeClass("edit-mode");
									$(".modal-my-account .tab-content div").removeClass('active');
									$('.modal-my-account .tab-content div[tab="contact-persons"]').addClass('active');
									$(".modal-my-account .nav-tabs li").removeClass('disabled');
									self.disableTabsByPermissions();
									element.removeClass('loading');
								});
							}
							if(element.attr("tab") == "settings") {
								self.showAccountSettings($('#bigModal div.tab-content div[tab="settings"]'), function() {
									element.parents("ul").children().removeClass('active');
									element.parents("li").addClass('active');
									$(".modal-my-account .tab-content div").removeClass('edit-mode');
									$("#my-account-tabs, #id-data").removeClass("edit-mode");

									$(".modal-my-account .tab-content div").removeClass('active');
									$('.modal-my-account .tab-content div[tab="settings"]').addClass('active');

									$(".modal-my-account .nav-tabs li").removeClass('disabled');
									self.disableTabsByPermissions();
									element.removeClass('loading');

								});
							}
							if(element.attr("tab") == "my-profile") {
								account.profile.showMyProfile($('#bigModal div.tab-content div[tab="my-profile"]'), function() {
									element.parents("ul").children().removeClass('active');
									element.parents("li").addClass('active');
									$(".modal-my-account .tab-content div").removeClass('edit-mode');
									$("#my-account-tabs, #id-data").removeClass("edit-mode");

									$(".modal-my-account .tab-content div").removeClass('active');
									$('.modal-my-account .tab-content div[tab="my-profile"]').addClass('active');

									$(".modal-my-account .nav-tabs li").removeClass('disabled');
									self.disableTabsByPermissions();
									element.removeClass('loading');

								});
							}


						}, timeoutOffset);
					} else {

					}
				}


			},
			validateEmail: function(email) {
				var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return re.test(email);
			},
			".add-more click": function(element) {
				if(element.attr("add") == "phone") {
					element.parent().before('<div class="controls phone-controls"><div class="phone-number"><input type="text" class="phone-number-input partner-data"/><button class="sms-enable btn  btn-mini" data-toggle="button"><span data-localize="general.sms-enable">Enable SMS</span></button><a class="item-remove"><i class="icon-file-remove"></i></a></div></div>');
					$(".phone-controls span[data-localize]").localize("i18n/customers", { language: sessionObject.locale });
					if($(".phone-controls").parents('.tab-pane').find('.phone-controls').length >= 3) {
						element.parent().css('display', 'none');
					}
				}
				if(element.attr("add") == "social-network") {
					var snDOM = account.socialMedia.options.socialTemplate.clone();
					snDOM.find('input').val('');
					snDOM.find('.select2-container').remove();
					element.parent().before(snDOM);

					function formatDropdownSN(state) {
						return state.text;
						if(!state.element || !$(state.element[0]).attr('data-network-type')) return state.text; // optgroup
						return "<span class='ico-sm'><span class='icon-" + $(state.element[0]).attr('data-network-type') + "'></span></span> " + state.text;
					}

					function formatResultSN(state) {
						return state.text;
						if(!state.element || !$(state.element[0]).attr('data-network-type')) return state.text; // optgroup
						return "<span class='ico-sm'><span class='icon-" + $(state.element[0]).attr('data-network-type') + "'></span></span>";
					}

					element.parent().prev().find('.social-networks').select2({
						width: 'element',
						minimumResultsForSearch: 10,
						allowClear: true,
						formatResult: formatDropdownSN,
						formatSelection: formatResultSN
					});


				}

				if(element.attr("add") == "communicator") {
					var comDOM = self.options.comTemplate.clone();
					comDOM.find('input').val('');
					comDOM.find('.select2-container').remove();
					element.parent().before(comDOM);

					element.parent().prev().find('.chosen-process').select2({
						width: 'element',
						minimumResultsForSearch: 10,
						allowClear: true
					});
				}
			},

			"#new-pass1 keyup": function(element) {
				var self = this;
				helperController.validateNewPassword($("#new-pass1"), self.options.passwordStrength, $("#pass-info .btn-next"), $("#new-pass2"));
			},
			"#new-pass2 keyup": function(element) {
				var self = this;
				helperController.validateNewPassword($("#new-pass1"), self.options.passwordStrength, $("#pass-info .btn-next"), $("#new-pass2"));
			}
		});
	});