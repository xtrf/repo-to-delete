steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	function($) {
		$.Controller("AccountSocialMedia", {
			init: function(element, options) {
				this.options.openedPersons = new Array();
			},
			doEditSocialMediaOuter: function(parentTab, contactPerson, type) {
				var socialNetworks = new Array();
				var i = 0;
				$.each(parentTab.find('select.social-networks'), function() {
					if($(this).siblings("input").val() != null && $(this).siblings("input").val() != "" && $(this).val() != null && $(this).val() != '') {
						socialNetworks[i] = {};
						socialNetworks[i].socialMedia = {};
						socialNetworks[i].socialMedia.id = $(this).val();
						socialNetworks[i].contact = $(this).siblings("input").val();
						if($(this).parents(".social-network-controls").attr("pre-id") != "0") {
							socialNetworks[i].id = $(this).parents(".social-network-controls").attr("pre-id");
						}
						i++;
					}
				});

				contactPerson.contact.socialMediaContacts = socialNetworks;
				if(type == "profile") {
					Account.updatePerson(contactPerson.id, contactPerson, function(contactPerson2) {
						if(parentTab.attr("tab") == "contact-persons") {
							account.profile.showContactPersons($('#bigModal div.tab-content div[tab="contact-persons"]'), function() {
								$('#bigModal div.tab-content div[tab="contact-persons"]').attr('style', '');
								$('#bigModal div.tab-content div[tab="contact-persons"]').removeClass('edit-mode');
								$("#my-account-tabs, #id-data").removeClass("edit-mode");

							});
						} else if(parentTab.attr("tab") == "my-profile") {
							account.profile.showMyProfile($('#bigModal div.tab-content div[tab="my-profile"]'), function() {
								$('#bigModal div.tab-content div[tab="my-profile"]').attr('style', '');
								$('#bigModal div.tab-content div[tab="my-profile"]').removeClass('edit-mode');
								$("#my-account-tabs, #id-data").removeClass("edit-mode");

							});
						}
					}, function(error) {
						errorHandle(error)
					});
				}

				if(type == "contact-person") {
					Account.updatePerson(contactPerson.id, contactPerson, function(contactPerson2) {

						account.profile.showContactPersons($('#bigModal div.tab-content div[tab="contact-persons"]'), function() {
							$('#bigModal div.tab-content div[tab="contact-persons"]').attr('style', '');
							$('#bigModal div.tab-content div[tab="contact-persons"]').removeClass('edit-mode');
							$("#my-account-tabs, #id-data").removeClass("edit-mode");

						});
					}, function(error) {
						errorHandle(error)
					});
				}


				if(type == "company") {
					Account.updateCompanyInfo(contactPerson, function(companyInfo) {
						if(parentTab.attr("tab") == "company-info") {
							account.profile.showCompanyInfo($('#bigModal div.tab-content div[tab="company-info"]'), function() {
								$('#bigModal div.tab-content div[tab="company-info"]').attr('style', '');
								$('#bigModal div.tab-content div[tab="company-info"]').removeClass('edit-mode');
								$("#my-account-tabs, #id-data").removeClass("edit-mode");

							});
						}
					}, function(error) {
						errorHandle(error)
					});
				}


			},
			"#social-media-info .btn-cta click": function(element) {
				element.addClass('loading');
				element.prepend('<i class="icon-loader-green"></i>');
				var self = this;
				if(element.parents("#social-media-info").attr('type') == "profile") {
					Account.getContactPersonDetails($("#social-media-info").attr('person-id'), function(contactData) {
						self.doEditSocialMediaOuter($('#bigModal div.tab-content div[tab="my-profile"]'), contactData, "profile");
					}, function(error) {
						errorHandle(error);
						element.removeClass('loading');
						element.find('i').remove();

					});
				}
				if(element.parents("#social-media-info").attr('type') == "company") {
					Account.getCompanyInfo(function(contactData) {
						self.doEditSocialMediaOuter($('#bigModal div.tab-content div[tab="company-info"]'), contactData, "company");

					}, function(error) {
						errorHandle(error);
						element.removeClass('loading');
						element.find('i').remove();
					});
				}


				if(element.parents("#social-media-info").attr('type') == "contact-person") {
					Account.getContactPersonDetails($("#social-media-info").attr('person-id'), function(contactData) {
						self.doEditSocialMediaOuter($('#bigModal div.tab-content div[tab="contact-persons"]'), contactData, "contact-person");
					}, function(error) {
						errorHandle(error);
						element.removeClass('loading');
						element.find('i').remove();

					});
				}

			},
			"#social-media-info .btn-cancel click": function(element) {
				var self = this;
				var parentTab = element.parents(".tab-pane");
				if(element.parents("#social-media-info").attr('type') == "profile") {
					if(parentTab.attr("tab") == "contact-persons") {
						account.profile.showContactPersons($('#bigModal div.tab-content div[tab="contact-persons"]'), function() {
							$('#bigModal div.tab-content div[tab="contact-persons"]').attr('style', '');
							$('#bigModal div.tab-content div[tab="contact-persons"]').removeClass('edit-mode');
							$("#my-account-tabs, #id-data").removeClass("edit-mode");

						});
					} else if(parentTab.attr("tab") == "my-profile") {
						account.profile.showMyProfile($('#bigModal div.tab-content div[tab="my-profile"]'), function() {
							$('#bigModal div.tab-content div[tab="my-profile"]').attr('style', '');
							$('#bigModal div.tab-content div[tab="my-profile"]').removeClass('edit-mode');
							$("#my-account-tabs, #id-data").removeClass("edit-mode");

						});
					}
				}
				if(element.parents("#social-media-info").attr('type') == "company") {
					account.profile.showCompanyInfo($('#bigModal div.tab-content div[tab="company-info"]'), function() {
						$('#bigModal div.tab-content div[tab="company-info"]').attr('style', '');
						$('#bigModal div.tab-content div[tab="company-info"]').removeClass('edit-mode');
						$("#my-account-tabs, #id-data").removeClass("edit-mode");

					});
				}
				if(element.parents("#social-media-info").attr('type') == "contact-person") {
					account.profile.showContactPersons($('#bigModal div.tab-content div[tab="contact-persons"]'), function() {
						$('#bigModal div.tab-content div[tab="contact-persons"]').attr('style', '');
						$('#bigModal div.tab-content div[tab="contact-persons"]').removeClass('edit-mode');
						$("#my-account-tabs, #id-data").removeClass("edit-mode");

					});
				}

			},


			"#my-profile-social-media .btn-cancel click": function(element) {
				if(element.parents(".tab-pane").attr("tab") == "contact-persons") {
					account.profile.showContactPersons($('#bigModal div.tab-content div[tab="contact-persons"]'), function() {
						$('#bigModal div.tab-content div[tab="contact-persons"]').removeClass('edit-mode');
						$("#my-account-tabs, #id-data").removeClass("edit-mode");
					});

				} else if(element.parents(".tab-pane").attr("tab") == "my-profile") {
					account.profile.showMyProfile($('#bigModal div.tab-content div[tab="my-profile"]'), function() {
						$('#bigModal div.tab-content div[tab="my-profile"]').removeClass('edit-mode');
						$("#my-account-tabs, #id-data").removeClass("edit-mode");
					});
				}
			},
			showEditSocialMediaInner: function(parentTab, contactData, type, socialMedia) {
				var self = this;
				parentTab.attr("style", "");
				parentTab.addClass('edit-mode');
				$("#my-account-tabs, #id-data").addClass("edit-mode");

				parentTab.find(".wrapper").html("templates/account/account_mp_social_edit.ejs", {contactData: contactData, socialMedia: socialMedia});
				localizeAttribute(".social-networks", "placeholder", null);
				if(type == "company") {
					$("#social-media-info").attr('type', 'company');
				}
				if(type == "contact-person") {
					$("#social-media-info").attr('type', 'contact-person');
				}

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

				self.options.socialTemplate = parentTab.find('.control-group[group="social-networks"] .social-network-controls:first').clone();
				self.options.socialTemplate.find('input').val('');
				self.options.socialTemplate.find('.select2-container').remove();


				parentTab.find('.social-networks').select2({
					width: 'element',
					minimumResultsForSearch: 10,
					allowClear: true,
					formatResult: formatDropdownSN,
					formatSelection: formatResultSN
				});


				$.each(parentTab.find('.social-network-controls'), function() {
					$(this).find('.social-networks').select2('val', $(this).attr('pre-value'));
				});
			},
			showEditSocialMedia: function(parentTab, contactData, type, personID) {
				var self = this;


				Account.getSocialMedia(function(socialMedia) {
					self.showEditSocialMediaInner(parentTab, contactData, type, socialMedia);


				}, function(error) {
					errorHandle(error)
				});


			},
			"#social-media-info .btn-edit click": function(element) {
				if(element.hasClass('disabled')) return false;
				var self = this;
				if(element.parents("#social-media-info").attr('type') == "profile")
					Account.getContactPersonDetails(sessionObject.id, function(contactPerson) {
						self.showEditSocialMedia($('#bigModal div.tab-content div[tab="my-profile"]'), contactPerson, "profile");
					}, function(error) {
						errorHandle(error)
					});

				if(element.parents("#social-media-info").attr('type') == "company") {
					Account.getCompanyInfo(function(contactPerson) {
						self.showEditSocialMedia($('#bigModal div.tab-content div[tab="company-info"]'), contactPerson, "company");

					}, function(error) {
						errorHandle(error)
					});
				}
			},
			".contact-persons-list .contact-person .link-edit-sm click": function(element, event) {
				var self = this;
				Account.getContactPersonDetails(element.parents(".contact-person").attr("user"), function(contactData) {
					element.parents("#bigModal").find(".tab-content").removeClass("moved");
					element.parents("#bigModal").find(".modal-footer").remove();

					self.showEditSocialMedia($('#bigModal div.tab-content div[tab="contact-persons"]'), contactData, "contact-person");
				}, function(error) {
					errorHandle(error);
				});

			}
		});
	});