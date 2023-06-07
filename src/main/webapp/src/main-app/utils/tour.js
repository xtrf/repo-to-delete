steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	function($) {

		$.Controller("TourController", {
			init: function(element, options) {
				this.showDialog(element, options);
			},
			showDialog: function(element, options) {
				this.showDialogInner(element, options);
			},
			showDialogInner: function(element, options) {
				var self = this;
				ContactModel.salesData(function(salesData) {
					Account.getAccountPreferences(function(accountPreferences) {
						Account.getLocales(function(locales) {
							Account.getTimeZones(function(timeZones) {
								if ($("#myModal").length == 0) {
									salesData.pmResponsible.avatar = baseURL + 'users/' + salesData.pmResponsible.id + '/image?width=63&height=63&crop=true';
									$("body").append("templates/tour/tour_modal.ejs", {});
									$("#tourModal").html("templates/tour/tour_step_0.ejs", {timeZones: timeZones, locales: locales, salesData: salesData});
									self.hideAds();
									$("#tourModal .intro .pull-right img").attr('src', baseURL + 'system/partnerZoneLogo?width=200&height=50&crop=true&v='+window.brandingChanged);
									$("#tourModal .chosen-process").select2({
										width: 'element',
										minimumResultsForSearch: 10,
										allowClear: false
									});
									$('#tourModal').on('hidden', function() {
										$('#tourModal').remove();
										$(".modal-backdrop").remove();
									});
									$("#tourModal .btn-close").click(self.hideTour);

									$("#tour-select-language").select2("val", accountPreferences.locale);
									$("#tour-select-timezone").select2("val", accountPreferences.timeZone.id);
									$("#tour-startup-show").attr("checked", accountPreferences.displayTutorial);

									self.showTour();
								} else {
									$('#myModal').on('hidden', function() {
										self.showDialogInner(element, options);
									});
								}
							});
						});
					});
				});
			},
			hideAds: function() {
				if (settings && settings.adsDisabled) {
					$('.modal-tour .xtrf-logo').hide();
				}
			},
			showTour: function() {
				$("#tourModal").modal('show');
			},
			hideTour: function() {
				$("#tourModal").modal('hide');
			},

			updateSettings: function() {
				var accountPreferences = {};
				accountPreferences.displayTutorial = $("#tour-startup-show").is(':checked');
				Account.setAccountPreferences(accountPreferences, function() {
				}, errorHandle);
			},

			"#tour-startup-show change": function() {
				this.updateSettings();
			},
			showStep1: function(element) {
				Account.getContactPersonDetails(sessionObject.id, function(contactPerson) {
					element.removeClass('disabled');
					element.removeClass('loading');

					$("#tourModal").html('templates/tour/tour_step_1.ejs', {contactPerson: contactPerson});
					localizeAttribute("#tour-first-name", "placeholder");
					localizeAttribute("#tour-last-name", "placeholder");
					localizeAttribute("#tour-position", "placeholder");
					localizeAttribute("#tour-email", "placeholder");
					this.loadLogo();
				}, errorHandle);
			},

			"#tour-step-0 .btn-next click": function(element) {
				var self = this;
				if (!element.hasClass('disabled')) {
					element.addClass('disabled');
					element.addClass('loading');
					element.prepend('<i class="icon-loader-green"></i>');

					var accountPreferences = {};
					accountPreferences.displayTutorial = $("#tour-startup-show").is(':checked');
					accountPreferences.locale = $("#tour-select-language").select2("val");
					accountPreferences.timeZone = {};
					accountPreferences.timeZone.id = $("#tour-select-timezone").select2("val");

					if (sessionObject.type != "CustomerPerson") {
						element.removeClass('disabled');
						element.removeClass('loading');
						self.loadStep(2);
					} else {
						self.showStep1(element);
					}
				}
			},
			"#tour-step-1 .btn-next click": function(element) {
				var self = this;
				if (!element.hasClass('disabled')) {
					element.addClass('disabled');
					element.addClass('loading');
					element.prepend('<i class="icon-loader-green"></i>');

					Account.getContactPersonDetails(sessionObject.id, function(contactPerson) {
						contactPerson.firstName = $("#tour-first-name").val();
						contactPerson.lastName = $("#tour-last-name").val();
						contactPerson.position = $("#tour-position").val();
						contactPerson.contact.email = $("#tour-email").val();
						contactPerson.email = $("#tour-email").val();
						Account.updatePerson(sessionObject.id, contactPerson, function() {
							element.removeClass('disabled');
							element.removeClass('loading');
							self.loadStep(2);
						}, function() {
							element.removeClass('disabled');
							element.removeClass('loading');
							self.loadStep(2);
						});
					}, errorHandle);
				}
			},

			"#tour-step-2 .btn-forward click": function() {
				this.loadStep(3);
			},
			"#tour-step-3 .btn-forward click": function() {
				this.loadStep(4);
			},
			"#tour-step-4 .btn-forward click": function() {
				if (permissions.hasAccessToInvoices()) {
					this.loadStep(5);
				} else {
					this.loadStep(6);
				}
			},
			"#tour-step-5 .btn-forward click": function() {
				this.loadStep(6);
			},

			"#tour-step-6 .btn-forward click": function() {
				this.hideTour();
			},
			"#tour-step-3 .btn-back click": function() {
				this.loadStep(2);
			},
			"#tour-step-4 .btn-back click": function() {
				this.loadStep(3);
			},
			"#tour-step-5 .btn-back click": function() {
				this.loadStep(4);
			},
			"#tour-step-6 .btn-back click": function() {
				if (permissions.hasAccessToInvoices()) {
					this.loadStep(5);
				} else {
					this.loadStep(4);
				}
			},

			loadStep: function(stepNumber) {
				$("#tourModal").html('templates/tour/tour_step_' + stepNumber + '.ejs', {});
				this.loadLogo();
			},

			loadLogo: function() {
				$("#tourModal .modal-header .logo img").attr('src', baseURL + 'system/partnerZoneLogo?width=200&height=50&crop=true&v='+window.brandingChanged);
			},

			"#tour-step-2 .btn-back click": function(element) {
				if (sessionObject.type != "CustomerPerson") {
					this.showStep0(element);
				} else
					this.showStep1(element);
			},

			"#tour-step-1 .btn-back click": function(element) {
				this.showStep0(element);
			},

			showStep0: function(element) {
				var self = this;
				element.addClass('loading');
				element.addClass('disabled');
				//element.prepend('<i class="icon-loader-green"></i>');
				ContactModel.salesData(function(salesData) {
					Account.getAccountPreferences(function(accountPreferences) {
						Account.getLocales(function(locales) {
							Account.getTimeZones(function(timeZones) {
								salesData.pmResponsible.avatar = baseURL + 'users/' + salesData.pmResponsible.id + '/image?width=63&height=63&crop=true';

								$("#tourModal").html("templates/tour/tour_step_0.ejs", {timeZones: timeZones, locales: locales, salesData: salesData});
								$("#tourModal .intro .pull-right img").attr('src', baseURL + 'system/partnerZoneLogo?width=200&height=50&crop=true&v='+window.brandingChanged);
								$("#tourModal .chosen-process").select2({
									width: 'element',
									minimumResultsForSearch: 10,
									allowClear: false
								});

								$("#tourModal .btn-close").click(self.hideTour());

								$("#tour-select-language").select2("val", accountPreferences.locale);
								$("#tour-select-timezone").select2("val", accountPreferences.timeZone.id);
								$("#tour-startup-show").attr("checked", accountPreferences.displayTutorial);

								self.showTour();
							});
						});
					});
				});
			},

			"#tourModal .section-direct-link click": function() {
				this.hideTour();
			}
		});
	});