steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	'./files.js',
	'./offices.js',
	'./tasks.js',

	function($) {
		$.Model('Quote', {
				findAll: function(params, success, error) {
					var queryString = queryBuilder(params);
					return $.ajax({
						url: baseURL + 'quotes' + addToURL + queryString,
						dataType: 'json',
						type: "GET",
						cache: false,
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});

				},
				count: function(params, success, error) {
					var queryString = queryBuilder(params);
					return $.ajax({
						url: baseURL + 'quotes/count' + addToURL + queryString,
						dataType: 'json',
						type: "GET",
						cache: false,
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});

				},
				findAllAlternatingQuotes: function(params, success, error) {
					var queryString = queryBuilder(params);
					return $.ajax({
						url: baseURL + 'alternating-quotes' + addToURL + queryString,
						dataType: 'json',
						type: "GET",
						cache: false,
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});

				},

				countAlternatingQuotes: function(params, success, error) {
					var queryString = queryBuilder(params);
					return $.ajax({
						url: baseURL + 'alternating-quotes/count' + addToURL.substr(5) + queryString,
						dataType: 'text',
						type: "GET",
						cache: false,
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});

				},

				findOneAlternatingQuote: function(quoteID, success, error) {
					return $.ajax({
						url: baseURL + 'alternating-quotes/' + quoteID + addToURL,
						dataType: 'json',
						type: "GET",
						cache: false,
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});
				},

				findOne: function(quoteID, success, error) {
					return $.ajax({
						url: baseURL + 'quotes/' + quoteID + addToURL,
						dataType: 'json',
						type: "GET",
						cache: false,
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});
				},
				acceptQuote: function(quoteID, success, error) {
					return $.ajax({
						url: baseURL + 'quotes/' + quoteID + addToURL,
						type: "POST",
						data: {"action": "ACCEPT"},
						dataType: 'json',
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});
				},
				rejectSingleQuote: function(quoteID, success, error) {
					return $.ajax({
						url: baseURL + 'quotes/' + quoteID + '/acceptance' + addToURL,
						type: "DELETE",
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});
				},
				rejectAllQuotes: function(oneOfQuotesID, success, error) {
					return $.ajax({
						url: baseURL + '/alternating-quotes/' + oneOfQuotesID + '/acceptance' + addToURL,
						type: "DELETE",
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});
				},

				changeName: function(quoteID, newName, refNo, success, error) {
					return $.ajax({
						url: baseURL + 'quotes/' + quoteID + addToURL,
						type: "PUT",
						contentType: "application/json",
						data: JSON.stringify({"name": newName, refNumber: refNo}),
						dataType: 'json',
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});
				},

				updateOffice: function(id, changeOffice, success, error) {
					return $.ajax({
						url: baseURL + 'quotes/' + id + '/office' + addToURL.substr(5),
						type: 'PUT',
						contentType: 'application/json',
						dataType: 'json',
						xhrFields: { withCredentials: true},
						data: JSON.stringify(changeOffice),
						success: success,
						error: error
					});
				}
			},
			{});


		$.Controller("Quotes", {
			init: function(element, options) {
				if (tasksController == null)
					tasksController = new Tasks(document.body);
				if (filesController == null)
					filesController = new Files(document.body);
				if (options.list == true) {
					this.options.list = true;
					this.showQuotes(options.targetDiv, options);
				}
				else {
					this.options.list = false;
					this.showSingleQuote(options.targetDiv, options);
				}

			},

			showSingleQuote: function(element, options) {
				var alternatingQuoteId = options.quoteID;
				var self = this;
				Quote.findOneAlternatingQuote(alternatingQuoteId, function(alternatingQuote) {
					alternatingQuote.status = self.getAlternatingQuoteStatus(alternatingQuote);
					alternatingQuote.isSingleQuote = (alternatingQuote.alternatingQuotes.length === 1);
					alternatingQuote.salesPerson.avatar = baseURL + 'users/' + alternatingQuote.salesPerson.id + '/image?width=48&height=48&crop=false';
					alternatingQuote.customerContactPerson.avatar = baseURL + 'customers/' + customerID + '/persons/' + alternatingQuote.customerContactPerson.id + '/image?width=48&height=48&crop=true';
					alternatingQuote.additionalContacts = alternatingQuote.alternatingQuotes[0].contactPersons.additionalContacts;

					if (alternatingQuote.isSingleQuote) {
						alternatingQuote.alternatingQuotes[0].languageCombinationsString = helperController.getLanguageCombinationsString(alternatingQuote.alternatingQuotes[0].languageCombinations);
					}

					_.each(alternatingQuote.alternatingQuotes, function(quote) {
						quote.availableCustomFields = _.where(quote.customFields, {availableForCustomerPortal: true});
						alternatingQuote.additionalContacts = _.intersection(alternatingQuote.additionalContacts, quote.contactPersons.additionalContacts);
					});

					alternatingQuote.additionalContacts = _.uniq(alternatingQuote.additionalContacts, function(additionalContact){ return additionalContact.id });

					element.html("templates/quotes/alternating-quotes/quote-wrapper.ejs", {
						"alternatingQuote": alternatingQuote,
						"contactPersonAvatar": contactPersonAvatar,
						"offices": offices
					});

					$("body").removeClass();
					$("body").addClass("single-view");
					$("body").addClass("single-quote-view");


					_.each(alternatingQuote.alternatingQuotes, function(quote) {
						if (quote.status === "REQUESTED" || quote.status === "PENDING") {
							preparePendingQuote(quote);
							prepareBackToActiveQuotesListLinks();
						}

						if (quote.status === "SENT") {
							prepareSentQuote(quote);
							prepareBackToActiveQuotesListLinks();
						}

						if (quote.status === "REJECTED") {
							prepareRejectedQuote(quote);
							prepareBackToPastQuotesListLinks();
						}

						if (quote.status === "ACCEPTED" || quote.status === "ACCEPTED_BY_CUSTOMER") {
							prepareAcceptedQuote(quote);
							prepareBackToPastQuotesListLinks();
						}

						if (quote.customerNotes) {
							quote.customerNotes = helperController.stripTags(quote.customerNotes);
							$(".notes-placeholder").html(quote.customerNotes);
							$('.notes-placeholder').linkify({target: "_blank"});
						}
					});


				},
				function(error) {
					if (window.location.hash.includes('!quote/')) {
						location.hash = "!quotes/active/1";
					}
					dontShowLoader();
				});

				function prepareBackToPastQuotesListLinks() {
					if (lastPage != 0 && lastPage != "0") {
						$("a.return-button").attr("href", "#!quotes/history/" + lastPage);
						$("a.link-return").attr("href", "#!quotes/history/" + lastPage);
						lastPage = 0;
					} else {
						$("a.return-button").attr("href", "#!quotes/history/1");
						$("a.link-return").attr("href", "#!quotes/history/1");
					}
				}

				function prepareBackToActiveQuotesListLinks() {
					if (lastPage != 0 && lastPage != "0") {
						$("a.return-button").attr("href", "#!quotes/active/" + lastPage);
						$("a.link-return").attr("href", "#!quotes/active/" + lastPage);
						lastPage = 0;
					}
				}

				function prepareRejectedQuote(quote) {
					var quoteID = quote.id;
					var quoteDiv = element.find('.module-quote[quoteID2="' + quote.id + '"]');
					if (quote.hasInputWorkfiles == false && quote.hasInputResources == true)
						filesController.loadResourcesTabInQuote(quoteID, quoteDiv, 2, false, false, quote.totalAgreed.formattedAmount);
					else
						filesController.loadFilesTabInQuote(quoteID, quoteDiv, 1, false, false, quote.totalAgreed.formattedAmount);

				}


				function preparePendingQuote(quote) {
					var quoteDiv = element.find('.module-quote[quoteID2="' + quote.id + '"]');
					var quoteID = quote.id;
					if (quote.hasInputWorkfiles == false && quote.hasInputResources == true) {
						filesController.loadResourcesTabInQuote(quoteID, quoteDiv, 2, false, false, quote.totalAgreed.formattedAmount);
					}
					else {
						filesController.loadFilesTabInQuote(quoteID, quoteDiv, 1, false, false, quote.totalAgreed.formattedAmount);
					}
				}

				function prepareSentQuote(quote) {
					var quoteDiv = element.find('.module-quote[quoteID2="' + quote.id + '"]');
					var quoteID = quote.id;
					tasksController.loadTasksInQuote(quoteID, quoteDiv, 1, false, true, quote.totalAgreed.formattedAmount);
					if (pdf_info.acrobat != null) {
						bindViewDownload(element.find(".quote-in-aq"));
					}
				}

				function prepareAcceptedQuote(quote) {
					var quoteDiv = element.find('.module-quote[quoteID2="' + quote.id + '"]');
					var quoteID = quote.id;
					if (quote.accepter != null && quote.accepter.id != null && quote.accepter.id == sessionObject.id) {
						quote.accepter.you = true;
					}
					if (quote.accepter == null)
						quote.accepter = {};
					tasksController.loadTasksInQuote(quoteID, quoteDiv, 1, false, true, quote.totalAgreed.formattedAmount);

					if (pdf_info.acrobat != null) {
						bindViewDownload(element.find(".quote-in-aq"));
					}
				}

				function contactPersonAvatar(contactPersonId){
					return baseURL + 'customers/' + customerID + '/persons/' + contactPersonId + '/image?width=48&height=48&crop=true';
				}

				dontShowLoader();
			},
			clearDatePicker: function(datePickerName) {
				var targetPicker = $('input[name="' + datePickerName + '"]');
				this.options[datePickerName] = null;
				targetPicker.val('');
				targetPicker.data('daterangepicker').setStartDate('');
				targetPicker.data('daterangepicker').setEndDate('');
			},
			".quotes-header .clear-datepicker click": function(element) {
				var targetPickerName = element.data('target');
				this.clearDatePicker(targetPickerName);
				this.showQuotes(this.options.targetDiv, this.options);
			},
			".module-quote .clear-criteria click": function() {
				this.clearDatePicker('createdOn');
				this.clearDatePicker('expirationDate');
				if (this.options.search) {
					location.hash = "quotes/" + this.options.tab + "/1";
				} else {
					this.showQuotes(this.options.targetDiv, this.options);
				}

			},
			showQuotes: function(element, options) {
				doShowLoader();
				var self = this;
				this.options = options;
				var statusFromTab = "ACCEPTED|REQUESTED|PENDING";
				var itemsPerPage;
				var pageLimit;
				if (options.tab == "history") {
					statusFromTab = "ACCEPTED|ACCEPTED_BY_CUSTOMER|REJECTED";
					itemsPerPage = historyPageLimit
					pageLimit = historyPageLimit;
				}
				if (options.tab == "active") {
					statusFromTab = "REQUESTED|PENDING|SENT";
					itemsPerPage = defaultPageLimit;
					pageLimit = defaultPageLimit;
				}

				var quotesDatePickers = [
					{name: 'createdOn', from: 'createdOnFrom', to: 'createdOnTo'},
					{name: 'expirationDate', from: 'expirationDateFrom', to: 'expirationDateTo'}
				];

				var offset = pageLimit * (options.page - 1);
				var quotesOptions = {"status": statusFromTab, "start": offset, "limit": itemsPerPage};
				var quotesCountOptions = {"status": statusFromTab};

				var dateRangePickers = new DateRangePickerFactory(quotesDatePickers, this, quotesCountOptions, quotesOptions, this.showQuotes);

				if (options.search) {
					try {
						quotesOptions.search = decodeURIComponent(options.search);
						quotesCountOptions.search = decodeURIComponent(options.search);
					} catch (err) {
						location.hash = "";
					}
				}

				dateRangePickers.init();
				initQuotesList();
				dateRangePickers.initElements();

				Quote.countAlternatingQuotes(quotesCountOptions, function(countAlternatingQuotes) {
					options.countAlternatingQuotes = countAlternatingQuotes;
					var lastPage = options.page;

					if (countAlternatingQuotes == 0) {
						self.showEmptyQuotesList(element, options);
						dontShowLoader();
					}
					else {
						Quote.findAllAlternatingQuotes(quotesOptions, function(alternatingQuotes) {
								var alternatingQuotesList = self.prepareAlternatingQuotesList(alternatingQuotes);
								if (options.tab == "active") {
									element.find(".quotes-list").prepend("templates/quotes/alternating-quotes/active-list.ejs", {
										"alternatingQuotesList": alternatingQuotesList,
										"offices": offices
									});
									if (permissionsTable['quote_view'] == 0) {
										$(".module-quote header h3 a").removeAttr('href');
										$(".module-quote .action-edit-name").remove();
									}
								}

								if (options.tab == "history") {
									element.find(".quotes-list").prepend("templates/quotes/alternating-quotes/history-list.ejs", {"alternatingQuotesList": alternatingQuotesList});
									$.each($(".quote-name-tooltip"), function() {
										$(this).attr('title', $(this).siblings('span.hidden-title').html());
									});
									if (permissionsTable['quote_view'] == 0) {
										$("table.quotes a").removeAttr('href');
									}
								}

								$(".tooltip").detach();
								$("[rel=tooltip]").tooltip();

								$("[rel=tooltip]").on('click', function() {
									$(this).tooltip('hide');
								});

								appendSearchPagination();
								dontShowLoader();

							},
							function(error) {
								errorHandle(error);
								location.hash = "#!";
								dontShowLoader();
							}
						);
					}


					updateSearchInput();

				}, function(error) {
					errorHandle(error);
					location.hash = "#!";
					dontShowLoader();
				});


				function initQuotesList() {
					element.html("templates/quotes/alternating-quotes/list-wrapper.ejs", {});
					localizeAttribute('#search-quotes input[name="id-and-name"]', "placeholder", null);
					localizeAttribute('#search-quotes input[name="createdOn"]', "placeholder", null);
					localizeAttribute('#search-quotes input[name="expirationDate"]', "placeholder", null);
					element.find(".quotes-header .tools .btn-group a").removeClass("active");
					element.find('.quotes-header .tools .btn-group a[tab="' + options.tab + '"]').addClass("active");
				}


				function appendSearchPagination() {
					var numberOfPages = Math.ceil(options.countAlternatingQuotes / pageLimit);
					var paginationArray = {"numberOfPages": numberOfPages, "pageLimit": pageLimit, "currentPage": options.page};
					if (options.search) {
						appendPagination(element.children(".content").children(".pagination"), "#!quotes/" + options.tab + "/" + options.search + "/:page", paginationArray);
					} else {
						appendPagination(element.children(".content").children(".pagination"), "#!quotes/" + options.tab + "/:page", paginationArray);
					}
				}

				function updateSearchInput() {
					if (self.options.search) {
						try {
							$('#search-quotes input[name="id-and-name"]').val(decodeURIComponent(self.options.search));
						} catch (err) {
							location.hash = "";
						}
					}

					if ($.trim($('#search-quotes input[name="id-and-name"]').val()) === "") {
						$("#search-quotes #clear-search").css('display', 'none');
					} else {
						$("#search-quotes #clear-search").css('display', 'block');
					}
				}

			},

			prepareAlternatingQuotesList: function(alternatingQuotes) {
				var self = this;
				var alternatingQuotesList = [];
				$.each(alternatingQuotes, function(index, alternatingQuote) {
					alternatingQuotesList.push(self.prepareAlternatingQuoteObject(alternatingQuote));
				})
				return alternatingQuotesList;
			},

			prepareAlternatingQuoteObject: function(alternatingQuote) {
				var alternatingQuoteObject = {};
				var self = this;

				if (alternatingQuote.alternatingQuotes.length === 1) {
					var singleQuote = alternatingQuote.alternatingQuotes[0];
					alternatingQuoteObject.idNumber = singleQuote.idNumber;
					alternatingQuoteObject.refNumber = singleQuote.refNumber;
					alternatingQuoteObject.minimalTotalAgreed = alternatingQuote.minimalTotalAgreed;
					alternatingQuoteObject.deadline = singleQuote.deadline;
					alternatingQuoteObject.status = singleQuote.status;
					alternatingQuoteObject.startDate = singleQuote.startDate;
					alternatingQuoteObject.autoAccept = singleQuote.autoAccept;
					alternatingQuoteObject.expiryDate = singleQuote.expiryDate;
					alternatingQuoteObject.status = singleQuote.status;
					alternatingQuoteObject.isSingleQuote = true;
					alternatingQuoteObject.name = singleQuote.name;
					alternatingQuoteObject.id = singleQuote.id;
					alternatingQuoteObject.office = singleQuote.office;
					alternatingQuoteObject.showFrom = false;
					alternatingQuoteObject.budgetCode = singleQuote.budgetCode;
					return alternatingQuoteObject;
				} else {
					alternatingQuoteObject.isSingleQuote = false;
					alternatingQuoteObject.name = getAlternatingQuoteName();
					alternatingQuoteObject.status = self.getAlternatingQuoteStatus(alternatingQuote);
					alternatingQuoteObject.id = alternatingQuote.alternatingQuotes[0].id;
					alternatingQuoteObject.minimalTotalAgreed = alternatingQuote.minimalTotalAgreed;
					alternatingQuoteObject.office = alternatingQuote.alternatingQuotes[0].office;

					if (alternatingQuoteObject.status === "ACCEPTED") {
						$.each(alternatingQuote.alternatingQuotes, function(index, quote) {
							if (quote.status === "ACCEPTED") {
								alternatingQuoteObject.minimalTotalAgreed = quote.totalAgreed;
								alternatingQuoteObject.showFrom = false;
							}
						});
					} else {
						alternatingQuoteObject.minimalTotalAgreed = alternatingQuote.minimalTotalAgreed;
						alternatingQuoteObject.showFrom = true;
					}

					return alternatingQuoteObject;
				}

				function getAlternatingQuoteName() {
					var name = '';
					$.each(alternatingQuote.alternatingQuotes, function(index, aQuote) {
						if (aQuote.name) {
							name += aQuote.name;
						} else {
							name += aQuote.idNumber;
						}
						if (index + 1 < alternatingQuote.alternatingQuotes.length) {
							name += ', ';
						}
					})
					return name;
				}
			},

			getAlternatingQuoteStatus: function(alternatingQuote) {
				var hasRejected = false;
				var hasPending = false;
				var hasSent = false;

				var status = "REJECTED";
				var continueLoopIfNotAccepted = true;

				$.each(alternatingQuote.alternatingQuotes, function(index, aQuote) {
						if (continueLoopIfNotAccepted) {
							if (aQuote.status === "ACCEPTED" || aQuote.status === "ACCEPTED_BY_CUSTOMER") {
								status = aQuote.status;
								continueLoopIfNotAccepted = false;
							} else {
								if (aQuote.status === "SENT") {
									hasSent = true;
								}
								if (aQuote.status === "PENDING" || aQuote.status === "REQUESTED") {
									hasPending = true;
								}

								if (aQuote.status === "REJECTED") {
									hasRejected = true;
								}
							}
						}
					}
				);
				if (continueLoopIfNotAccepted) {
					if (hasSent) {
						status = "SENT";
					} else if (hasPending) {
						status = "PENDING";
					}
				}

				return status;

			},

			showEmptyQuotesList: function(element, options) {
				var self = this;

				if (self.options.search || self.options.createdOn || self.options.expirationDate) {
					element.find(".quotes-list").html("templates/quotes/quotes_empty_search.ejs", {tab: options.tab});
					element.find(".counter span").removeAttr('data-localize');
				} else {
					element.find(".quotes-list").prepend("templates/quotes/quotes_empty_list.ejs", {tab: options.tab});
					element.find(".counter span").removeAttr('data-localize');
					element.find(".counter span").html(element.find(".counter span").html().replace("{0}", "<big>0</big>"));
				}

				element.find(".quotes-header .tools .btn-group a").removeClass("active");
				element.find('.quotes-header .tools .btn-group a[tab="' + options.tab + '"]').addClass("active");
			},
			".module-quote .tabs>ul li a click": function(element) {
				var quoteID = $.trim(element.parents(".module-quote").attr("quoteID2"));
				var quoteDiv = element.parents(".module-quote");
				var nthChild = element.parent().index() + 1;


				if (!($(element).parent().hasClass('active')) && !($(element).hasClass("quote-download"))) {
					$(element).addClass('loading');
				}

				if (element.attr("tab") == "files") {
					filesController.loadFilesTabInQuote(quoteID, quoteDiv, nthChild);
				}

				if (element.attr("tab") == "tasks") {

					tasksController.loadTasksInQuote(quoteID, quoteDiv, nthChild, false, false, quoteDiv.attr("quote-agreed"));
				}

				if (element.attr("tab") == "resources") {
					filesController.loadResourcesTabInQuote(quoteID, quoteDiv, nthChild);
				}

				if (element.attr("tab") == "summary") {
					quoteDiv.find(".tab-content .tab-pane").removeClass('active');
					quoteDiv.find(".tab-content .tab-pane:nth-child(" + nthChild + ")").addClass('active');
					quoteDiv.find('a.summary-tab-link').removeClass('loading');
				}

				quoteDiv.find('.tabs li').removeClass('active');
				quoteDiv.find('.tabs li:nth-child(' + nthChild + ')').addClass('active');
			},

			".btn-reject-all-quotes click": function(element) {
				if (!element.hasClass('disabled')) {
					element.addClass('disabled');
					element.addClass('loading');
					element.prepend('<i class="icon-loader-dark"></i>');

					element.parents('.single-quote-view.alternating-quote-view').find('.btn-reject-quote').addClass('disabled');
					var self = this;
					var firstQuoteID = $.trim(element.parents('.single-quote-view.alternating-quote-view').find('.quote-in-aq').first().attr("quote-id"));

					Quote.rejectAllQuotes(firstQuoteID, function(success) {
						changeStatusesToRejected();
						removeActionsButtons();

						self.showQuoteActionModal('templates/quotes/alternating-quotes/all-quotes-rejected-modal.ejs');

					}, function(error) {
						element.removeClass('disabled');
						element.removeClass('loading');
						element.find("i").remove();
						element.parents('.single-quote-view.alternating-quote-view').find('.btn-reject-quote').removeClass('disabled');
						errorHandle(error);
					});


					function changeStatusesToRejected() {
						$.each(element.parents(".single-quote-view.alternating-quote-view").find('.quote-in-aq'), function() {
							$(this).find('header aside').html('<span class="label label-quote-rejected last" data-localize="modules.quotes.status.rejected">Rejected</span>');
						});
					}

					function removeActionsButtons() {
						$.each(element.parents(".single-quote-view.alternating-quote-view").find('.quote-actions'), function() {
							$(this).remove();
						});
						element.remove();
					}
				}

			},

			".btn-accept-offer click": function(element) {

				if (!element.hasClass('disabled')) {

					disableActionButtons();

					var self = this;
					var quoteID = $.trim(element.parents(".module-quote").attr("quoteID2"));
					var quoteDiv = element.parents(".module-quote");

					Quote.acceptQuote(quoteID, function(success) {

							changeStatuses(quoteID);
							element.parents(".single-quote-view.alternating-quote-view").find('.offer-actions').remove();
							$.each(element.parents(".single-quote-view.alternating-quote-view").find(".quote-actions"), function() {
								$(this).remove();
							});

							self.options.list = false;
							self.showQuoteActionModal('templates/quotes/alternating-quotes/quote-accepted-modal.ejs');
						},
						function(error) {
							enableActionButtons();
							errorHandle(error);
						}
					)
				}

				function changeStatuses(quoteID) {

					$.each(element.parents(".single-quote-view.alternating-quote-view").find('.quote-in-aq'), function() {
						if ($(this).attr('quote-id') == quoteID) {
							$(this).find('header aside').html('<span class="label label-quote-accepted last" data-localize="modules.quotes.status.accepted">Accepted</span>');
						} else {
							$(this).find('header aside').html('<span class="label label-quote-rejected last" data-localize="modules.quotes.status.rejected">Rejected</span>');
						}
					});

					$(".module.section-header header aside").html('<span class="label label-quote-accepted last" data-localize="modules.quotes.status.accepted">Accepted</span>');

				}

				function disableActionButtons() {
					element.find('i').remove();
					element.prepend('<i class="icon-loader-green"></i>');
					element.addClass('loading');

					$.each(element.parents(".single-quote-view.alternating-quote-view").find(".quote-actions"), function() {
						$(this).find(".btn-accept-offer").addClass('disabled');
						$(this).find(".btn-reject-quote").addClass('disabled');
					});
					element.parents(".single-quote-view.alternating-quote-view").find('.btn-reject-all-quotes').addClass('disabled');
				}

				function enableActionButtons() {
					element.removeClass('loading');
					element.find("i").remove();
					element.prepend('<i class="icon-accept"></i>');

					element.parents(".single-quote-view.alternating-quote-view").find('.btn-reject-all-quotes').removeClass('disabled');
					$.each(element.parents(".single-quote-view.alternating-quote-view").find(".quote-actions"), function() {
						$(this).find(".btn-accept-offer").removeClass('disabled');
						$(this).find(".btn-reject-quote").removeClass('disabled');
					});
				}

			},
			".btn-reject-quote click": function(element) {
				if (!element.hasClass('disabled')) {


					var self = this;
					var quoteID = $.trim(element.parents(".module-quote").attr("quoteID2"));

					$.each(element.parents('.single-quote-view.alternating-quote-view .quote-in-aq["quote-id=' + quoteID + '"]').find(".btn-reject-quote"), function() {
						$(this).addClass('disabled');
					});

					element.addClass('loading');
					element.prepend('<i class="icon-loader-dark"></i>');

					Quote.rejectSingleQuote(quoteID, function(success) {
						changeStatusAndRemoveActionButtons(quoteID);
						self.showQuoteActionModal('templates/quotes/alternating-quotes/quote-rejected-modal.ejs');
					}, function(error) {
						$.each(element.parents('.single-quote-view.alternating-quote-view .quote-in-aq["quote-id=' + quoteID + '"]').find(".btn-reject-quote"), function() {
							$(this).removeClass('disabled');
						});
						element.find('i').remove();
						errorHandle(error);
					});

				}

				function changeStatusAndRemoveActionButtons(quoteID) {
					$.each(element.parents('.single-quote-view.alternating-quote-view .quote-in-aq["quote-id=' + quoteID + '"]'), function() {
						$(this).find(".quote-actions").remove();
						$(this).find('header aside').html('<span class="label label-quote-rejected last" data-localize="modules.quotes.status.rejected">Rejected</span>');
					});
				}

			},

			showQuoteActionModal: function(templateURL) {

				$('#myModal').remove();
				$("body").append(templateURL, {});
				$("#myModal .modal-close").click(function() {
					$("#myModal").modal('hide');
				});
				$('#myModal').on('hidden', function() {
					$('#myModal').remove();
					$(".modal-backdrop").remove();
				});
				$("#myModal").modal('show');
			},
			"#search-quotes submit": function() {
				if ($.trim($("#search-quotes").find('input[name="id-and-name"]').val()) !== '')
					location.hash = "quotes/" + this.options.tab + "/" + encodeURIComponent($("#search-quotes").find('input[name="id-and-name"]').val()) + "/1";
				else
					location.hash = "quotes/" + this.options.tab + "/1";
				return false;
			},
			"#search-quotes #clear-search click": function() {
				location.hash = "quotes/" + this.options.tab + "/1";
				this.options.search = null;
				$("#search-quotes").find('input[name="id-and-name"]').val('');
				return false;
			},
			".quotes-header #tab-active click": function() {
				if (this.options.search) {
					location.hash = "quotes/active/" + this.options.search + "/1";
				} else {
					location.hash = "quotes/active/1";
				}
				return false;
			},
			".quotes-header #tab-history click": function() {
				if (this.options.search) {
					location.hash = "quotes/history/" + this.options.search + "/1";
				} else {
					location.hash = "quotes/history/1";
				}
				return false;
			},


			".module-office click": function(element) {
				var quoteDiv = element.closest('.module-quote');
				var quoteID = $.trim(quoteDiv.attr('quoteid2'));

				var officesController = new Offices(element);

				if (!quoteID) {
					quoteDiv = element.closest('[quote-id]');
					quoteID = $.trim(quoteDiv.attr('quote-id'));
				}

				officesController.openChangeQuoteOfficeModal(quoteID);
			}


		})
		;

	})
;
