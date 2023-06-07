steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	function($) {

		$.Controller("AccountProfile", {
			init: function(element, options) {
				this.options.openedPersons = new Array();
			},
			showContactPersons: function(element, success) {
				var self = this;
				Account.getContactPersons(function(contactPersons) {
					$.each(contactPersons, function(index, value) {
						contactPersons[index].avatar = baseURL + 'customers/' + customerID + '/persons/' + value.id + '/image?width=63&height=63&crop=true&v=' + value.version+ '&timpestamp=' + (new Date().getTime());
						if(sessionObject.type == "CustomerPerson" && value.id == sessionObject.id) {
							contactPersons[index].showDelete = false;
						} else {
							contactPersons[index].showDelete = true;
						}
					});
					$(".modal-my-account .tab-pane .wrapper").html("");
					var addPermission = true;
					var editPermission = true;
					var deletePermission = true;
					if(permissionsTable['person_add'] == 0) {
						addPermission = false;
					}
					if(permissionsTable['person_edit'] == 0) {
						editPermission = false;
					}
					if(permissionsTable['person_delete'] == 0) {
						deletePermission = false;
					}


					element.find(".wrapper").html("templates/account/account_contactpersons.ejs", {contactPersons: contactPersons, addPermission: addPermission, editPermission: editPermission, deletePermission: deletePermission});
					$(".tab-content").scrollTo({top: '0px', left: '0'}, 200);

					if(addPermission == true) {
						element.parents("#bigModal").append("templates/account/account_modal_footer.ejs", {});
						element.parents("#bigModal").find(".tab-content").addClass("moved");
					}

					if(permissionsTable['person_view'] == 0) {
						$("#contact-channels .contact-person").addClass('disabled');
					}


					var tmpArray = self.options.openedPersons;
					$.each(tmpArray, function(index, value) {
						account.profile.showContactPersonDetails($('.contact-persons-list .contact-person[user="' + value + '"]'), false);
					});

					if(!settings.securitySettings.localAuthEnabled
						&& settings.securitySettings.ssoEnabled) {
							$("[rel=tooltip]").tooltip();
							$("[rel=tooltip]").on('click', function() {
								$(this).tooltip('hide');
							});
							$('.new-contact-person').addClass('disabled')
					}

					if(success)
						success();
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
			showMyProfile: function(element, success) {
				var self = this;
				Account.getContactPersonDetails(sessionObject.id, function(contactPerson) {
					contactPerson.avatar = baseURL + 'customers/' + customerID + '/persons/' + contactPerson.id + '/image?width=63&height=63&crop=true&v=' + contactPerson.version + '&timpestamp=' + (new Date().getTime());
					$(".modal-my-account .tab-pane .wrapper").html("");
					element.find(".wrapper").html('templates/account/account_mp.ejs', {contactPerson: contactPerson});
					if(success)
						success();

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
			showContactPersonDetails: function(element, doSlide) {
				var self = this;
				if(element.hasClass('expanded')) {
					element.find(".contact-details").slideUp();
					element.removeClass('expanded');
				} else {
					Account.getContactPersonDetails(element.attr("user"), function(contactPerson) {
						element.find(".contact-details").html('templates/account/account_cp_details.ejs', {contactPerson: contactPerson});
						if(doSlide)
							element.find(".contact-details").slideDown(500, function() {
							});
						else
							element.find(".contact-details").css('display', 'block');
						element.addClass('expanded');
					}, function(error) {
						errorHandle(error)
					});
				}
				self.options.openedPersons = new Array();
				$.each($(".contact-persons-list >div.expanded"), function() {
					self.options.openedPersons[self.options.openedPersons.length] = $(this).attr('user');

				});
			},
			".contact-persons-list .contact-person click": function(element, event) {
				if(element.hasClass('disabled')) return false;
				var self = this;
				if(!$(event.target).parent().hasClass('link-small') && !$(event.target).hasClass('link-small') && !$(event.target).hasClass('btn') && !$(event.target).hasClass('icon') && !$(event.target).hasClass('edit-person-social-media')) {

					if(element.hasClass('new-contact-person')) {

					} else
						account.profile.showContactPersonDetails(element, true);
				}
			},


			"#my-profile-info .btn-cancel click": function(element) {
				if(element.parents(".tab-pane").attr("tab") == "contact-persons") {
					account.profile.showContactPersons($('#bigModal div.tab-content div[tab="contact-persons"]'), function() {
						$('#bigModal div.tab-content div[tab="contact-persons"]').attr("style", "");
						$('#bigModal div.tab-content div[tab="contact-persons"]').removeClass('edit-mode');
						$("#my-account-tabs, #id-data").removeClass("edit-mode");

					});

				} else if(element.parents(".tab-pane").attr("tab") == "my-profile") {
					account.profile.showMyProfile($('#bigModal div.tab-content div[tab="my-profile"]'), function() {
						$('#bigModal div.tab-content div[tab="my-profile"]').attr("style", "");
						$('#bigModal div.tab-content div[tab="my-profile"]').removeClass('edit-mode');
						$("#my-account-tabs, #id-data").removeClass("edit-mode");

					});
				}
			},
			"#my-profile-info .btn-edit click": function(element) {
				this.editMyProfile(sessionObject.id, $('#bigModal div.tab-content div[tab="my-profile"]'));
			},
			editMyProfile: function(personID, element) {
				var self = this;
				Account.getContactPersonDetails(personID, function(contactPerson) {
					element.attr('style', "");
					element.addClass('edit-mode');
					$("#my-account-tabs, #id-data").addClass("edit-mode");
					contactPerson.avatar = baseURL + 'customers/' + customerID + '/persons/' + contactPerson.id + '/image?width=63&height=63&crop=true&v=' + contactPerson.version + '&timpestamp=' + (new Date().getTime());;
					$("#bigModal #my-profile-info").remove();
					contactPerson.contact.showMobile = true;
					contactPerson.contact.phonesSMS = new Array();

					$.each(contactPerson.contact.phones, function(index, phone) {
						contactPerson.contact.phonesSMS[index] = 0;
					});

					var oneOfPhonesIsMobile = false;

					if(contactPerson.contact.mobile != null && $.trim(contactPerson.contact.mobile) != "") {

						$.each(contactPerson.contact.phones, function(index, phone) {
							if(phone == contactPerson.contact.mobile) {
								oneOfPhonesIsMobile = true;
								if(contactPerson.contact.smsEnabled == true) {
									contactPerson.contact.phonesSMS[index] = 1;
								}
							}
						});

						if(!oneOfPhonesIsMobile) {
							var tempLength = contactPerson.contact.phones.length;
							contactPerson.contact.phones[tempLength] = contactPerson.contact.mobile;
							contactPerson.contact.showMobile = false;
							if(contactPerson.contact.smsEnabled == true) {
								contactPerson.contact.phonesSMS[tempLength] = 1;
							} else {
								contactPerson.contact.phonesSMS[tempLength] = 0;
							}
						} else {

						}

					}


					element.find(".wrapper").html("templates/account/account_mp_edit.ejs", {contactPerson: contactPerson});
					$(".tab-content").scrollTo({top: '0px', left: '0'}, 200);
					account.profile.editProfileValidate();
					element.find("#change-avatar-form").attr("action", baseURL + 'customers/' + customerID + '/persons/' + personID + '/image' + addToURL.substr(5));


					var jqXHR = $('#change-avatar-form').fileupload({
						url: baseURL + 'customers/' + customerID + '/persons/' + personID + '/image' + addToURL.substr(5),
						uploadTemplateId: null,
						downloadTemplateId: null,
						autoUpload: true,
						dataType: 'json',
						xhrFields: { withCredentials: true }
					}).bind('fileuploadadd',function(e, data) {
							element.find("#change-avatar-form .fileinput-button span").prepend('<i class="icon-loader-green"></i>');
						}).bind('fileuploaddone',function(e, data) {
							element.find("#change-avatar-form .fileinput-button span i").remove();
							var timestamp = new Date().getTime();
							$('#change-avatar-form img').attr('src', baseURL + 'customers/' + customerID + '/persons/' + personID + '/image?width=63&height=63&crop=true&timpestamp=' + (new Date().getTime()));
							$('#change-avatar-form img').load();
							$("#profile-picture img").attr('src', baseURL + 'customers/' + customerID + '/persons/' + personID + '/image?width=63&height=63&crop=true&timpestamp=' + (new Date().getTime()));

							$("#my-account .profile-pic img").attr('src', baseURL + 'customers/' + customerID + '/persons/' + personID + '/image?width=53&height=53&crop=true&timpestamp=' + (new Date().getTime()));

						}).bind('fileuploadfail', function(e, data) {
							element.find("#change-avatar-form .fileinput-button i").remove();
							element.find('#change-avatar-form .alert-wrapper').append('<div class="alert alert-message alert-error"><i class="icon-error"></i> <span data-localize="">Avatar could not be changed.</span></div>');
							setTimeout(function() {
								element.find('#change-avatar-form .alert').fadeOut(1000, function() {
									element.find('.content .alert').remove();
								});
							}, 10000)
						});


					element.find('#mp-use-partner-data').attr("checked", contactPerson.usePartnerAddress);
					account.profile.profileUsePartnerAddress(contactPerson.usePartnerAddress);
				}, function(error) {
					errorHandle(error)
				});
			},
			showCompanyInfo: function(element, success) {
				var self = this;
				Account.getCompanyInfo(function(companyInfo) {

					self.options.companyInfo = companyInfo;
					$(".modal-my-account .tab-pane .wrapper").html("");

					companyInfo.contact.showMobile = false;
					companyInfo.contact.showMobile = false;
					var addMobileToList = true;
					$.each(companyInfo.contact.phones, function(index, phone) {
						if(phone == companyInfo.contact.mobile) {
							addMobileToList = false;
						}
					});

					if($.trim(companyInfo.contact.mobile) == "") addMobileToList = false;

					if(addMobileToList) {
						companyInfo.contact.phones[companyInfo.contact.phones.length] = companyInfo.contact.mobile;
					}


					element.find(".wrapper").html("templates/account/account_companyinfo.ejs", {companyInfo: companyInfo});
					if(permissionsTable['my_account_edit'] == 0) {
						$("#company-data .btn-edit").addClass('disabled');
					}
					if(success)
						success();
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
			editProfileValidate: function() {
				if($("#my-profile-info #mp-firstName").val() == "" || $("#my-profile-info #mp-email").val() == "" || !account.account.validateEmail($("#my-profile-info #mp-email").val())) {
					$("#my-profile-info .btn-cta").addClass('disabled');
				} else {
					$("#my-profile-info .btn-cta").removeClass('disabled');
				}
			},
			"#my-profile-info #mp-firstName keyup": function(element) {
				this.editProfileValidate();
			},
			"#my-profile-info #mp-email keyup": function(element) {
				this.editProfileValidate();
			},

			"#company-contact-info #ci-email keyup": function(element) {
				this.editCompanyInfoValidate();
			},
			'.new-contact-person click': function(element) {
				if(element.hasClass('disabled')) return;
				var self = this;
				element.parents("#bigModal").find(".tab-content").removeClass("moved");
				element.parents("#bigModal").find(".modal-footer").remove();


				var contactData = {id: "0", name: "", email: "", position: "", firstName: "", lastName: "", usePartnerAddress: true, address: null, contact: {phones: new Array(), mobile: "", smsEnabled: false, fax: "", email: "", www: "", socialMediaContacts: new Array()}};
				$('#bigModal div.tab-content div[tab="contact-persons"]').attr("style", "");
				$('#bigModal div.tab-content div[tab="contact-persons"]').addClass('edit-mode');
				$("#my-account-tabs, #id-data").addClass("edit-mode");


				contactData.avatar = "";
				$("#bigModal #my-profile-info").remove();
				$('#bigModal div.tab-content div[tab="contact-persons"] .wrapper').html("templates/account/account_mp_edit.ejs", {contactPerson: contactData});
				self.editProfileValidate();
			},
			profileUsePartnerAddress: function(usePartnerAddress) {
				if(usePartnerAddress == true) {
					$(".partner-data").attr("disabled", "disabled");
					$(".phone-controls .item-remove").css('display', 'none');
					$('.add-more[add="phone"]').parent().css('display', 'none');
				} else {
					$(".partner-data").removeAttr("disabled");
					$(".phone-controls .item-remove").css('display', 'block');
					if($(".phone-controls").length < 3)
						$('.add-more[add="phone"]').parent().css('display', 'block');
				}
			},
			"#mp-use-partner-data change": function(element) {
				var self = this;
				if($("#mp-use-partner-data").is(':checked')) {

					Account.getCompanyInfo(function(contactData) {
						contactData.contact.showMobile = true;
						contactData.contact.phonesSMS = new Array();
						$.each(contactData.contact.phones, function(index, phone) {
							contactData.contact.phonesSMS[index] = 0;
						});
						var oneOfPhonesIsMobile = false;
						if(contactData.contact.mobile != null && $.trim(contactData.contact.mobile) != "") {

							$.each(contactData.contact.phones, function(index, phone) {
								if(phone == contactData.contact.mobile) {
									oneOfPhonesIsMobile = true;
									if(contactData.contact.smsEnabled == true) {
										contactData.contact.phonesSMS[index] = 1;
									}
								}
							});

							if(!oneOfPhonesIsMobile) {
								var tempLength = contactData.contact.phones.length;
								contactData.contact.phones[tempLength] = contactData.contact.mobile;
								contactData.contact.showMobile = false;
								if(contactData.contact.smsEnabled == true) {
									contactData.contact.phonesSMS[tempLength] = 1;
								} else {
									contactData.contact.phonesSMS[tempLength] = 0;
								}
							} else {

							}

						}


						$("#use-customer-data").html("templates/account/account_customer_data.ejs", {contactData: contactData});
						self.profileUsePartnerAddress($("#mp-use-partner-data").is(':checked'));
					}, function(error) {
						errorHandle(error)
					});
				} else {

					Account.getContactPersonDetails($("#my-profile-info").attr('person-id'), function(contactData) {
						contactData.contact.showMobile = true;
						contactData.contact.phonesSMS = new Array();

						$.each(contactData.contact.phones, function(index, phone) {
							contactData.contact.phonesSMS[index] = 0;
						});

						var oneOfPhonesIsMobile = false;

						if(contactData.contact.mobile != null && $.trim(contactData.contact.mobile) != "") {

							$.each(contactData.contact.phones, function(index, phone) {
								if(phone == contactData.contact.mobile) {
									oneOfPhonesIsMobile = true;
									if(contactData.contact.smsEnabled == true) {
										contactData.contact.phonesSMS[index] = 1;
									}
								}
							});

							if(!oneOfPhonesIsMobile) {
								var tempLength = contactData.contact.phones.length;
								contactData.contact.phones[tempLength] = contactData.contact.mobile;
								contactData.contact.showMobile = false;
								if(contactData.contact.smsEnabled == true) {
									contactData.contact.phonesSMS[tempLength] = 1;
								} else {
									contactData.contact.phonesSMS[tempLength] = 0;
								}
							}

						}

						$("#use-customer-data").html("templates/account/account_customer_data.ejs", {contactData: contactData});
						self.profileUsePartnerAddress($("#mp-use-partner-data").is(':checked'));
					}, function(error) {
						var contactData = {};
						contactData.contact = {};
						contactData.contact.phones = [];
						contactData.contact.fax = "";

						$("#use-customer-data").html("templates/account/account_customer_data.ejs", {contactData: contactData});

					});


				}

			},
			"#company-contact-info .btn-cancel click": function(element) {
				this.showCompanyInfo($('#bigModal div.tab-content div[tab="company-info"]'), function() {
					$('#bigModal div.tab-content div[tab="company-info"]').attr("style", "");
					$('#bigModal div.tab-content div[tab="company-info"]').removeClass('edit-mode');
					$("#my-account-tabs, #id-data").removeClass("edit-mode");
				});
			},
			"#company-contact-info .btn-cta click": function(element) {
				if(!element.hasClass('disabled')) {
					element.addClass('loading');
					element.prepend('<i class="icon-loader-green"></i>');
					var self = this;


					Account.getCompanyInfo(function(companyInfo) {

						if(companyInfo.useAddressAsCorrespondenceAddress == true)
							companyInfo.correspondenceAddress = null;

						companyInfo.contact.mobile = "";

						companyInfo.contact.smsEnabled = false;

						companyInfo.contact.www = $("#company-contact-info #ci-www").val();
						companyInfo.contact.email = $("#company-contact-info #ci-email").val();
						companyInfo.contact.fax = $("#company-contact-info #ci-fax").val();
						companyInfo.contact.phones = new Array();
						var i = 0;

						var countPhones = $("#company-contact-info .phone-number-input").length;

						$.each($("#company-contact-info .phone-number-input"), function() {


							if($(this).siblings("button").hasClass('active')) {
								if(countPhones == 4) {

								} else {
									companyInfo.contact.phones[i] = $(this).val();
									i++;
								}
								companyInfo.contact.mobile = $(this).val();
								companyInfo.contact.smsEnabled = true;
							} else {
								companyInfo.contact.phones[i] = $(this).val();
								i++;
							}


						});

						if(companyInfo.contact.smsEnabled == false && companyInfo.contact.phones.length > 3) {
							companyInfo.contact.mobile = companyInfo.contact.phones[3];
							companyInfo.contact.phones = companyInfo.contact.phones.splice(0, 3);
						}


						Account.updateCompanyInfo(companyInfo, function(companyInfo2) {
							account.profile.showCompanyInfo($('#bigModal div.tab-content div[tab="company-info"]'), function() {
								$('#bigModal div.tab-content div[tab="company-info"]').attr("style", "");
								$('#bigModal div.tab-content div[tab="company-info"]').removeClass('edit-mode');
								$("#my-account-tabs, #id-data").removeClass("edit-mode");


							});


						}, function(error) {
							errorHandle(error);
							element.removeClass('loading');
							element.find('i').remove();

						});


					}, function(error) {

						errorHandle(error)
						element.removeClass('loading');
						element.find('i').remove();
					});
				}

			},
			"#billing-info .btn-cancel click": function(element) {
				this.showCompanyInfo($('#bigModal div.tab-content div[tab="company-info"]'), function() {
					$('#bigModal div.tab-content div[tab="company-info"]').attr("style", "");
					$('#bigModal div.tab-content div[tab="company-info"]').removeClass('edit-mode');
					$("#my-account-tabs, #id-data").removeClass("edit-mode");
				});
			},
			".phone-number .item-remove click": function(element) {

				if($(".phone-controls").parents('.tab-pane').find('.phone-controls').length < 4)
					element.parents(".control-group").find(".add-more").parent().css('display', 'block');

				if($(".phone-number").length > 1)
					element.parents(".controls").remove();
				else {
					if(element.parents(".controls").find(".phone-number-input").length > 0) {
						element.parents(".controls").remove();
					} else {
						element.parents(".controls").find("input").val("");
						element.parents(".controls").find(".social-networks").select2('val', null);
					}
				}
			},
			"#my-profile-info .btn-cta click": function(element) {
				if(element.hasClass('disabled')) return false;
				element.addClass('loading');
				element.prepend('<i class="icon-loader-green"></i>');
				var self = this;
				if($("#my-profile-info").attr('person-id') == "0") {
					var contactPerson = {email: "", position: "", firstName: "", lastName: "", usePartnerAddress: true, contact: {phones: new Array(), mobile: "", email: "", smsEnabled: false, fax: "", www: "", socialMediaContacts: new Array()}};
					contactPerson.firstName = $("#my-profile-info #mp-firstName").val();
					contactPerson.lastName = $("#my-profile-info #mp-lastName").val();
					contactPerson.position = $("#my-profile-info #mp-position").val();
					contactPerson.email = $("#my-profile-info #mp-email").val();
					contactPerson.contact.email = $("#my-profile-info #mp-email").val();
					contactPerson.contact.fax = $("#my-profile-info #mp-fax").val();

					contactPerson.usePartnerAddress = $("#mp-use-partner-data").is(':checked');
					contactPerson.contact.mobile = "";
					contactPerson.contact.smsEnabled = false;
					contactPerson.contact.phones = new Array();
					var i = 0;
					var countPhones = $("#my-profile-info .phone-number-input").length;
					$.each($("#my-profile-info .phone-number-input"), function() {
						if($(this).siblings("button").hasClass('active')) {
							if(countPhones == 4) {

							} else {
								contactPerson.contact.phones[i] = $(this).val();
								i++;
							}
							contactPerson.contact.mobile = $(this).val();
							contactPerson.contact.smsEnabled = true;
						} else {
							contactPerson.contact.phones[i] = $(this).val();
							i++;
						}


					});

					if(contactPerson.contact.smsEnabled == false && contactPerson.contact.phones.length > 3) {
						contactPerson.contact.mobile = contactPerson.contact.phones[3];
						contactPerson.contact.phones = contactPerson.contact.phones.splice(0, 3);
					}


					Account.addPerson(contactPerson, function(contactPerson2) {

						if(element.parents(".tab-pane").attr("tab") == "contact-persons") {
							account.profile.showContactPersons($('#bigModal div.tab-content div[tab="contact-persons"]'), function() {
								$('#bigModal div.tab-content div[tab="contact-persons"]').attr("style", "");
								$('#bigModal div.tab-content div[tab="contact-persons"]').removeClass('edit-mode');
								$("#my-account-tabs, #id-data").removeClass("edit-mode");

							});
						}

					}, function(error) {
						errorHandle(error);
						element.removeClass('loading');
						element.find('i').remove();

					});
				}
				else {
					Account.getContactPersonDetails(element.parents("#my-profile-info").attr("person-id"), function(contactPerson) {
						contactPerson.firstName = $("#my-profile-info #mp-firstName").val();
						contactPerson.lastName = $("#my-profile-info #mp-lastName").val();
						contactPerson.position = $("#my-profile-info #mp-position").val();
						contactPerson.contact.email = $("#my-profile-info #mp-email").val();
						contactPerson.contact.fax = $("#my-profile-info #mp-fax").val();
						contactPerson.contact.phones = new Array();
						contactPerson.usePartnerAddress = $("#mp-use-partner-data").is(':checked');

						contactPerson.contact.mobile = "";
						contactPerson.contact.smsEnabled = false;
						contactPerson.contact.phones = new Array();
						var i = 0;
						var countPhones = $("#my-profile-info .phone-number-input").length;
						$.each($("#my-profile-info .phone-number-input"), function() {
							if($(this).siblings("button").hasClass('active')) {
								if(countPhones == 4) {

								} else {
									contactPerson.contact.phones[i] = $(this).val();
									i++;
								}
								contactPerson.contact.mobile = $(this).val();
								contactPerson.contact.smsEnabled = true;
							} else {
								contactPerson.contact.phones[i] = $(this).val();
								i++;
							}


						});

						Account.updatePerson(element.parents("#my-profile-info").attr("person-id"), contactPerson, function(contactPerson2) {

							if(element.parents(".tab-pane").attr("tab") == "contact-persons") {
								account.profile.showContactPersons($('#bigModal div.tab-content div[tab="contact-persons"]'), function() {
									$('#bigModal div.tab-content div[tab="contact-persons"]').attr("style", "");
									$('#bigModal div.tab-content div[tab="contact-persons"]').removeClass('edit-mode');
									$("#my-account-tabs, #id-data").removeClass("edit-mode");

								});


							} else if(element.parents(".tab-pane").attr("tab") == "my-profile") {
								account.profile.showMyProfile($('#bigModal div.tab-content div[tab="my-profile"]'), function() {
									$('#bigModal div.tab-content div[tab="my-profile"]').attr("style", "");
									$('#bigModal div.tab-content div[tab="my-profile"]').removeClass('edit-mode');
									$("#my-account-tabs, #id-data").removeClass("edit-mode");

								});
							}
						}, function(error) {
							errorHandle(error);
							element.removeClass('loading');
							element.find('i').remove();
						});
					}, function(error) {
						errorHandle(error);
						element.removeClass('loading');
						element.find('i').remove();
					});
				}
			},
			"#my-profile-info .btn-cta mouseover": function(element) {
				if($("#my-profile-info #mp-firstName").val() == "") {
					$("#my-profile-info #mp-firstName").parents(".control-group").addClass("error");
				}
				if($("#my-profile-info #mp-email").val() == "") {
					$("#my-profile-info #mp-email").parents(".control-group").addClass("error");
				} else {
					if(!account.account.validateEmail($("#my-profile-info #mp-email").val()))
						$("#my-profile-info #mp-email").parents(".control-group").addClass("error");
				}

			},

			"#company-contact-info .btn-cta mouseover": function(element) {
				if($("#company-contact-info #ci-email").val() == "") {
					$("#company-contact-info #ci-email").parents(".control-group").addClass("error");
				} else {
					if(!account.account.validateEmail($("#company-contact-info #ci-email").val()))
						$("#company-contact-info #ci-email").parents(".control-group").addClass("error");
				}

			},

			"#company-contact-info .btn-cta mouseout": function(element) {
				$("#company-contact-info .control-group").removeClass("error").removeClass('error');

			},

			"#my-profile-info .btn-cta mouseout": function(element) {
				$("#my-profile-info .control-group").removeClass("error").removeClass('error');

			},
			editCompanyInfoValidate: function() {
				if($("#company-contact-info #ci-email").val() == "" || !account.account.validateEmail($("#company-contact-info #ci-email").val())) {
					$("#company-contact-info .btn-cta").addClass('disabled');
				} else {
					$("#company-contact-info .btn-cta").removeClass('disabled');
				}
			},
			"#billing-info .btn-cta click": function(element) {
				element.addClass('loading');
				element.prepend('<i class="icon-loader-green"></i>');
				var self = this;


				Account.getCompanyInfo(function(companyInfo) {

					companyInfo.address.address = $("#bi-address").val();
					companyInfo.address.address2 = $("#bi-address2").val();
					companyInfo.address.city = $("#bi-city").val();
					companyInfo.address.postalCode = $("#bi-postal").val();
					if($("#bi-select-country").select2('val') != "0")
						companyInfo.address.country.id = $("#bi-select-country").select2('val');
					else
						companyInfo.address.country = null;

					if($("#bi-select-province").select2('val') == "" || $("#bi-select-province").select2('val') == null)
						companyInfo.address.province = null;
					else {
						if(companyInfo.address.province == null)
							companyInfo.address.province = {};
						companyInfo.address.province.id = $("#bi-select-province").select2('val');
					}


					companyInfo.useAddressAsCorrespondenceAddress = $("#bi-use-as-correspondence").is(':checked');
					if($("#bi-use-as-correspondence").is(':checked') == false) {
						companyInfo.correspondenceAddress.address = $("#bi2-address").val();
						companyInfo.correspondenceAddress.address2 = $("#bi2-address2").val();
						companyInfo.correspondenceAddress.city = $("#bi2-city").val();
						companyInfo.correspondenceAddress.postalCode = $("#bi2-postal").val();
						companyInfo.correspondenceAddress.country.id = $("#bi2-select-country").select2('val');
						if($("#bi2-select-country").select2('val') != "0")
							companyInfo.correspondenceAddress.country.id = $("#bi2-select-country").select2('val');
						else
							companyInfo.correspondenceAddress.country = null;


						if($("#bi2-select-province").select2('val') == "" || $("#bi2-select-province").select2('val') == null)
							companyInfo.correspondenceAddress.province = null;
						else {
							if(companyInfo.correspondenceAddress.province == null)
								companyInfo.correspondenceAddress.province = {};
							companyInfo.correspondenceAddress.province.id = $("#bi2-select-province").select2('val');
						}

					} else {
						companyInfo.correspondenceAddress = null;
					}
					Account.updateCompanyInfo(companyInfo, function(companyInfo2) {
						account.profile.showCompanyInfo($('#bigModal div.tab-content div[tab="company-info"]'), function() {
							$('#bigModal div.tab-content div[tab="company-info"]').attr("style", "");
							$('#bigModal div.tab-content div[tab="company-info"]').removeClass('edit-mode');
							$("#my-account-tabs, #id-data").removeClass("edit-mode");
							//$('#bigModal div.tab-content div[tab="company-info"]').css('width','485px');


						});

					}, function(error) {
						errorHandle(error);
						element.removeClass('loading');
						element.find('i').remove();

					});


				}, function(error) {
					errorHandle(error);
					element.removeClass('loading');
					element.find('i').remove();
				});
			},


			".contact-persons-list .contact-person .link-edit click": function(element, event) {
				element.parents("#bigModal").find(".tab-content").removeClass("moved");
				element.parents("#bigModal").find(".modal-footer").remove();

				account.profile.editMyProfile(element.parents(".contact-person").attr("user"), $('#bigModal div.tab-content div[tab="contact-persons"]'));

				var self = this;
				self.options.openedPersons = new Array();

				$.each($(".contact-persons-list >div.expanded"), function() {
					if(element.parents(".contact-person").attr("user") != $(this).attr('user'))
						self.options.openedPersons[self.options.openedPersons.length] = $(this).attr('user');

				});
				self.options.openedPersons[self.options.openedPersons.length] = element.parents(".contact-person").attr("user");


			},

			".contact-persons-list .contact-person .link-delete click": function(element, event) {
				element.parents(".contact-person").append('templates/account/account_cp_delete.ejs', {});
			},
			".contact-persons-list .contact-person .delete-overlay .btn-no click": function(element) {
				element.parents(".contact-person").find(".delete-overlay").remove();

			},
			".contact-persons-list .contact-person .delete-overlay .btn-yes click": function(element) {
				var parentCP = element.parents(".contact-person");
				Account.deletePerson(element.parents(".contact-person").attr("user"), function() {
					parentCP.remove();
				}, function(error) {
					parentCP.find(".delete-overlay").remove();
					parentCP.append('templates/account/account_cp_delete_fail.ejs', {});
					setTimeout(function() {
						parentCP.find(".delete-overlay").fadeOut(500, function() {
							parentCP.find(".delete-overlay").remove()
						});
					}, 3000);


				})
			},
			"#company-contact-info .btn-edit click": function(element) {
				if(element.hasClass('disabled')) return false;
				var self = this;
				Account.getCompanyInfo(function(companyInfo) {

					$('#bigModal div.tab-content div[tab="company-info"]').attr("style", "");
					$('#bigModal div.tab-content div[tab="company-info"]').addClass('edit-mode');
					$("#my-account-tabs, #id-data").addClass("edit-mode");

					companyInfo.logo = baseURL + 'customers/' + customerID + '/image?width=200&height=50&crop=true&timpestamp=' + (new Date().getTime());
					companyInfo.contact.showMobile = true;
					companyInfo.contact.phonesSMS = new Array();
					$.each(companyInfo.contact.phones, function(index, phone) {
						companyInfo.contact.phonesSMS[index] = 0;
					});

					var oneOfPhonesIsMobile = false;
					if(companyInfo.contact.mobile != null && $.trim(companyInfo.contact.mobile) != "") {

						$.each(companyInfo.contact.phones, function(index, phone) {
							if(phone == companyInfo.contact.mobile) {
								oneOfPhonesIsMobile = true;
								if(companyInfo.contact.smsEnabled == true) {
									companyInfo.contact.phonesSMS[index] = 1;
								}
							}
						});

						if(!oneOfPhonesIsMobile) {
							var tempLength = companyInfo.contact.phones.length;
							companyInfo.contact.phones[tempLength] = companyInfo.contact.mobile;
							companyInfo.contact.showMobile = false;
							if(companyInfo.contact.smsEnabled == true) {
								companyInfo.contact.phonesSMS[tempLength] = 1;
							} else {
								companyInfo.contact.phonesSMS[tempLength] = 0;
							}
						}

					}


					$('#bigModal div.tab-content div[tab="company-info"] .wrapper').html('templates/account/account_companyinfo_1_edit.ejs', {companyInfo: companyInfo});
					self.editCompanyInfoValidate();
					$('#bigModal div.tab-content div[tab="company-info"]').find(".chosen-process").select2({
						width: 'element',
						minimumResultsForSearch: 10,
						allowClear: true
					});
				}, function(error) {
					errorHandle(error)
				});

			},
			".sms-enable click": function(element) {
				if(!element.hasClass('disabled')) {
					if(element.hasClass('active')) {
						element.removeClass('active');
						element.html('<span data-localize="general.sms-enable">Enable SMS</span>');
					} else {
						$(".sms-enable").removeClass('active');
						$(".sms-enable").html('<span data-localize="general.sms-enable">Enable SMS</span>');
						element.addClass('active');
						element.html('<i class="icon-accept"></i> <span data-localize="general.sms-enabled">SMS Enabled</span>');
					}
				}

			},


			".sms-enabled change": function(element) {
				$.each($(".sms-enabled"), function() {
					if(!element.is($(this))) {
						$(this).attr("checked", false);
					}
				});

			},

			"#billing-info .btn-edit click": function(element) {
				if(element.hasClass('disabled')) return false;
				var self = this;
				Account.getCompanyInfo(function(companyInfo) {
					Account.getCountries(function(countries) {
						Account.getProvinces(companyInfo.address.country.id, function(provinces) {


							if(companyInfo.address.country == null) {
								companyInfo.address.country = {id: 0};
							}

							if(companyInfo.correspondenceAddress.country == null) {
								companyInfo.correspondenceAddress.country = {id: 0};
							}
							$('#bigModal div.tab-content div[tab="company-info"]').attr("style", "");
							element.parents(".tab-pane").addClass('edit-mode');
							$("#my-account-tabs, #id-data").addClass("edit-mode");
							element.parents(".tab-pane .wrapper").html('templates/account/account_companyinfo_2_edit.ejs', {companyInfo: companyInfo, countries: countries, provinces: provinces});


							$('#bigModal div.tab-content div[tab="company-info"]').find(".chosen-process").select2({
								width: 'element',
								minimumResultsForSearch: 10,
								allowClear: true
							});
							if(companyInfo.useAddressAsCorrespondenceAddress == false) {
								Account.getProvinces(companyInfo.correspondenceAddress.country.id, function(provinces) {
									$('#bigModal div.tab-content #correspondence-address-wrapper').html('templates/account/account_correspondence_address.ejs', {companyInfo: companyInfo, countries: countries, provinces: provinces});
									$('#bigModal div.tab-content #correspondence-address-wrapper').find(".chosen-process").select2({
										width: 'element',
										minimumResultsForSearch: 10,
										allowClear: true
									});
									if(companyInfo.correspondenceAddress.country != null)
										$("#bi2-select-country").select2('val', companyInfo.correspondenceAddress.country.id);
									if(companyInfo.correspondenceAddress.province != null)
										$("#bi2-select-province").select2('val', companyInfo.correspondenceAddress.province.id);
								}, function(error) {
									errorHandle(error)
								});
								if(element.hasClass('scroll-to-ca'))
									$(".tab-content").scrollTo({top: '400px', left: '0'}, 1000);
							}

							if(companyInfo.address.country != null)
								$("#bi-select-country").select2('val', companyInfo.address.country.id);
							if(companyInfo.address.province != null)
								$("#bi-select-province").select2('val', companyInfo.address.province.id);
							$('#bi-use-as-correspondence').attr("checked", companyInfo.useAddressAsCorrespondenceAddress);


						}, function(error) {
							errorHandle(error)
						});
					}, function(error) {
						errorHandle(error)
					});
				}, function(error) {
					errorHandle(error)
				});
			},
			"#bi-select-country change": function(element) {
				Account.getProvinces(element.val(), function(provinces) {
					function format(item) {
						return item.localizedName;
					}

					$("#bi-select-province").html('<option></option>');
					$.each(provinces, function(index, value) {
						$("#bi-select-province").append('<option value="' + value.id + '">' + value.localizedName + '</option>');
					});

					$('#bigModal div.tab-content div[tab="company-info"]').find("#bi-select-province").select2({
						width: 'element',
						minimumResultsForSearch: 10,
						allowClear: true

					});
				}, function(error) {
					errorHandle(error)
				});

			},
			"#bi2-select-country change": function(element) {
				Account.getProvinces(element.val(), function(provinces) {
					function format(item) {
						return item.localizedName;
					}

					$("#bi2-select-province").html('<option></option>');
					$.each(provinces, function(index, value) {
						$("#bi2-select-province").append('<option value="' + value.id + '">' + value.localizedName + '</option>');
					});

					$('#bigModal div.tab-content div[tab="company-info"]').find("#bi2-select-province").select2({
						width: 'element',
						minimumResultsForSearch: 10,
						allowClear: true

					});
				}, function(error) {
					errorHandle(error)
				});

			},

			"#bi-use-as-correspondence change": function(element) {
				if(element.is(':checked') == true) {
					$('#bigModal div.tab-content #correspondence-address-wrapper').html("");
				} else {
					Account.getCompanyInfo(function(companyInfo) {
						Account.getCountries(function(countries) {
							Account.getProvinces(companyInfo.address.country.id, function(provinces) {

								$('#bigModal div.tab-content #correspondence-address-wrapper').html('templates/account/account_correspondence_address.ejs', {companyInfo: companyInfo, countries: countries, provinces: provinces});
								$('#bigModal div.tab-content #correspondence-address-wrapper').find(".chosen-process").select2({
									width: 'element',
									minimumResultsForSearch: 10,
									allowClear: true
								});
								if(companyInfo.correspondenceAddress.country != null)
									$("#bi2-select-country").select2('val', companyInfo.correspondenceAddress.country.id);
								if(companyInfo.correspondenceAddress.province != null)
									$("#bi2-select-province").select2('val', companyInfo.correspondenceAddress.province.id);


							}, function(error) {
								errorHandle(error)
							});
						}, function(error) {
							errorHandle(error)
						});
					}, function(error) {
						errorHandle(error)
					});
				}
			}

		});
	});