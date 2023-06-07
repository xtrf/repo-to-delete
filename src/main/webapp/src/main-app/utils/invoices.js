steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	'./offices.js',
	function($) {

		$.Model('Invoice', {
			findAll: function(params, success, error) {
				var queryString;
				params = typeof params === 'undefined' ? {} : params;
				queryString = queryBuilder(params);
				return $.ajax({
					url: baseURL + 'invoices' + addToURL + queryString,
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			count: function(params, success, error) {
				var queryString;

				params = typeof params === 'undefined' ? {} : params;

				queryString = queryBuilder(params);

				return $.ajax({
					url: baseURL + 'invoices/count' + addToURL.substr(5) + queryString,
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},

			updateOffice: function(id, office, success, error) {
				return $.ajax({
					url: baseURL + 'invoices/' + id + '/office' + addToURL.substr(5),
					type: 'PUT',
					contentType: 'application/json',
					dataType: 'json',
					xhrFields: { withCredentials: true},
					data: JSON.stringify(office),
					success: success,
					error: error
				});
			}

		}, {});


		$.Controller("Invoices", {
			init: function(element, options) {
				this.options.emptyCounter = 0;
				this.options.targetDiv = options.targetDiv;
				if (options.targetDiv.find('.invoices-list').length === 0) {
					options.targetDiv.html('templates/invoices/invoices_list_wrapper.ejs', {});
				}
				options.targetDiv.find('.invoices-list').html("templates/invoices/invoices_list.ejs", {});
				localizeAttribute('#search-invoices input[name="invoiceId"]', "placeholder", null);
				localizeAttribute('#search-invoices input[name="invoiceDate"]', "placeholder", null);


				if (options.tab !== 'archive') {
					this.showOverdueInvoices(element.find("#invoices-overdue-wrapper"), options);
				}

				this.showInvoices(element.find("#invoices-all-list-wrapper"), options);
			},
			"#search-invoices #clear-search click": function() {
				location.hash = "invoices/" + this.options.tab + "/1";
				this.options.search = null;
				$("#search-invoices").find('input[name="invoiceId"]').val('');
				return false;
			},
			"#search-invoices submit": function() {
                var searchIdAndNameInput = $("#search-invoices").find('input[name="invoiceId"]');
                var self = this;
                try {
                    self.options.lastSearch = decodeURIComponent(self.options.search);
                } catch (e) {
                    self.options.lastSearch = '';
                }
                if (searchPhraseNotChanged()) {
                    self.showInvoices(self.options.targetDiv.find('#invoices-all-list-wrapper'), self.options);
                } else {
                    if ($.trim(searchIdAndNameInput.val()) !== '') {
                        location.hash = "invoices/" + this.options.tab + "/" + encodeURIComponent(searchIdAndNameInput.val()) + "/1";
                    }
                    else {
                        location.hash = "invoices/" + this.options.tab + "/1";
                    }
                }
                return false;

                function searchPhraseNotChanged() {
                    return self.options.lastSearch == $.trim(searchIdAndNameInput.val());
                }

			},
			".module-invoices .clear-criteria click": function() {
				this.clearDatePicker('invoiceDate');
				$("#search-invoices").find('input[name="invoiceId"]').val('');
				if (this.options.search) {
					location.hash = 'invoices/' + this.options.tab + '/1';
				} else {
					this.init(this.options.targetDiv, this.options);
				}

			},
			clearDatePicker: function(datePickerName) {
				var targetPicker = $('input[name="' + datePickerName + '"]');
				this.options[datePickerName] = null;
				targetPicker.val('');
				targetPicker.data('daterangepicker').setStartDate('');
				targetPicker.data('daterangepicker').setEndDate('');
			},
			".clear-datepicker click": function(element) {
				var targetPickerName = element.data('target');
				this.clearDatePicker(targetPickerName);
				this.init(this.options.targetDiv, this.options);
			},
			'.invoices-header .tools a[tab="active"] click': function() {
				if (this.options.search) {
					location.hash = "invoices/active/" + this.options.search + "/1";
				} else {
					location.hash = "invoices/active/1";
				}
				return false;
			},
			'.invoices-header .tools a[tab="archive"] click': function() {
				if (this.options.search) {
					location.hash = "invoices/archive/" + this.options.search + "/1";
				} else {
					location.hash = "invoices/archive/1";
				}
				return false;
			},

			'.invoice-action-edit-office click': function(element) {
				element
					.hide()
					.closest('.module-invoice')
					.find('.dropdown-select2')
					.show();
			},

			'.invoice-action-change-office click': function(element) {
				var invoiceDiv = element.closest('.module-invoice');

				var office = {
					name: element.attr('data-office-name')
				};

				var invoice = {
					id: invoiceDiv.attr('data-invoice-id')
				};

				invoiceDiv
					.find('.dropdown-select2')
					.hide()
					.end()
					.find('.office-name')
					.text(office.name)
					.end()
					.find('.invoice-action-edit-office')
					.show();

				Invoice.updateOffice(invoice.id, office, $.noop, function(error) {
					errorHandle(error);
					location.hash = "#!";
					//$("body .overlay").remove();
					dontShowLoader();
				});
			},

			showEmptyList: function(add) {

				var self = this;
				if (isNaN(self.options.emptyCounter)) self.options.emptyCounter = 0;
				self.options.emptyCounter += add;
				self.options.tab = (add == 2) ? "archive" : "active";

				if (self.options.emptyCounter == 2) {

					if (self.options.search || self.options.invoiceDate) {
						self.options.targetDiv.find("#invoices-all-list-wrapper").html("templates/invoices/invoices_empty_search.ejs", {tab: self.options.tab});
					} else {
						self.options.targetDiv.find("#invoices-all-list-wrapper").html("templates/invoices/invoices_empty.ejs", {tab: self.options.tab});
						self.options.targetDiv.find(".counter span").removeAttr('data-localize');
						self.options.targetDiv.find(".counter span").html(self.options.targetDiv.find(".counter span").html().replace("{0}", "<big>0</big>"));
					}
				}
			},

			showOverdueInvoices: function(element, options) {
				var self = this;
				this.options = options;
				var overdueInvoicesOptions = {"view": "OVERDUE", "limit": 10000};
				if (options.search) {
					try {
						overdueInvoicesOptions.search = decodeURIComponent(options.search);
					} catch (err) {
						location.hash = "";
					}
				}

				$.when(
						Office.findAll(),
						Invoice.findAll(overdueInvoicesOptions)
					)
					.done(function(officesArgs, invoicesArgs) {
						offices = officesArgs[0];
						overdueInvoices = invoicesArgs[0];

						//$("body .overlay").remove();
						if (overdueInvoices.length > 0) {
							$.each(overdueInvoices, function(index, value) {
								//overdueInvoices[index].defaultDocument=baseURL+'invoices/'+value.id+'/document';
								overdueInvoices[index].downloadURL = baseURL + "invoices/" + overdueInvoices[index].id + "/document";
								if (overdueInvoices[index].documents.length > 1) overdueInvoices[index].dropdown = true; else overdueInvoices[index].dropdown = false;
								$.each(overdueInvoices[index].documents, function(index2, value2) {
									overdueInvoices[index].documents[index2].downloadURL = baseURL + "invoices/" + overdueInvoices[index].id + "/documents/" + overdueInvoices[index].documents[index2].id;
									if (value2.name.length > 50)
										overdueInvoices[index].documents[index2].name = value2.name.substr(0, 47) + "...";
								});
							});


							element.html("templates/invoices/invoices_overdue_list.ejs", {
								offices: offices,
								overdueInvoices: overdueInvoices
							});

							if (pdf_info.acrobat != null) {
								bindViewDownload($("td.invoice-download li"));
							}

						} else {
							self.showEmptyList(1);
						}
						dontShowLoader();
					})
					.fail(function(error) {
						errorHandle(error);
						location.hash = "#!";
						//$("body .overlay").remove();
						dontShowLoader();
					});
			},
			showInvoices: function(element, options) {
				doShowLoader();
				this.options.emptyCounter = 0;
				var self = this;
				this.options = options;
				var statusFromTab = "ALL";
				if (options.tab === "archive") {
					statusFromTab = "PAID";
				}
				if (options.tab === "active") {
					statusFromTab = "EARLY_UNPAID";
				}
				var pageLimit = historyPageLimit;
				var offset = pageLimit * (options.page - 1);

				var invoicesDatePickers = [
					{name: 'invoiceDate', from: 'invoiceDateFrom', to: 'invoiceDateTo'}
				];


				var invoicesOptions = {"view": statusFromTab, "start": offset, "limit": pageLimit};
				var invoicesCountOptions = {"view": statusFromTab};

				var datePickers = new DateRangePickerFactory(invoicesDatePickers, this, invoicesCountOptions, invoicesOptions, this.init);

				if (options.search) {
					try {
						invoicesCountOptions.search = decodeURIComponent(options.search);
						invoicesOptions.search = decodeURIComponent(options.search);
					} catch (err) {
						location.hash = "";
					}
				}

				datePickers.init();

				datePickers.initElements();

				$.when(
						Invoice.count(invoicesCountOptions),
						Office.findAll(),
						Invoice.findAll(invoicesOptions)
					)
					.done(function(invoiceCountArgs, officesArgs, invoicesArgs) {
						var offices = officesArgs[0];
						var invoices = invoicesArgs[0];
						options.invoicesCount = invoiceCountArgs[0];

						$("body").addClass('contacts').addClass('invoices');

						if (invoices.length > 0) {
							$.each(invoices, function(index, value) {
								invoices[index].downloadURL = baseURL + "invoices/" + invoices[index].id + "/document";
								if (invoices[index].documents.length > 1) {
									invoices[index].dropdown = true;
								} else {
									invoices[index].dropdown = false;
								}
								$.each(invoices[index].documents, function(index2, value2) {
									invoices[index].documents[index2].downloadURL = baseURL + "invoices/" + invoices[index].id + "/documents/" + invoices[index].documents[index2].id;
								});
							});

							element.html("templates/invoices/invoices_all_list.ejs", {
								invoices: invoices,
								offices: offices
							});

							if (pdf_info.acrobat != null) {
								bindViewDownload($("td.invoice-download li"));
							}

							var numberOfPages = Math.ceil(options.invoicesCount / pageLimit);
							var paginationArray = {"numberOfPages": numberOfPages, "pageLimit": pageLimit, "currentPage": options.page};
							if (options.search) {
								appendPagination(element.parent().find(".pagination"), "#!invoices/" + options.tab + "/" + options.search + "/:page", paginationArray);
							} else {
								appendPagination(element.parent().find(".pagination"), "#!invoices/" + options.tab + "/:page", paginationArray);
							}
						} else {
							options.tab === "archive" ? self.showEmptyList(2) : self.showEmptyList(1);
						}

						$(".invoices-header .tools .btn-group a").removeClass("active");
						$('.invoices-header .tools .btn-group a[tab="' + options.tab + '"]').addClass("active");
						if (self.options.search) {
							try {
								$('#search-invoices input[name="invoiceId"]').val(decodeURIComponent(self.options.search));
							} catch (err) {
								location.hash = "";
							}
						}

						if ($.trim($('#search-invoices input[name="invoiceId"]').val()) === "") {
							$("#search-invoices #clear-search").css('display', 'none');
						} else {
							$("#search-invoices #clear-search").css('display', 'block');
						}

						dontShowLoader();
					})
					.fail(function(error) {
						errorHandle(error);
						location.hash = "#!";
						//$("body .overlay").remove();

						dontShowLoader();
					});
			},
			".invoice-download a click": function(element) {
				if (element.hasClass('disabled')) return false;
			}

		});

	});