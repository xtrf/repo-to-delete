steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	'./../static/js/tmpl.min.js',
	'./../static/js/vendor/jquery.ui.widget.js',
	'./../static/js/jquery.timeentry.pack.js').then(function($) {
		steal('./../static/js/jquery.iframe-transport.js',
			'./../static/js/jquery.fileupload.js',
			'./../static/js/datepicker.js').then(function($) {
				steal('./../static/js/jquery.fileupload-fp.js',
					'./../static/js/jquery.fileupload-ui.js').then(


					function($) {
						$.Model('RQuote', {
								getLanguages: function(success, error) {
									return $.ajax({
										url: baseURL + 'system/values/languages' + addToURL,
										dataType: 'json',
										xhrFields: { withCredentials: true},
										success: success,
										error: error
									});
								},
								getOffices: function(success, error) {
									return $.ajax({
										url: baseURL + 'offices' + addToURL,
										dataType: 'json',
										xhrFields: { withCredentials: true},
										success: success,
										error: error
									});
								},
								getServices: function(success, error) {
									return $.ajax({
										url: baseURL + 'customers/' + customerID + '/services' + addToURL,
										dataType: 'json',
										xhrFields: { withCredentials: true},
										success: success,
										error: error
									});
								},
								getServicesByOfficeId: function(officeId, success, error) {
									return $.ajax({
										url: baseURL + 'customers/' + officeId + '/services' + addToURL,
										dataType: 'json',
										xhrFields: { withCredentials: true},
										success: success,
										error: error
									});
								},
								getSpecializations: function(success, error) {
									return $.ajax({
										url: baseURL + 'system/values/specializations' + addToURL,
										dataType: 'json',
										xhrFields: { withCredentials: true},
										success: success,
										error: error
									});
								},
								getPriceProfiles: function(success, error) {
									return $.ajax({
										url: baseURL + 'customers/' + customerID + '/sales/priceProfiles' + addToURL,
										dataType: 'json',
										xhrFields: { withCredentials: true},
										success: success,
										error: error
									});
								},
								doRequestQuote: function(quoteData, success, error) {
									return $.ajax({
										type: "POST",
										contentType: "application/json",
										url: baseURL + 'quotes' + addToURL.substr(5),
										dataType: 'json',
										data: JSON.stringify(quoteData),
										xhrFields: { withCredentials: true},
										success: success,
										error: error,
										cache: false
									});
								},
								getContactPersons: function(success, error) {
									//return success(JSON.parse('[ { "id" : 4165, "version" : 0, "name" : "Danuta Danuta", "email" : "sdsdf@sdfsd.rt",  "position" : ""},{ "id" : 4163, "version" : 0, "name" : "Danuta Danuta2", "email" : "sdsdf@sdfsd.rt",  "position" : ""} ]'));
									return $.ajax({
										url: baseURL + 'customers/' + customerID + '/persons' + addToURL,
										dataType: 'json',
										xhrFields: { withCredentials: true},
										success: success,
										error: error
									});
								},
								pasteFromClipboard: function(text, success, error) {
									return $.ajax({
										url: baseURL + 'system/session/files' + addToURL,
										dataType: 'json',
										data: {content: text},
										type: "POST",
										xhrFields: { withCredentials: true},
										success: success,
										error: error
									});
								}

							},

							{});


						$.Controller("RequestQuote", {
							init: function(element, options) {
								this.options.calendarLocale = helperController.calendarLocale();


								this.options.jqXHR = null;
								this.options.step = 1;
								this.options.requestedQuote = {};
								this.options.filesTemp = new Array();
								this.options.allFiles = new Array();
								this.options.rmTemp = new Array();
								this.options.allRM = new Array();
								this.options.withoutFiles = false;
								this.options.languagesHash = {};
								this.options.officesHash = {};
								this.options.servicesHash = {};
								this.options.specializationsHash = {};

								this.options.step1FunctionsExecuted = 0;
								this.options.step1FunctionsResults = {};
								this.options.preNotes = "";
								this.options.prePersons = new Array();
								this.options.preProfile = null;

								this.options.sendBackTo = [];
							},

							resetQuote: function(element, raProject) {


								this.options.step = 1;
								this.options.requestedQuote = {};
								this.options.filesTemp = new Array();
								this.options.allFiles = new Array();
								this.options.rmTemp = new Array();
								this.options.allRM = new Array();
								this.options.step1FunctionsExecuted = 0;
								this.options.step1FunctionsResults = {};
								this.options.withoutFiles = false;
								this.options.preNotes = "";
								this.options.prePersons = new Array();
								this.options.preProfile = null;
								this.options.languagesHash = {};
								this.options.servicesHash = {};
								this.options.specializationsHash = {};

							},
							requestQuoteInner: function(element) {

								this.options.step1FunctionsExecuted++;
								if (this.options.step1FunctionsExecuted == 5) {
									var offices = this.options.step1FunctionsResults.offices;
									var services = this.options.step1FunctionsResults.services;
									var languages = this.options.step1FunctionsResults.languages;
									var specializations = this.options.step1FunctionsResults.specializations;
									var budgetCodes = this.options.budgetCodes || null;
									if(budgetCodes){
										budgetCodes.sort();
									}

									var self = this;
									$("#bigModal").remove();
									$(".modal-backdrop").remove();
									$("body").append("templates/quotes/request_quote_modal.ejs", {});
									if (self.options.raProject == true) {
										$("#bigModal .modal-header h3").html('<i class="icon-pr-modal"></i> <span data-localize="general.rap">Request a project</span>');
									}
									var sourceLanguages = languages;


									$("#bigModal #step-1").html("templates/quotes/request_modal_step1.ejs", {
										offices: offices,
										sourceLanguages: sourceLanguages,
										languages: languages,
										specializations: specializations,
										services: services,
										budgetCodes: budgetCodes,
										budgetCodesEnabledAndAvailable: self.budgetCodesEnabledAndAvailable()
									});
									$("#bigModal #step-1 #services-wrapper").html("templates/quotes/request_modal_step1_services.ejs",{
										services: services
									});

									$("#bigModal").on('hidden', function() {
										$(".datepicker").remove();
										$("#bigModal").remove();
										$(".modal-backdrop").remove();
									});

									var cLocale = 'en';
									if (self.options.calendarLocale[sessionObject.locale])
										cLocale = sessionObject.locale.toLowerCase().replace('_', '-');;


									$("#delivery-date-wrapper").DatePicker({
										format: 'Y-m-d',
										date: $('#input-delivery-date').val(),
										current: moment(new Date()).format("YYYY-MM-DD"),
										starts: 1,
										position: 'r',
										locale: self.options.calendarLocale[cLocale],
										onChange: function(formated, dates) {
											$('#input-delivery-date').val(formated);
											//
											$('#delivery-date-wrapper').DatePickerHide();
											self.step1Validate();
										},
										onRender: function(date) {
											var yesterday = new Date();
											yesterday.setDate(yesterday.getDate() - 1);
											return {
												disabled: (date.valueOf() <= yesterday.valueOf())
											}
										}
									});

									localizeAttribute("#select-budget-code", "placeholder", "modules.quotes.input-budget-code");
									localizeAttribute("#input-quote-name", "placeholder", "modules.quotes.input-quote-name-ph");
									localizeAttribute("#input-quote-reference-number", "placeholder", "modules.quotes.input-quote-reference-number-ph");
									localizeAttribute("#select-tos", "data-placeholder", "modules.quotes.input-quote-tos-ph");
									localizeAttribute("#select-specialization", "data-placeholder", "modules.quotes.input-quote-spec-ph");
									localizeAttribute("#select-source-lang", "data-placeholder", "modules.quotes.input-quote-source-lang-ph");
									localizeAttribute("#select-target-langs", "data-placeholder", "modules.quotes.input-quote-target-langs-ph");

									$('input[placeholder], textarea[placeholder]').placeholder();


									$(".chosen-process").select2({
										width: "320px",
										minimumResultsForSearch: 10,
										allowClear: true
									});


									var maxTime = null;
									var minTime = null;


                                    if (helperController.is24hour()) {
                                        $("#input-delivery-time").val('15:00');
                                        $("#input-delivery-time").timeEntry({
                                            spinnerImage: '',
                                            defaultTime: '15:00',
                                            timeSteps: [1, 30, 1],
                                            show24Hours: true,
                                            minTime: minTime,
                                            maxTime: maxTime
                                        });
                                    }
                                    else {
                                        $("#input-delivery-time").val('03:00PM');
                                        $("#input-delivery-time").timeEntry({
                                            spinnerImage: '',
                                            defaultTime: '03:00PM',
                                            timeSteps: [1, 30, 1],
                                            minTime: minTime,
                                            maxTime: maxTime
                                        });
                                    }


									$("#bigModal").css("top", $(window).scrollTop());
									$("#bigModal").on('shown', function() {

										$(window).resize(function() {
											resizeFixedModal($('.modal-qr'), false);
										});
									});


									$("#bigModal").modal({
										backdrop: 'static'
									});
									resizeFixedModal($('#bigModal'), true);

									$(".job-request").removeClass('loading');
									$(".job-request").parent().find(".icon-loader-request").css("display", "");
									$(".raq").removeClass('loading');
									$(".rap").removeClass('loading');

									$("#my-account").removeClass('disabled');
								}
							},

							loadButton: function(element) {
								element.find("i").remove();
								element.addClass('loading');
								element.addClass('disabled');
								element.prepend('<i class="icon-loader-green"></i>');
							},
							loadedButton: function(element) {
								element.find("i").remove();
								element.removeClass('loading');
								element.removeClass('disabled');
								element.append('<i class="icon-next-step"></i>');
							},

							requestQuote: function(element, raProject) {
								this.resetQuote(element);
								this.options.raProject = raProject;
								var self = this;

								//requestQuoteInner

								$("#my-account").addClass('disabled');
								Account.getCompanyInfo(function(companyInfo) {
									self.options.budgetCodes = companyInfo.budgetCodes;
									self.options.budgetCodeRequiredWhenAddingQuoteOrProject = companyInfo.budgetCodeRequiredWhenAddingQuoteOrProject;
									self.requestQuoteInner(element);
								});

								RQuote.getLanguages(function(languages) {
									self.options.step1FunctionsResults.languages = languages;
									self.options.languagesHash = {};
									$.each(languages, function(index, value) {
										self.options.languagesHash[value.id] = value;
									});

									self.requestQuoteInner(element);


								}, function(error) {
									$(".job-request").removeClass('loading');
									$(".job-request").parent().find(".icon-loader-request").css("display", "");
									$(".raq").removeClass('loading');
									$("#my-account").removeClass('disabled');
									errorHandle(error)
								});
								RQuote.getSpecializations(function(specializations) {
									self.options.step1FunctionsResults.specializations = specializations;
									self.options.specializationsHash = {};
									$.each(specializations, function(index, value) {
										self.options.specializationsHash[value.name] = value;
									});
									self.requestQuoteInner(element);

								}, function(error) {
									$(".job-request").removeClass('loading');
									$(".job-request").parent().find(".icon-loader-request").css("display", "");
									$(".raq").removeClass('loading');
									$("#my-account").removeClass('disabled');
									errorHandle(error)
								});

								RQuote.getServices(function(services) {
									self.options.step1FunctionsResults.services = services;
									self.options.servicesHash = {};
									$.each(services, function(index, value) {
										self.options.servicesHash[value.name] = value;
									});
									self.requestQuoteInner(element);
								}, function(error) {
									$(".job-request").removeClass('loading');
									$(".job-request").parent().find(".icon-loader-request").css("display", "");
									$(".raq").removeClass('loading');
									$("#my-account").removeClass('disabled');
									errorHandle(error);
								});

								RQuote.getOffices(function(offices) {
									self.options.step1FunctionsResults.offices = offices;
									self.options.officesHash = {};
									$.each(offices, function(index, value) {
										self.options.officesHash[value.id] = value;
									});
									self.requestQuoteInner(element);
								}, function(error) {
									$(".job-request").removeClass('loading');
									$(".job-request").parent().find(".icon-loader-request").css("display", "");
									$(".raq").removeClass('loading');
									$("#my-account").removeClass('disabled');
									errorHandle(error);
								});


							},
							"#step-2-new .file-remove click": function(element) {

								var listWrapper = element.parents('.uploaded-files-list');
								if (element.parents(".accordion-body").attr("id") == "source-files-container")
									this.options.filesTemp[element.parents("li").attr('fileindex')] = null;
								else
									this.options.rmTemp[element.parents("li").attr('fileindex')] = null;

								var numberOfFiles = 0;

								$.each(this.options.filesTemp, function(index, value) {
									if (value != null)
										numberOfFiles++;
								});


								if (numberOfFiles == 0) {
									$("#step-2-new .next-step").addClass('disabled');
								} else {
									$("#step-2-new .next-step").removeClass('disabled');
								}

								element.parents("li").remove();
								if (listWrapper.children().length == 0) {
									listWrapper.parents(".accordion-body").find(".info-overlay").fadeIn();
									listWrapper.parents(".accordion-body").find(".uploader-wrapper .upload-button-wrapper").fadeIn();
									listWrapper.parents(".accordion-body").find(".uploader-wrapper .upload-button-wrapper").removeClass('faded');
								}


							},

							changeStep: function(fromStep, toStep) {

								if (fromStep == "2" || fromStep == 2)
									$("#step-2-new").css('display', 'none');
								else
									$("#step-" + fromStep).css('display', 'none');

								if (toStep == "2" || toStep == 2) {
									$("#step-" + toStep + "-new").css('display', 'block');
								} else
									$("#step-" + toStep).css('display', 'block');

								$(".modal-step-indicator .step" + fromStep).removeClass('active');
								$(".modal-step-indicator .step" + toStep).addClass('active');
								if (fromStep == 4 && toStep == 5) {
									$("#step-" + toStep + " .modal-body").animate({
										height: 224
									}, 100, function() {
									})
								}
								else {
									if (toStep == "2") {
										$("#step-" + toStep + "-new .modal-body").height($("#step-" + fromStep + "-new .modal-body").height());
									} else {
										$("#step-" + toStep + " .modal-body").height($("#step-" + fromStep + " .modal-body").height());
									}
								}

							},
							"#step-1 #select-office change":function(element){
								var self = this;
								RQuote.getServicesByOfficeId($("#select-office").val(),function(services){
									self.options.servicesHash = {};
									$.each(services, function(index, value) {
										self.options.servicesHash[value.name] = value;
									});
									$("#bigModal #step-1 #services-wrapper").html("templates/quotes/request_modal_step1_services.ejs",{
										services: services
									});
									localizeAttribute("#select-tos", "data-placeholder", "modules.quotes.input-quote-tos-ph");

									$("#select-tos").select2({
										width: "320px",
										minimumResultsForSearch: 10,
										allowClear: true
									});
									self.step1Validate(element);


								});
							},
							"#step-1 select change": function(element) {
								this.step1Validate(element);
							},
							"#step-1 input keyup": function(element) {
								this.step1Validate(element);
							},
							"#step-1 input change": function(element) {
								this.step1Validate(element);
							},
							isAsiaServiceSelected: function(){
                                var asiaServices=['ASIA EMAIL','ASIA PDC','ASIA BLOG'];
                                return asiaServices.indexOf($("#select-tos").val()) > -1;
							},
							prepopulateTargetLanguages: function(element){
                                var prepopulatedLanguagesIds = [];

								var hasSourceLanguageChanged = element.attr("id") === "select-source-lang";

								if(this.isAsiaServiceSelected()){
									$("#select-source-lang").parents(".control-group").show();
									if(hasSourceLanguageChanged) {
											if($("#select-source-lang").val() == 73){
                                            prepopulatedLanguagesIds = [ 133, 47, 51 ];
										}else {
											prepopulatedLanguagesIds = [ 73 ];
										}

                                    } else {
                                        $("#select-source-lang").select2('val', null);
									}
								}else {
                                    $("#select-source-lang").parents(".control-group").hide();

                                    $("#select-source-lang").select2('val', 73);


									var languagesForService = {
										'PDC': [6, 40, 53, 54, 55, 58, 82, 87, 98, 102, 111, 121, 156, 164, 167, 171, 173, 184, 185, 212, 221, 236],
										'BLOG': [87, 98, 121, 173, 212],
										'STORE DESCRIPTIONS': [6, 40, 53, 54, 55, 58, 82, 87, 98, 111, 121, 156, 164, 167, 171, 173, 185, 212, 184, 221, 236, 206, 166, 86],
										'STORE BANNERS': [6, 55, 58, 82, 87, 98, 121, 156, 164, 167, 173, 212, 221, 236, 206, 166, 86, 229, 123, 133, 47, 51],
										'EMAIL': [6, 40, 53, 54, 55, 58, 82, 87, 98, 102, 111, 121, 156, 164, 167, 171, 173, 184, 185, 212, 221, 236,240],
										'MARKETING': [6, 54, 55, 58, 82, 87, 98, 102, 121, 156, 164, 167, 173, 212, 221, 236],
										'SUPPORT': [54, 55, 58, 82, 87, 98, 102, 121, 156, 164, 167, 173, 212, 221, 236],
										'SUBTITLES': [6, 54, 55, 58, 82, 87, 98, 102, 121, 156, 164, 167, 173, 212, 221, 236],
										'PS PLUS HUB': [6, 55, 58, 82, 87, 98, 121, 156, 164, 167, 173, 212, 221, 236],
										'LEGAL': [6, 54, 55, 58, 82, 87, 85, 98, 102, 121, 156, 164, 167, 173, 212, 184, 221, 236],
										'OPERATIONS': [6, 40, 53, 54, 55, 58, 77, 82, 87, 98, 102, 108, 111, 121, 127, 137, 139, 156, 164, 167, 171, 173, 178, 184, 185, 212, 221, 236, 240]

									}

									if (languagesForService[element.val()]) {
										prepopulatedLanguagesIds = languagesForService[element.val()];
									}
								}

                                $("#select-target-langs").select2('val', prepopulatedLanguagesIds);
                                $("#select-target-langs").change();
							},
							"#step-1 .next-step mouseover": function(element) {
								var self = this;
								var requiredFields = $('#step-1 .is--required');

								var isDeadlineValid = function() {
									if (self.isProjectRequested()) {
										if (!!$("#input-delivery-date").val()) {
											var deliveryDate = Date.parseExact($("#input-delivery-date").val(), "yyyy-MM-dd");
											if (deliveryDate) return true;
											return false;
										}
										return (!!$("#input-delivery-date").val() || !sessionObject.projectDeadlineMandatory);
									}
									return true;
								}
								$.each(requiredFields, function() {
									var input = $(this);
									if(input.is('select') || input.is('input')){
										if( !input.val()) {
											input.parents('.control-group').addClass('error');
										}
									}
								});
								if (!this.isBudgetCodeValid()) {
									$("#select-budget-code").parents(".control-group").addClass("error");
								}
								if (!isDeadlineValid()) {
									$("#input-delivery-date").parents(".control-group").addClass("error");
								}

								var deliveryDate = Date.parseExact($("#input-delivery-date").val(), "yyyy-MM-dd");
								if (deliveryDate != null) {
									var itt = new Date();

									itt.setTime(deliveryDate.getTime() + $("#input-delivery-time").timeEntry('getOffset'));

									deliveryDate.setTime(deliveryDate.getTime() + $("#input-delivery-time").timeEntry('getOffset'));
									var dateString = moment(Date.parseExact($("#input-delivery-date").val(), "yyyy-MM-dd")).format("YYYY-MM-DD");
									var dateTimeString = "";

									if ($("#input-delivery-time").timeEntry('getTime') != null)
										dateTimeString = moment(itt).format("YYYY-MM-DD HH:mm:ss");
									else
										dateTimeString = moment(itt).format("YYYY-MM-DD HH:mm:ss");

									var ct = new Date();
									if (itt > ct || $.trim($("#input-delivery-date").val()) == "") {

									} else {

										$("#input-delivery-date").parents(".control-group").addClass("error");
									}
								}


							},
							"#step-1 .next-step mouseout": function(element) {

								$("#step-1 .error").removeClass("error");
							},
							step1Validate: function(element) {
								var self = this;

								var isDeadlineValid = function() {
									if (self.isProjectRequested()) {
										return (!!$("#input-delivery-date").val() || !sessionObject.projectDeadlineMandatory);
									}
									return true;
								}

								var dt = Date.parseExact($("#input-delivery-date").val(), "yyyy-MM-dd");
								var ct = new Date();
								var nameInput = $('#input-quote-name').val();
								var spacePattern = new RegExp(/^\s*$/m);

								if ($("#select-tos").val() != "" &&
									nameInput && !spacePattern.test(nameInput) &&
									$("#select-specialization").val() != "" &&
									$("#select-source-lang").val() != "" &&
									$("#select-target-langs").val() != null &&
									$("#input-delivery-date").val() != null &&
									self.isBudgetCodeValid() &&
									isDeadlineValid()) {

									if ($.trim($("#input-delivery-date").val()) == "") {
										$("#step-1 .next-step").removeClass('disabled');
									} else {
										//var it=new Date($("#input-delivery-date").val());
										var it = Date.parseExact($("#input-delivery-date").val(), "yyyy-MM-dd");
										if (it && !isNaN(it.getDate())) {
											var itt = new Date();

											itt.setTime(it.getTime() + $("#input-delivery-time").timeEntry('getOffset'));

											it.setTime(it.getTime() + $("#input-delivery-time").timeEntry('getOffset'));
											var dateString = moment(Date.parseExact($("#input-delivery-date").val(), "yyyy-MM-dd")).format("YYYY-MM-DD");
											var dateTimeString = "";

											if ($("#input-delivery-time").timeEntry('getTime') != null)
												dateTimeString = moment(itt).format("YYYY-MM-DD HH:mm:ss");
											else
												dateTimeString = moment(itt).format("YYYY-MM-DD HH:mm:ss");

											if (itt > ct)
												$("#step-1 .next-step").removeClass('disabled');
											else {

												if (!$("#step-1 .next-step").hasClass('disabled'))
													$("#step-1 .next-step").addClass('disabled');
											}
										} else
											$("#step-1 .next-step").addClass('disabled');

									}


								} else {
									if (!$("#step-1 .next-step").hasClass('disabled'))
										$("#step-1 .next-step").addClass('disabled');
								}


							},
							abortUpload: function(e) {
								e.preventDefault();
								var template = $(e.currentTarget).closest('.template-upload'),
									data = template.data('data') || {}; // data, data , data (queue Monty Python skit)
								if (!data.jqXHR) {
									data.errorThrown = 'abort';
									this._trigger('fail', e, data);
								} else {
									data.jqXHR.abort();
								}
							},

							"#step-1 .next-step click": function(element) {
								var self = this;
								if (!element.hasClass('disabled')) {

									self.loadButton(element);

									if ($("#input-quote-name-eq").html() == $("#input-quote-name").val()) {
										this.options.requestedQuote.name = null;
									} else {
										this.options.requestedQuote.name = $("#input-quote-name").val();
									}
									;

									if ($("#input-quote-reference-number-eq").html() == $("#input-quote-reference-number").val()) {
										this.options.requestedQuote.customerProjectNumber = null;
									} else {
										this.options.requestedQuote.customerProjectNumber = $("#input-quote-reference-number").val();
									}

									var office = this.options.officesHash[$("#select-office").val()];

									if (typeof office !== 'undefined') {
										this.options.requestedQuote.office = {
											name: office.name
										};

										this.options.priceProfiles = office.priceProfiles;
										this.options.contactPersons = office.persons;
									}
									if (this.budgetCodesEnabledAndAvailable()) {
										this.options.requestedQuote.budgetCode = $("#select-budget-code").val() ? $("#select-budget-code").val() : null;
									}

									this.options.requestedQuote.service = new Object();
									this.options.requestedQuote.service.name = $("#select-tos").val();
									this.options.requestedQuote.specialization = new Object();
									this.options.requestedQuote.specialization.name = $("#select-specialization").val();
									this.options.requestedQuote.sourceLanguage = new Object();
									this.options.requestedQuote.sourceLanguage.id = $("#select-source-lang").val();
									this.options.requestedQuote.sourceLanguage.name = self.options.languagesHash[this.options.requestedQuote.sourceLanguage.id].name;
									this.options.requestedQuote.targetLanguages = new Array();

									var i = 0;
									$.each($("#select-target-langs").val(), function(index, element) {
										self.options.requestedQuote.targetLanguages[i] = new Object();
										self.options.requestedQuote.targetLanguages[i].id = element;
										self.options.requestedQuote.targetLanguages[i].name = self.options.languagesHash[element].name;
										i++;
									});


									var it = Date.parseExact($("#input-delivery-date").val(), "yyyy-MM-dd");

									if ($.trim($("#input-delivery-date").val()) == "" || isNaN(it.getDate())) {
										self.options.requestedQuote.deliveryDate = null;
									} else {

										var itt = new Date();

										itt.setTime(it.getTime() + $("#input-delivery-time").timeEntry('getOffset'));

										var dateString = moment(itt).format("YYYY-MM-DD HH:mm:ss");

										self.options.requestedQuote.deliveryDate = {"formatted": dateString};

									}


									if (self.options.step == 1) {
										$("#bigModal #step-2-new").html("templates/quotes/request_modal_step2.ejs", {});
										var dropZone1 = $("#step-2-new #source-files-container .uploader-wrapper");
										var dropZone2 = $("#step-2-new #reference-materials-container .uploader-wrapper");
										if ('draggable' in document.createElement('span')) {

										} else {
											dropZone1 = null;
											dropZone2 = null;
											$("#step-2-new .info-overlay").remove();
											$("#step-2-new .upload-button-wrapper strong").remove();
											$("#step-2-new .upload-button-wrapper br").remove();
										}


										$("#fileupload").attr("action", baseURL + 'system/session/files' + addToURL.substr(5));

										$("#fileupload2").attr("action", baseURL + 'system/session/files' + addToURL.substr(5));

										//infoOverlay.css('margin-left', infoOverlay.parent().width()/2-infoOverlay.width()/2)

										var countFiles = 0;
										var countFiles2 = 0;
										var withC = true;
										if (addToURL.length > 0) {
											withC = false;
										}

										$('#fileupload').fileupload(
											'option',
											'redirect',
											'http://pzone.dev/result.html?%s'
										);


										var jqXHR = null;
										self.options.jqXHR = $('#fileupload').fileupload({
											url: baseURL + 'system/session/files' + addToURL.substr(5),
											pasteZone: $('#step-2-new'),
											uploadTemplateId: null,
											downloadTemplateId: null,
											autoUpload: true,
											dataType: 'json',
											dropZone: dropZone1,
											xhrFields: { withCredentials: withC },
											beforeSend: function(xhr) {
												jqXHR = xhr;
												$("#bigModal #step-2-new #source-files-container .uploader-wrapper .uploaded-files-list .uploading:last .file-remove").click(function() {
													xhr.abort();
												});
											}
										})
											.bind('fileuploadadd', function(e, data) {
												var cThis = this;

												$(e.currentTarget).parents('.uploader-group').find(".info-overlay").fadeOut();
												$(e.currentTarget).parents('.uploader-group').find(".uploader-wrapper .upload-button-wrapper").fadeOut();
												$(e.currentTarget).parents('.uploader-group').find(".uploader-wrapper .upload-button-wrapper").addClass('faded');
												countFiles++;

												self.options.allFiles[self.options.allFiles.length] = data.files[0];

												var thisFileId = 0;

												$.each(self.options.allFiles, function(index, value) {
													if (data.files[0] == value) {
														thisFileId = index;
													}
												});

												$.each(data.files, function(index, value) {
													$("#bigModal #step-2-new #source-files-container .uploader-wrapper .uploaded-files-list").append('templates/quotes/uploaded_file.ejs', {"file": value, "fileIndex": thisFileId});
													//$("#bigModal #step-2-new #source-files-container .uploader-wrapper .uploaded-files-list .uploading:last").click(function(){ e.abort() });
												});

												if (countFiles != 0) {
													if (!$("#step-2-new .next-step").hasClass("disabled")) {
														$("#step-2-new .next-step").addClass("disabled")
													}
													$("#source-files-container .loader").css('display', 'block');
												}

											})
											.bind('fileuploaddone', function(e, data) {
												countFiles--;
												var thisFileId = 0;

												$.each(self.options.allFiles, function(index, value) {
													if (data.files[0] == value) {
														thisFileId = index;
													}
												});

												$('#bigModal #step-2-new #source-files-container .uploader-wrapper .uploaded-files-list li[fileindex="' + thisFileId + '"]').find(".bar").css('width', "100%").attr("data-progress", '100');
												$('#bigModal #step-2-new #source-files-container .uploader-wrapper .uploaded-files-list li[fileindex="' + thisFileId + '"]').find('.file-remove').css('display', '');
												$('#bigModal #step-2-new #source-files-container .uploader-wrapper .uploaded-files-list li[fileindex="' + thisFileId + '"]').removeClass("uploading");

												var cFile = new Array();

												if (typeof data.jqXHR.responseText != 'undefined')
													cFile = JSON.parse(data.jqXHR.responseText);
												else {
													cFile = data.result;
													cFile[0].name = data.files[0].name;

												}
												var ctFile;
												if (cFile[0].name != null)
													ctFile = cFile[0];
												if (cFile[1] && cFile[1].name != null)
													ctFile = cFile[1];


												self.options.filesTemp[thisFileId] = ctFile;


												if (countFiles2 == 0 && countFiles == 0) {
													if ($("#step-2-new .next-step").hasClass("disabled")) {
														$("#step-2-new .next-step").removeClass("disabled")
													}

												}
												if (countFiles == 0) {
													$("#source-files-container .loader").css('display', 'none');
												}


											})
											.bind('fileuploadprogress', function(e, data) {


												var thisFileId = 0;

												$.each(self.options.allFiles, function(index, value) {
													if (data.files[0] == value) {
														thisFileId = index;
													}
												});
												$('#bigModal #step-2-new #source-files-container .uploader-wrapper .uploaded-files-list li[fileindex="' + thisFileId + '"]').find(".bar").css('width', Math.ceil(data.loaded / data.total * 100).toString() + "%")


											})
											.bind('fileuploadalways', function(e, data) {
											})
											.bind('fileuploadfail', function(e, data) {
												countFiles--;
												var thisFileId = 0;

												$.each(self.options.allFiles, function(index, value) {
													if (data.files[0] == value) {
														thisFileId = index;
													}
												});
												var listWrapper = $('#source-files-container  li[fileindex="' + thisFileId + '"]').parents('.uploaded-files-list');
												$('#source-files-container  li[fileindex="' + thisFileId + '"]').remove();

												if (countFiles == 0) {
													$("#source-files-container .loader").css('display', 'none');
												}

												if (listWrapper.children().length == 0) {
													listWrapper.parents(".accordion-body").find(".info-overlay").fadeIn();
													listWrapper.parents(".accordion-body").find(".uploader-wrapper .upload-button-wrapper").fadeIn();
													listWrapper.parents(".accordion-body").find(".uploader-wrapper .upload-button-wrapper").removeClass('faded');
												}

												try {
													var responseText = JSON.parse(data.jqXHR.responseText);
													if(responseText.errorMessage) {
														$('#source-files.uploader-group .uplader-errors-container').append('<div class="alert alert-error"><i class="icon-error"></i><span>' + responseText.errorMessage + '</span></div>');
													}
												} catch(e) {}

												var numberOfFiles = 0;

												$.each(self.options.filesTemp, function(index, value) {
													if (value != null)
														numberOfFiles++;
												});

												if (countFiles2 == 0 && countFiles == 0 && numberOfFiles != 0) {
													if ($("#step-2-new .next-step").hasClass("disabled")) {
														$("#step-2-new .next-step").removeClass("disabled")
													}

												}

											});
										$('#step-2-new').click();

										//$("#bigModal #step-2-new #source-files-container .uploader-wrapper").click(function(){ jqXHR.abort() });
										self.options.jqXHR2 = $('#fileupload2').fileupload({
											uploadTemplateId: null,
											downloadTemplateId: null,
											pasteZone: null,
											autoUpload: true,
											dropZone: dropZone2,
											xhrFields: { withCredentials: true },
											beforeSend: function(xhr) {
												jqXHR = xhr;
												$("#bigModal #step-2-new #reference-materials-container .uploader-wrapper .uploaded-files-list .uploading:last .file-remove").click(function() {
													xhr.abort();
												});
											}
										})
											.bind('fileuploadadd', function(e, data) {
												$(e.currentTarget).parents('.uploader-group').find(".info-overlay").fadeOut();
												$(e.currentTarget).parents('.uploader-group').find(".uploader-wrapper .upload-button-wrapper").addClass('faded');

												countFiles2++;
												self.options.allRM[self.options.allRM.length] = data.files[0];
												var thisFileId = 0;
												$.each(self.options.allRM, function(index, value) {
													if (data.files[0] == value) {
														thisFileId = index;
													}
												});
												$.each(data.files, function(index, value) {
													$("#bigModal #step-2-new #reference-materials-container .uploader-wrapper .uploaded-files-list").append('templates/quotes/uploaded_file.ejs', {"file": value, "fileIndex": thisFileId});
												});
												if (countFiles2 != 0) {
													if (!$("#step-2-new .next-step").hasClass("disabled")) {
														$("#step-2-new .next-step").addClass("disabled")
													}
													$("#reference-materials-container .loader").css('display', 'block');
												}

											})
											.bind('fileuploaddone', function(e, data) {
												countFiles2--;
												var thisFileId = 0;
												$.each(self.options.allRM, function(index, value) {
													if (data.files[0] == value) {
														thisFileId = index;
													}
												});

												$('#bigModal #step-2-new #reference-materials-container .uploader-wrapper .uploaded-files-list li[fileindex="' + thisFileId + '"]').find(".bar").css('width', "100%").attr("data-progress", '100');
												$('#bigModal #step-2-new #reference-materials-container .uploader-wrapper .uploaded-files-list li[fileindex="' + thisFileId + '"]').find('.file-remove').css('display', '');
												$('#bigModal #step-2-new #reference-materials-container .uploader-wrapper .uploaded-files-list li[fileindex="' + thisFileId + '"]').removeClass("uploading");


												var cFile = new Array();

												if (typeof data.jqXHR.responseText != 'undefined')
													cFile = JSON.parse(data.jqXHR.responseText);
												else {
													cFile = data.result;
													cFile[0].name = data.files[0].name;

												}
												var ctFile;
												if (cFile[0].name != null)
													ctFile = cFile[0];

												if (cFile[1] && cFile[1].name != null)
													ctFile = cFile[1];

												self.options.rmTemp[thisFileId] = ctFile;

												if (countFiles2 == 0 && countFiles == 0) {
													if ($("#step-2-new .next-step").hasClass("disabled")) {
														$("#step-2-new .next-step").removeClass("disabled")
													}

												}
												if (countFiles2 == 0) {
													$("#reference-materials-container .loader").css('display', 'none');
												}


											})
											.bind('fileuploadprogress',function(e, data) {


												var thisFileId = 0;

												$.each(self.options.allRM, function(index, value) {
													if (data.files[0] == value) {
														thisFileId = index;
													}
												});

												$('#bigModal #step-2-new #reference-materials-container .uploader-wrapper .uploaded-files-list li[fileindex="' + thisFileId + '"]').find(".bar").css('width', Math.ceil(data.loaded / data.total * 100).toString() + "%")


											}).bind('fileuploadfail', function(e, data) {
												countFiles2--;
												var thisFileId = 0;

												$.each(self.options.allRM, function(index, value) {
													if (data.files[0] == value) {
														thisFileId = index;
													}
												});
												var listWrapper = $('#reference-materials-container  li[fileindex="' + thisFileId + '"]').parents('.uploaded-files-list');
												$('#reference-materials-container  li[fileindex="' + thisFileId + '"]').remove();

												if (countFiles2 == 0) {
													$("#reference-materials-container .loader").css('display', 'none');
												}

												if (listWrapper.children().length == 0) {
													listWrapper.parents(".accordion-body").find(".info-overlay").fadeIn();
													listWrapper.parents(".accordion-body").find(".uploader-wrapper .upload-button-wrapper").fadeIn();
													listWrapper.parents(".accordion-body").find(".uploader-wrapper .upload-button-wrapper").removeClass('faded');
												}

												try {
													var responseText = JSON.parse(data.jqXHR.responseText);
													if(responseText.errorMessage) {
														$('#reference-materials.uploader-group .uplader-errors-container').append('<div class="alert alert-error"><i class="icon-error"></i><span>' + responseText.errorMessage + '</span></div>');
													}
												} catch(e) {}

												var numberOfFiles = 0;

												$.each(self.options.filesTemp, function(index, value) {
													if (value != null)
														numberOfFiles++;
												});

												if (countFiles2 == 0 && countFiles == 0 && numberOfFiles !=0) {
													if ($("#step-2-new .next-step").hasClass("disabled")) {
														$("#step-2-new .next-step").removeClass("disabled")
													}

												}

											});


										this.options.step = 2;

										if ('draggable' in document.createElement('span')) {

											$(document).bind('dragover', function(e) {
												$('#source-files-container .upload-button-wrapper').css('display', 'none');
												dropZone1.addClass('active');
											});

											$(document).bind('dragleave', function(e) {
												$('#source-files-container .upload-button-wrapper').css('display', 'block');
												dropZone1.removeClass('active');
											});

											$(document).bind('drop', function(e) {
												if ($('#source-files-container .uploaded-files-list').children().length == 0)
													$('#source-files-container .upload-button-wrapper').css('display', 'block');

												dropZone1.removeClass('active');


											});


											window.addEventListener("dragover", function(e) {
												e = e || event;
												e.preventDefault();
											}, false);
											window.addEventListener("drop", function(e) {
												e = e || event;
												e.preventDefault();
											}, false);

											$(document).bind('dragover', function(e) {
												var dropZone = dropZone1,
													timeout = window.dropZoneTimeout;
												if (!timeout) {
													dropZone.addClass('in');
												} else {
													clearTimeout(timeout);
												}
												/*if (e.target === dropZone[0]) {
												 dropZone.addClass('active');
												 } else {
												 dropZone.removeClass('active');
												 }*/
												window.dropZoneTimeout = setTimeout(function() {
													window.dropZoneTimeout = null;
													dropZone.removeClass('in active');
												}, 100);
											});


											$(document).bind('dragover', function(e) {
												var dropZone = dropZone2,
													timeout = window.dropZoneTimeout;
												if (!timeout) {
													dropZone.addClass('in');
												} else {
													clearTimeout(timeout);
												}
												if (e.target === dropZone[0]) {
													dropZone.addClass('active');
												} else {
													dropZone.removeClass('active');
												}
												window.dropZoneTimeout = setTimeout(function() {
													window.dropZoneTimeout = null;
													dropZone.removeClass('in active');
												}, 100);
											});
										}

									}


									this.changeStep(1, 2);

									$('#source-files .info-overlay').css('left', $('#source-files .info-overlay').parent().width() / 2 - $('#source-files .info-overlay').width() / 2 - 10);
									$('#source-files .info-overlay').css('top', $('#source-files .info-overlay').parent().height() / 2 - $('#source-files .info-overlay').height() * 2);
									$('#source-files .upload-button-wrapper').css('left', $('#source-files .upload-button-wrapper').parent().width() / 2 - $('#source-files .upload-button-wrapper').width() / 2);

									if ($("#step-2-new .info-overlay").length > 0)
										$('#source-files .upload-button-wrapper').css('top', $('#source-files .upload-button-wrapper').parent().height() / 2 + $('#source-files .upload-button-wrapper').height() / 2 - 25);
									else
										$('#source-files .upload-button-wrapper').css('top', $('#source-files .upload-button-wrapper').parent().height() / 2 + $('#source-files .upload-button-wrapper').height() / 2 - 50);


									self.loadedButton(element);


								}

							},


							"#step-2-new .next-step click": function(element) {
								this.options.withoutFiles = false;
								var self = this;
								if (!element.hasClass('disabled')) {
									if (sessionObject.showFileStats === false) {
										this.loadButton(element);
										this.step4(element, function() {
											self.changeStep(2, 4);
										});
									} else {
										if (this.options.step == 2) {
											this.options.step = 3;
										}
										$("#bigModal #step-3").html("templates/quotes/request_modal_step3.ejs", {files: this.options.filesTemp, rm: this.options.rmTemp});
										self.changeStep(2, 3);
									}
								}
							},
							"#step-2-new .btn-next-2 click": function(element) {
								this.options.withoutFiles = true;
								var self = this;
								if (!element.hasClass('disabled')) {
									this.loadButton(element);
									this.step4(element, function() {
										self.changeStep(2, 4);
									});

								}

							},
							"#step-2-new .link-return click": function(element) {
								this.changeStep(2, 1);
								return false;
							},
							"#step-3 .link-return click": function(element) {
								this.changeStep(3, 2);
								return false;
							},
							"#step-4 .link-return click": function(element) {
								this.options.preNotes = $("#input-quote-notes").val();
								this.options.preProfile = $("#select-price-profile").val();
								var persons = [];
								$.each($('.contact-list .contact-info'), function(index, element) {
									persons.push($(element).attr('data-current-value'));
								});
								this.options.prePersons = persons;

								var contactListCheck = $('#contact-persons').find('.actions input:checked');
								var sendBackToId = [];
								$.each(contactListCheck, function(i, element) {
									sendBackToId.push($(element).parents('.contact-info').attr('data-current-value'));
								});
								this.options.sendBackTo = sendBackToId;

								if (this.options.withoutFiles || sessionObject.showFileStats === false) {
									this.changeStep(4, 2);
									this.options.step = 2;
								} else {
									this.changeStep(4, 3);
									this.options.step = 3;
								}
                                $('#step-2-new .btn-next-2').removeClass('loading').removeClass('disabled');
								return false;
							},
							"#select-contact-persons4 change": function(element) {
								var self = this;

								element.parents("form").find(".faces").html("");

								$.each(element.select2("val"), function(index, value) {
									$.each(self.options.contactPersons, function(index2, value2) {
										if (value == value2.id) {
											value2.avatar = baseURL + "customers/" + sessionObject.id + "/persons/" + value2.id + "/image?width=48&crop=false";
											element.parents("form").find(".faces").append("templates/quotes/request_contact_faces.ejs", {person: value2});
										}
									});
								});

							},
							"#select-price-profile change": function(element) {
								var self = this;
								$.each(self.options.priceProfiles, function(index, value) {
									if (value.name == $("#select-price-profile").select2('val')) {
										if (value.defaultContactPerson != null) {
											$("#step-4 .select-contact-persons-single").parents('.controls').remove();
											$(".contact-list").html("");
											$("#select-contact-persons").select2('val', null);
											$(".contact-list").after(self.options.selectPersonElement);
											$("#step-4 .select-contact-persons-single:last").select2({
												width: 'element',
												minimumResultsForSearch: 10,
												allowClear: true
											});
											$("#step-4 .select-contact-persons-single:last").select2('val', value.defaultContactPerson.id);
											$("#step-4 .select-contact-persons-single").change();
										} else {
											$("#step-4 .select-contact-persons-single").parents('.controls').remove();
											$(".contact-list").html("");
											$("#select-contact-persons").select2('val', null);
											$(".contact-list").after(self.options.selectPersonElement);
											$("#step-4 .select-contact-persons-single:last").select2({
												width: 'element',
												minimumResultsForSearch: 10,
												allowClear: true
											});

											element.parents("form").find(".faces").html("");
											//$("#select-price-profile").change();
										}

									}
								});

								this.validateStep4(element);
							},
							"#input-quote-notes keyup": function(element) {
								this.validateStep4(element);
							},
							"#step-4 .text-input keyup": function(element) {
								this.validateStep4(element);
							},


                            validateStep4: function (element) {
                                var filledNotes = true;
                                var self =this;
                                if (this.options.withoutFiles == true && $("#input-quote-notes").val() == "") filledNotes = false;

                                $("#step-4 .next-step").removeClass('disabled');
                                if ($("#select-price-profile option").length > 2) {
                                    if (($("#select-price-profile").select2('val') == null || $("#select-price-profile").select2('val') == "") || !filledNotes) {
                                        if (!$("#step-4 .next-step").hasClass('disabled')) {
                                            $("#step-4 .next-step").addClass('disabled')
                                        }
                                    } else {
                                        var doDisabled = true;
                                        $.each(self.options.priceProfiles, function (index, value) {
                                            if (value.name == $("#select-price-profile").select2('val')) {
                                                if (value.defaultContactPerson != null) doDisabled = false;
                                            }
                                        });
                                        if (doDisabled) {
                                            if (($("#select-contact-persons").val() == "" || $("#select-contact-persons").val() == null) || !filledNotes) {
                                                if (!$("#step-4 .next-step").hasClass('disabled')) {
                                                    $("#step-4 .next-step").addClass('disabled')
                                                }
                                            } else {
                                                $("#step-4 .next-step").removeClass('disabled');
                                            }
                                        } else {
                                            $("#step-4 .next-step").removeClass('disabled');
                                        }
                                    }
                                } else if (($("#select-price-profile option").length == 2 && ($("#select-contact-persons").val() == "" || $("#select-contact-persons").val() == null)) || !filledNotes) {
                                    if (!$("#step-4 .next-step").hasClass('disabled')) {
                                        $("#step-4 .next-step").addClass('disabled');
                                    }
                                } else {
                                    if (self.options && self.options.priceProfiles.length == 1 && ($("#select-contact-persons").val() == "" || $("#select-contact-persons").val() == null) && self.options.priceProfiles[0].defaultContactPerson == null) {
                                        if (!$("#step-4 .next-step").hasClass('disabled')) {
                                            $("#step-4 .next-step").addClass('disabled');
                                        }
                                    } else
                                        $("#step-4 .next-step").removeClass('disabled');
                                }

							},

							hintStep4: function(element) {
								var self = this;
								var filledNotes = true;
								if (this.options.withoutFiles == true && $("#input-quote-notes").val() == "") filledNotes = false;

								if (filledNotes == false) {
									$("#input-quote-notes").parents(".control-group").addClass('error');
								}

								if ($("#select-price-profile option").length > 2) {
									if (($("#select-price-profile").select2('val') == null || $("#select-price-profile").select2('val') == "")) {
										$("#select-price-profile").parents(".control-group").addClass('error');
									} else {
										var doDisabled = true;
										$.each(self.options.priceProfiles, function(index, value) {
											if (value.name == $("#select-price-profile").select2('val')) {
												if (value.defaultContactPerson != null) doDisabled = false;
											}
										});
										if (doDisabled) {
											if (($("#select-contact-persons").val() == "" || $("#select-contact-persons").val() == null)) {
												$(".select-contact-persons-single").parents(".control-group").addClass('error');
											}
										}
									}
								} else {
									if ($("#select-price-profile option").length == 2 && ($("#select-contact-persons").val() == "" || $("#select-contact-persons").val() == null)) {
										$(".select-contact-persons-single").parents(".control-group").addClass('error');
									} else {
										if (self.options.priceProfiles.length == 1 && ($("#select-contact-persons").val() == "" || $("#select-contact-persons").val() == null) && self.options.priceProfiles[0].defaultContactPerson == null) {
											$(".select-contact-persons-single").parents(".control-group").addClass('error');
										}
									}
								}




							},
							"#step-4 .next-step mouseover": function(element) {
								this.hintStep4(element);
							},
							"#step-4 .next-step mouseout": function(element) {
								$("#step-4 .control-group").removeClass('error');

							},
							isPersonOnList: function(personID) {
								return $('.contact-info[data-current-value="' + personID + '"]').length > 0;
							},
							preselectPersons: function() {
								var self = this;
								var currentContactPersons = self.options.prePersons;
								var z = 0;
								$.each(self.options.prePersons, function(index, personID) {
									$(".select-contact-persons-single:last").val(personID);
									//$(".select-contact-persons-single:last").change();


									if ($(".select-contact-persons-single:last").val() && $(".select-contact-persons-single:last").val() != "") {
										$(".select-contact-persons-single:last").attr('data-current-value', $(".select-contact-persons-single:last").val());
										var currentPersonName = "";
										$.each(self.options.contactPersons, function(index, value) {
											if ($(".select-contact-persons-single:last").val() == value.id) {
												currentPersonName = value.name;
											}

										});

										var currentAvatar = baseURL + "customers/" + sessionObject.id + "/persons/" + $(".select-contact-persons-single:last").val() + "/image?width=63&height=63&crop=false";

										if (!self.isPersonOnList($(".select-contact-persons-single:last").val()))
											$("#bigModal #step-4 .contact-list").append('templates/quotes/step4_contact_info.ejs', {
												currentPersonName: currentPersonName,
												currentValue: $(".select-contact-persons-single:last").val(),
												currentAvatar: currentAvatar,
                                                isServiceClassic: self.isServiceClassic()
											});

										var contactPersonSelect = $(".select-contact-persons-single:last").parents(".controls").html();
										$(".select-contact-persons-single:last").parents(".controls").css('display', 'none');


									}
									if ($(".select-contact-persons-single:last").find("option").length > 2)
										$("#add-cp").css('display', 'block');
									$("#select-contact-persons").select2('val', currentContactPersons);
									// $("#select-price-profile").change();

									self.validateStep4($(".select-contact-persons-single:last"));
									z++;
									if (z < self.options.prePersons.length) {
										var currentContactPersons2 = [];
										$.each($(".select-contact-persons-single"), function() {
											if ($(this).val() && $(this).val() != "") {
												currentContactPersons[currentContactPersons2.length] = $(this).val();
											}

										});

										$(".select-contact-persons-single:last").parents(".controls").after(self.options.selectPersonElement);

										localizeAttribute(".select-contact-persons-single:last", "placeholder", null);

										$.each(currentContactPersons2, function(index, value) {
											$('.select-contact-persons-single:last option[value="' + value + '"]').remove();
										});

										$("#step-4 .select-contact-persons-single:last").select2({
											width: 'element',
											minimumResultsForSearch: 10,
											allowClear: true,
											dropdownCssClass: "select2-step-4"
										});
									}


								});
							},
							".change-send-back-to click": function(element) {
								if (!element.is(':checked')) {
									element.removeClass('active');
								} else {
									$.each(element.parents('.contact-list').find(".change-send-back-to"), function() {
										if ($(this) != element) {
											$(this).attr("checked", false);
										}
									})
									element.attr("checked", true);
								}
							},
							".select-contact-persons-single:last change": function(element) {
								var self = this;
								var currentContactPersons = [];
								$.each($(".select-contact-persons-single"), function() {
									if ($(this).val() && $(this).val() != "") {
										currentContactPersons[currentContactPersons.length] = $(this).val();
									}

								});

								if (element.val() && element.val() != "") {
									element.attr('data-current-value', element.val());
									var currentPersonName = "";
									$.each(self.options.contactPersons, function(index, value) {
										if (element.val() == value.id) {
											currentPersonName = value.name;
										}

									});

									var currentAvatar = baseURL + "customers/" + sessionObject.id + "/persons/" + element.val() + "/image?width=63&height=63&crop=false";
									if (!self.isPersonOnList(element.val()))
										$("#bigModal #step-4 .contact-list").append('templates/quotes/step4_contact_info.ejs', {
											currentPersonName: currentPersonName,
											currentValue: element.val(),
											currentAvatar: currentAvatar,
                                            isServiceClassic: self.isServiceClassic()
										});

									var contactPersonSelect = element.parents(".controls").html();
									element.parents(".controls").css('display', 'none');
								}
								if (element.find("option").length > 2)
									$("#add-cp").css('display', 'block');
								$("#select-contact-persons").select2('val', currentContactPersons);
								// $("#select-price-profile").change();
								this.validateStep4(element);

							},
							"#step-4 .remove-contact-person click": function(element) {
								var self = this;
								var currentValue = element.parents('.contact-info').data('current-value');
								$('.select-contact-persons-single[data-current-value="' + currentValue + '"]').parents(".controls").remove();

								var currentContactPersons = [];
								$.each($(".select-contact-persons-single"), function() {
									if ($(this).val() && $(this).val() != "") {
										currentContactPersons[currentContactPersons.length] = $(this).val();
									}

								});
								$("#select-contact-persons").select2('val', currentContactPersons);

								element.parents('.contact-info').remove();

								if ($(".select-contact-persons-single").length == 0) {
									$("#add-cp").css('display', 'none');
									$(".contact-list").after(self.options.selectPersonElement);
									$("#step-4 .select-contact-persons-single:last").select2({
										width: 'element',
										minimumResultsForSearch: 10,
										allowClear: true,
										dropdownCssClass: "select2-step-4"
									});
								}
								this.validateStep4(element);

							},
							"#add-cp click": function(element) {
								var self = this;
								var currentContactPersons = [];
								$.each($(".select-contact-persons-single"), function() {
									if ($(this).val() && $(this).val() != "") {
										currentContactPersons[currentContactPersons.length] = $(this).val();
									}

								});

								$(".select-contact-persons-single:last").parents(".controls").after(self.options.selectPersonElement);

								localizeAttribute(".select-contact-persons-single:last", "placeholder", null);

								$.each(currentContactPersons, function(index, value) {
									$('.select-contact-persons-single:last option[value="' + value + '"]').remove();
								});

								$("#step-4 .select-contact-persons-single:last").select2({
									width: 'element',
									minimumResultsForSearch: 10,
									allowClear: true,
									dropdownCssClass: "select2-step-4"
								});

								$("#step-4 .select-contact-persons-single:last").select2('open');

								$("#add-cp").css('display', 'none');


							},
							isServiceClassic: function(){
                                var self = this;
                                return self.options.servicesHash[self.options.requestedQuote.service.name].type === "CLASSIC";
							},
							step4: function(element, success) {

								var self = this;

                                var numberOfWords = 0;


                                if (self.options.filesTemp && self.options.filesTemp.length > 0) {
                                    numberOfWords = _.reduce(self.options.filesTemp, function(memo, file) {
                                        if (file && file.fileStats) {
                                            return memo + file.fileStats.words;
                                        }
                                        return memo;
                                    }, 0);
                                }


                                RQuote.getPriceProfiles(function(priceProfiles) {
									RQuote.getContactPersons(function(contactPersons) {
										var offices = self.options.step1FunctionsResults.offices;

										if (typeof self.options.contactPersons === 'undefined') {
											self.options.contactPersons = contactPersons;
										} else {
											contactPersons = self.options.contactPersons;
										}

										if (typeof self.options.priceProfiles === 'undefined') {
											self.options.priceProfiles = priceProfiles;
										} else {
											priceProfiles = self.options.priceProfiles;
										}

										$("#bigModal #step-4").html("templates/quotes/request_modal_step4.ejs", {
											offices: offices,
											priceProfiles: priceProfiles,
											contactPersons: contactPersons,
                                            estimatedCost: numberOfWords*0.11*self.options.requestedQuote.targetLanguages.length
										});
										self.options.selectPersonElement = '<div class="controls">' + $("#step-4 .select-contact-persons-single:last").parents(".controls").html() + '</div>';


										if (self.options.withoutFiles == true || sessionObject.showFileStats === false) {
											$("#step-4 .modal-footer .link-return").remove();
											$("#step-4 .modal-footer").prepend('<a class="link-return pull-left"><i class="icon-return"></i> <span data-localize="general.source-materials">Source Materials</span></a>');
										}

										if (self.options.raProject == true) {
											$(".raq-rap-wrapper").html('<button class="btn btn-cta next-step btn-large disabled" data-localize="general.rap-final">Request project</button>')
										}

										localizeAttribute("#select-price-profile", "placeholder", "modules.quotes.input-quote-select-pp-ph");
										localizeAttribute("#select-contact-persons", "placeholder", "modules.quotes.input-quote-select-contacts-ph");
										localizeAttribute(".select-contact-persons-single:last", "placeholder", null);


										self.options.step = 4;

										$("#step-4 #input-quote-notes").val(self.options.preNotes);


										if (self.options.prePersons == null || self.options.prePersons.length == 0) self.options.prePersons = new Array();
										if (self.options.prePersons.length == 0) {
											if (sessionObject.type == "CustomerPerson") {
												self.options.prePersons = [sessionObject.id];
											}
											else if (self.options.priceProfiles.length == 1 && self.options.priceProfiles[0].defaultContactPerson != null) {
												self.options.prePersons = [self.options.priceProfiles[0].defaultContactPerson.id];
											}
										}

										if (self.options.requestedQuote.office) {
											$("#summary-office").html(self.options.requestedQuote.office.name);
										} else {
											$("#summary-office")
												.hide()
												.prev()
												.hide();
										}

										$("#summary-specialization").html(self.options.specializationsHash[self.options.requestedQuote.specialization.name].localizedName);
										$("#summary-tos").html(self.options.servicesHash[self.options.requestedQuote.service.name].localizedName);
										$("#summary-source-lang").html(self.options.languagesHash[self.options.requestedQuote.sourceLanguage.id].displayName);


										var targetLangsString = "";

										$.each(self.options.requestedQuote.targetLanguages, function(index, value) {
											targetLangsString += self.options.languagesHash[value.id].displayName;
											if (self.options.requestedQuote.targetLanguages.length > (index + 1)) targetLangsString += ", ";
										});
										$("#summary-target-langs").html(targetLangsString);


										self.validateStep4();

										if (success) success();

										self.loadedButton(element);

										$("#step-4 .chosen-process").select2({
											width: 'element',
											minimumResultsForSearch: 10,
											allowClear: true,
											dropdownCssClass: "select2-step-4"
										});

										$("#step-4 .select-contact-persons-single").select2({
											width: 'element',
											minimumResultsForSearch: 10,
											allowClear: true,
											dropdownCssClass: "select2-step-4"
										});

										$("#step-4 #select-price-profile").select2('val', self.options.preProfile);

										setTimeout(function(){
											$('div.contact-info[data-current-value="'+self.options.sendBackTo[0]+'"]').find('input[type="checkbox"]').prop('checked', true);
										});

										self.preselectPersons();

										try {
											if (self.options.contactPersons.length == 1) {

												$(".select-contact-persons-single:last").select2('val', self.options.contactPersons[0].id);
												$(".select-contact-persons-single:last").change();
												$("#add-cp").css('display', 'none');
											}


										} catch (err) {

										}

                                        if (self.isServiceClassic() && self.isProjectRequested()) {
                                            $("#step-4 .modal-footer").prepend('<div class="quote-alert"><div class="alert alert-warning" data-localize="modules.quotes.first-you-will-receive-quote">First you will receive a quote. Then your project will be automatically started without waiting for your acceptance.	</div></div>');
                                            self.loadButton(element);
                                        }


									}, function(error) {
										errorHandle(error)
									});
								}, function(error) {
									errorHandle(error)
								});

							},

							"#step-3 .next-step click": function(element) {
								self = this;
								this.options.withoutFiles = false;
								if (!element.hasClass('disabled')) {
									this.loadButton(element);


									this.step4(element, function() {
										self.changeStep(3, 4);
									});

								}


							},


							"#step-4 .next-step click": function(element) {
								var self = this;
								if (!element.hasClass("disabled")) {

									var longTimeAlert = setTimeout(function(){
										$("#step-4 .modal-footer").prepend('<div class="long-time-alert"><div class="alert alert-warning" data-localize="modules.quotes.this-may-take-several-minutes">This may take several minutes. Please wait.	</div></div>');
										self.loadButton(element);
									},5000);


									self.loadButton(element);

									$("#bigModal #step-4 .modal-body .alert").remove();
									var self = this;
									this.options.requestedQuote.notes = $("#input-quote-notes").val();
									this.options.requestedQuote.autoAccept = self.options.raProject;

									if (self.options.priceProfiles.length == 1) {
										this.options.requestedQuote.priceProfile = {"name": self.options.priceProfiles[0].name};
									} else {
										if ($("#select-price-profile").val() != "" && $("#select-price-profile").val() != null)
											this.options.requestedQuote.priceProfile = {"name": $("#select-price-profile").val()};
									}

									this.options.requestedQuote.files = new Array();

									this.options.requestedQuote.referenceFiles = new Array();


									if (this.options.withoutFiles == false) {
										$.each(this.options.filesTemp, function(index, element) {
											if (element != null) {
												self.options.requestedQuote.files[self.options.requestedQuote.files.length] = {"id": element.id};
											}
										});

										$.each(this.options.rmTemp, function(index, element) {
											if (element != null) {
												self.options.requestedQuote.referenceFiles[self.options.requestedQuote.referenceFiles.length] = {"id": element.id};
											}
										});

									}

									self.options.requestedQuote.additionalPersons = new Array();
									var i = 0;
									if ($("#select-contact-persons").val() != null)
										$.each($("#bigModal #step-4 .contact-info"), function() {
											if ($(this).data('current-value') && $(this).data('current-value') != "" && (i == 0 || !$(this).find('input[type="checkbox"]').is(':checked'))) {
												if (i == 0) {
													self.options.requestedQuote.person = {"id": $(this).data('current-value')};
												} else {
													self.options.requestedQuote.additionalPersons[i - 1] = new Object();
													self.options.requestedQuote.additionalPersons[i - 1].id = $(this).data('current-value');
												}
												i++;
											}
										})


									if ($('#bigModal #step-4  #contact-persons input[type="checkbox"]:checked').length > 0) {
										self.options.requestedQuote.sendBackTo = {"id": $('#bigModal #step-4  #contact-persons input[type="checkbox"]:checked').first().parents(".contact-info").data('current-value')};
									} else {
										self.options.requestedQuote.sendBackTo = null;
									}

                                    RQuote.doRequestQuote(this.options.requestedQuote,
										function(quote) {
											clearTimeout(longTimeAlert);

											$("#bigModal .modal-step-indicator").slideUp();

											$("#bigModal #step-5").append("templates/quotes/request_modal_step5.ejs", {"quote": quote});


											self.loadedButton(element);
											self.changeStep(4, 5);
										},
										function(error) {
											clearTimeout(longTimeAlert);
											$('.long-time-alert').remove();

											if (self.options.raProject == true) {
												$("#bigModal #step-4 .modal-body").prepend('<div class="alert alert-error"><i class="icon-error"></i><span data-localize="modules.projects.launch-problem">Sorry, there was a problem with launching the project. Please try again or contact us.</span></div>');
											} else {
												$("#bigModal #step-4 .modal-body").prepend('<div class="alert alert-error"><i class="icon-error"></i><span data-localize="modules.quotes.request-problem">Sorry, there was a problem with requesting the quote. Please try again or contact us.</span></div>');
											}

											self.loadedButton(element);


										});
								}

							},
							"#view-quote-button click": function(element) {
								$("#bigModal").modal('hide');
							},
							"#view-project-button click": function(element) {
								$("#bigModal").modal('hide');
							},
							"#paste-button click": function(element) {
								self = this;
								RQuote.pasteFromClipboard($("#paste-area").val(), function(file) {
									var thisFileId = 0;
									self.options.allFiles[self.options.allFiles.length] = file;
									$.each(self.options.allFiles, function(index, value) {
										if (file == value) {
											thisFileId = index;
										}
									});

									$("#bigModal #step-2-new #source-files-container .uploader-wrapper .uploaded-files-list").append('templates/quotes/uploaded_file.ejs', {"file": file, "fileIndex": thisFileId, pasted: true});
									$('#bigModal #step-2-new #source-files-container .uploader-wrapper .uploaded-files-list li[fileindex="' + thisFileId + '"]').find(".bar").css('width', "100%").attr("data-progress", '100');
									$('#bigModal #step-2-new #source-files-container .uploader-wrapper .uploaded-files-list li[fileindex="' + thisFileId + '"]').find('.file-remove').css('display', '');
									$('#bigModal #step-2-new #source-files-container .uploader-wrapper .uploaded-files-list li[fileindex="' + thisFileId + '"]').removeClass("uploading");
									$('#source-files-container').find(".info-overlay").fadeOut();
									$("#paste-expand").removeClass("disabled");

									self.options.filesTemp[thisFileId] = file;

									$("#paste-from-clipboard").css('display', 'none');
									element.parents('.uploader-group').find('.uploader-wrapper .uploaded-files-list').css('display', 'block');

									$(".btn-paste-v").css('display', 'none');
									$(".btn-upload-v").css('display', 'block');
									$("#step-2-new .next-step").removeClass('disabled');
									element.parents('.uploader-group').find('.uploader-wrapper .upload-button-wrapper').addClass('faded');
									element.parents('.accordion-body').removeClass('pasting');
									$("#paste-area").val("");

								});
								element.parents('.accordion-body').removeClass('pasting');
								$("#paste-area").val("");
								return false;
							},
							"#cancel-paste-button click": function(element) {
								$("#paste-from-clipboard").css('display', 'none');

								element.parents('.uploader-group').find('.uploader-wrapper .uploaded-files-list').css('display', 'block');

								$(".btn-paste-v").css('display', 'none');
								$(".btn-upload-v").css('display', 'block');
								if (!element.parents('.uploader-group').find('.uploader-wrapper .upload-button-wrapper').hasClass('faded'))
									element.parents('.uploader-group').find('.uploader-wrapper .upload-button-wrapper').css('display', 'block');
								element.parents('.accordion-body').removeClass('pasting');
								$("#paste-area").val("");

								return false;
							},
							"#paste-expand click": function(element) {
								$(".btn-upload-v").css('display', 'none');
								$(".btn-paste-v").css('display', 'block');

								element.parents('.accordion-body').addClass('pasting');

								element.parents('.uploader-group').find('.uploader-wrapper .uploaded-files-list').css('display', 'none');
								element.parents('.uploader-group').find('.uploader-wrapper .upload-button-wrapper').css('display', 'none');

								$("#paste-from-clipboard").css('display', 'block');


								return false;
							},
							".add-ref-materials click": function(element) {
								var self = this;
								element.remove();

								$("#source-files-container").slideUp(500, function() {
									$("#source-files").addClass('collapsed');
									self.showRefMaterials(element);
								});


							},

							showRefMaterials: function(element) {

								$("#reference-accordion").css('display', 'block');
								$('#reference-materials .info-overlay').css('left', $('#reference-materials .info-overlay').parent().width() / 2 - $('#reference-materials .info-overlay').width() / 2 - 10);
								$('#reference-materials .info-overlay').css('top', $('#reference-materials .info-overlay').parent().height() / 2 - $('#reference-materials .info-overlay').height() * 2);
								$('#reference-materials .upload-button-wrapper').css('left', $('#reference-materials .upload-button-wrapper').parent().width() / 2 - $('#reference-materials .upload-button-wrapper').width() / 2);


								if ($("#step-2-new .info-overlay").length > 0)
									$('#reference-materials .upload-button-wrapper').css('top', $('#reference-materials .upload-button-wrapper').parent().height() / 2 + $('#reference-materials .upload-button-wrapper').height() / 2 - 25);
								else
									$('#reference-materials .upload-button-wrapper').css('top', $('#reference-materials .upload-button-wrapper').parent().height() / 2 + $('#reference-materials .upload-button-wrapper').height() / 2 - 50);


								var dropZone2 = $("#step-2-new #reference-materials-container .uploader-wrapper");

								$(document).bind('dragover', function(e) {
									$('#reference-materials .upload-button-wrapper').css('display', 'none');
									dropZone2.addClass('active');
								});

								$(document).bind('dragleave', function(e) {
									$('#reference-materials .upload-button-wrapper').css('display', 'block');
									dropZone2.removeClass('active');
								});

								$(document).bind('drop', function(e) {
									if ($('#reference-materials .uploaded-files-list').children().length == 0)
										$('#reference-materials .upload-button-wrapper').css('display', 'block');

									dropZone2.removeClass('active');

								});
							},


							"#step-2-new .accordion-toggle click": function(element) {

								element.parents('.uploader-accordion').find('.accordion-body').slideToggle(500, function() {
									if (element.parents(".uploader-group").hasClass('collapsed')) {
										element.parents(".uploader-group").removeClass('collapsed')
									} else {
										element.parents(".uploader-group").addClass('collapsed')

									}
								});


							},
							isBudgetCodeValid: function() {
								if (this.budgetCodesEnabledAndAvailable() && this.options.budgetCodeRequiredWhenAddingQuoteOrProject) {
									return !!$("#select-budget-code").val();
								}
								return true;
							},
							budgetCodesEnabledAndAvailable: function() {
								return settings.budgetCodesEnabled && this.options.budgetCodes && !_.isEmpty(this.options.budgetCodes);
							},
                            isProjectRequested: function() {
                                return !!this.options.raProject;
                            }

						});

					});
				/*END*/
			});
		/*END*/
	});
