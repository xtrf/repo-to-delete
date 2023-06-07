var gridsterT = null;
var blockChart = false;
steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	'./projects.js',
	'./contacts.js',
	'./quotes.js',

	function($) {

		$.Model('Dashboard', {

			getFreeTextWidget: function(success, error) {
				return $.ajax({
					url: baseURL + "dashboard/landing-card" + addToURL,
					dataType: 'json',
					type: "GET",
					contentType: "application/json; charset=utf-8",
					xhrFields: { withCredentials: true},
					complete: function(e) {
						if (e.status === 200) {
							/*format: {title: 'title', content: 'htmlContent'}*/
							success($.parseJSON(e.responseText));
						}
						/*if error do nothing */
					}
				});
			}
		}, {});

		$.Controller("Dashboards", {
			init: function() {
				var self = this;
				self.options.defaultDashboardLoaded = false;
				self.options.loadedReportsError = false;
				this.options.IE8 = false;

				if ($.browser.msie && parseInt($.browser.version, 10) <= 8) {
					self.options.IE8 = true
				}

				this.options.loadedReports = {};
				self.options.dashLoaderString = '<div data-status="empty" class="module module-widget-new"><div class="overlay" style="bottom:128px; background:none;"><div class="loader"><img src="static/img/js_img/351.gif"></div></div></div>';
				self.options.dashLoaderStringInner = '<div class="overlay" style="bottom:128px; background:none;"><div class="loader"><img src="static/img/js_img/351.gif"></div></div>';
				self.options.defaultReportInstalled = null;
				self.options.defaultConfiguration = [
					{"col": "1", "row": "1", "size_y": "1", "size_x": "3", "widget": "report-first", "params": "0"},
					{"col": "4", "row": "1", "size_y": "1", "size_x": "3", "widget": "quotes-recent-3", "params": "0"},
					{"col": "5", "row": "2", "size_y": "1", "size_x": "2", "widget": "contact-2", "params": "0"},
					{"col": "3", "row": "2", "size_y": "1", "size_x": "2", "widget": "projects-statistics-2", "params": "0"},
					{"col": "1", "row": "2", "size_y": "1", "size_x": "2", "widget": "invoices-statistics-2", "params": "0"}
				];

				self.options.availableWidgets = {
					"quotes-recent-3": {group: "quotes", name: "Recent quotes", localize: "modules.dashboard.recent-quotes", filename: "quotes-3x1", "sizex": 3, "sizey": 1, "functionName": "recentQuotesWidget", "installed": 0, "params": "0", description: "test", rights: "quotes_browse"},
					"quotes-statistics-2": {group: "quotes", name: "Quotes statistics", localize: "modules.dashboard.quotes-statistics", filename: "quotes-3x1", "sizex": 2, "sizey": 1, "functionName": "quotesStatisticsWidget", "installed": 0, "params": "0", description: "", rights: "quotes_browse"},
					"projects-recent": {group: "projects", name: "Recent projects", localize: "modules.dashboard.recent-projects", filename: "quotes-3x1-2", "sizex": 3, "sizey": 1, "functionName": "recentProjectsWidget", "installed": 0, "params": "0", description: "", rights: 'projects_browse'},
					"projects-statistics-2": {group: "projects", name: "Projects statistics", localize: "modules.dashboard.projects-statistics", filename: "quotes-3x1-2", "sizex": 2, "sizey": 1, "functionName": "projectsStatisticsWidget", "installed": 0, "params": "0", description: "", rights: 'projects_browse'},
					"report-first": {group: "reports", name: "Default Report", localize: "modules.dashboard.default-report", filename: "test-4x1", "sizex": 3, "sizey": 1, "functionName": "reportsFirstWidget", "installed": 0, "params": "0", description: "", rights: "reports_browse"},
					"contact-2": {group: "other", name: "Contact", localize: "modules.dashboard.contact", filename: "quotes-2x1", "sizex": 2, "sizey": 1, "functionName": "contactWidget", "installed": 0, "params": "0", description: "", rights: ""},
					"customer-review": {group: "projects", name: "Awaiting reviews", localize: "modules.projects.awaiting-reviews", filename: "awaiting-reviews-3x1-2", "sizex": 3, "sizey": 1, "functionName": "customerReviewWidget", "installed": 0, "params": "0", description: "", rights: ''}
				};

				if (permissions.hasAccessToInvoices()) {
					self.options.availableWidgets["invoices-statistics-2"]= {group: "invoices", name: "Payment statistics", localize: "modules.dashboard.payment-statistics", filename: "quotes-3x1", "sizex": 2, "sizey": 1, "functionName": "invoicesStatisticsWidget", "installed": 0, "params": "0", description: "", rights: "invoices_browse"};
					self.options.availableWidgets["invoices-3"]= {group: "invoices", name: "Invoices", localize: "modules.dashboard.invoices", filename: "quotes-3x1", "sizex": 3, "sizey": 1, "functionName": "invoicesWidget", "installed": 0, "params": "0", description: "", rights: "invoices_browse"};
				}

				self.options.defaultReportTitle = 'Default report';
				self.options.widgetGroups = {};


				Report.findAll({"limit": 1000}, function(reports) {
					self.options.loadedReports = reports;
					$.each(reports, function(index, report) {
						if (report.chartType != null)
							self.options.availableWidgets['report-by-id-' + report.id] = {group: "reports", name: report.localizedName, localize: "modules.dashboard.report", filename: "test-4x1", "sizex": 3, "sizey": 1, "functionName": "reportByIdWidget", "installed": 0, "params": report.id, description: ""};
					});

					createGroupsFromWidgets();

					$.ajax({
						url: baseURL + 'dashboard/settings' + addToURL,
						type: "GET",
						dataType: 'json',
						xhrFields: { withCredentials: true},
						success: function(data) {
							self.initializeDashboard(data.configuration);
							dontShowLoader();
						},
						error: function(error) {
							errorHandle(error);
							dontShowLoader();
						}
					});


				}, function(error) {
					self.options.loadedReports = [];
					self.options.loadedReportsError = error;

					createGroupsFromWidgets();

					$.ajax({
						url: baseURL + 'dashboard/settings' + addToURL,
						type: "GET",
						dataType: 'json',
						xhrFields: { withCredentials: true},
						success: function(data) {
							self.initializeDashboard(data.configuration);
							dontShowLoader();

						},
						error: function(error) {
							errorHandle(error);
							dontShowLoader();

						}
					});
				});

				function createGroupsFromWidgets() {
					$.each(self.options.availableWidgets, function(index, widgetInfo) {
						if (!self.options.widgetGroups[widgetInfo.group]) {
							self.options.widgetGroups[widgetInfo.group] = {};
							self.options.widgetGroups[widgetInfo.group][index] = widgetInfo;
						} else {
							self.options.widgetGroups[widgetInfo.group][index] = widgetInfo;
						}
					});
				}

			},
			loadDefaultDashboard: function() {
				/*It's not used anywhere */
				var self = this;
				$.ajax({
					url: baseURL + 'dashboard/settings' + addToURL,
					type: "PUT",
					dataType: 'json',
					contentType: "application/json",
					data: JSON.stringify({"configuration": ""}),
					xhrFields: { withCredentials: true},
					success: function(data) {
						self.init();

					},
					error: function(error) {

					}
				});
			},

			serialize_dashboard: function() {
				var serializedG = [];
				var maxRow = 0;
				$.each($(".gridster > li"), function() {
					if ($(this).attr('data-widget') && $(this).attr('data-widget').length > 0)
						serializedG[serializedG.length] = {'col': $(this).attr('data-col'), 'row': $(this).attr('data-row'), 'size_y': $(this).attr('data-sizey'), 'size_x': $(this).attr('data-sizex'), 'widget': $(this).attr('data-widget'), 'params': $(this).attr('data-params')};
					if (parseInt($(this).attr('data-row')) > maxRow)
						maxRow = parseInt($(this).attr('data-row'));
				});
				var serialzedGFinal = [];
				for (i = 0; i <= maxRow; i++) {
					$.each(serializedG, function(index, value) {
						if (value.row == i)
							serialzedGFinal[serialzedGFinal.length] = value;
					})
				}

				return serialzedGFinal;
			},
			saveDashboard: function() {
				/*TODO: Error handle? */
				var self = this;
				$.ajax({
					url: baseURL + 'dashboard/settings' + addToURL,
					type: "PUT",
					dataType: 'json',
					contentType: "application/json",
					data: JSON.stringify({"configuration": JSON.stringify(self.serialize_dashboard())}),
					xhrFields: { withCredentials: true}
				});
			},

			initializeDashboard: function(gridsterData) {
				var self = this;
				var gridsterData;
				gridsterData = jQuery.parseJSON(gridsterData);

				if (gridsterData == null || gridsterData.length == 0) {
					gridsterData = this.options.defaultConfiguration;
					self.options.defaultDashboardLoaded = true;
				}


				self.activateGridster(gridsterData);
				setStaticDashboardIfWindowIsSmall();
				$(".gridster >li").fadeIn();


				$(window).unbind('resize');
				$(window).resize($.throttle(setVerticalModalMargin, 600));
				$(window).bind('resize', function() {
					if (location.hash == "#!") {
						resizeDashboard();
					}
				});

				setTimeout(function() {
					self.findEmptyPlaces();
				}, 1000);

				function resizeDashboard() {
					var myInterval = false;
					var $win = $(window);
					var dimensions = [ $win.width(), $win.height() ];
					doShowLoader();
					$('body > div[style|="position: absolute;"]').remove();
					$(".add-widget").remove();

					if ($win.width() <= 1024) {
						$(".gridster > li").removeClass('gs_w');
						$(".gridster > li").addClass('gs_static');
						$(".gridster > li").attr('style', "");
					}
					else {
						$(".gridster > li").addClass('gs_w');
						$(".gridster > li").removeClass('gs_static');
					}

					if (!myInterval) {
						myInterval = setInterval(function() {
							if (dimensions[ 0 ] === $win.width() && dimensions[ 1 ] === $win.height()) {
								clearInterval(myInterval);
								myInterval = false;
								setVerticalModalMargin();

								self.reloadGridster();

								dontShowLoader();

							}
							else {
								dimensions[ 0 ] = $win.width();
								dimensions[ 1 ] = $win.height();
							}
						}, 264);
					}
				}

				function setStaticDashboardIfWindowIsSmall() {
					if ($(window).width() <= 1024) {
						$("li.gs_w").removeClass('gs_w');
						$(".gridster > li").addClass('gs_static');
					}
				}

			},

			addFreeTextWidget: function() {

				Dashboard.getFreeTextWidget(function(data) {
					$("#main-container").prepend('<ul class="row-fluid landing-card-row"></ul>');
					$(".landing-card-row").html('templates/dashboard/landing_card.ejs', {title: data.title});
					$(".landing-card-row section.content").html(data.content);
				}, function() {
					//handle error?
				});

			},

			activateGridster: function(data) {

				var self = this;
				$("#main-container").addClass('container').addClass('dashboard-container').addClass('ready');
				$("#main-container").html("");
				$("body").removeClass();

				if ($("#main-header .container").find('.btn-add-widget').length == 0 && self.options.IE8 == false) {
					$("#main-header .container").append('<a class="widget-add btn-add-widget" data-pre-col="0" data-pre-row="0" data-widget-size="0"><i class="icon icon-widget-add"></i> <span data-localize="modules.dashboard.add-widget">Add widget</span></a>');
					$("#main-header .container .btn-add-widget").fadeIn(500);
				}

				$("#main-container .row-fluid").remove();

				self.addFreeTextWidget();

				$("#main-container").append('<ul class="row-fluid gridster"></ul>');

				if ($("head style").length > 1)
					$("head style:last-child").remove();

				//delete gridster;


				$.each(data, function(index, value) {
					$(".gridster").append('<li style="display:none;" data-row="' + value.row + '" data-col="' + value.col + '" data-sizex="' + value.size_x + '" data-sizey="' + value.size_y + '" data-widget="' + value.widget + '" data-params="' + value.params + '"></li>');
					$.each(self.options.availableWidgets, function(index2, value2) {
						if (index2 == value.widget) {
							value2.installed = 1;
						}
					})


				});


				$.each($(".gridster > li"), function() {
					if ($(this) !== undefined && $(this).attr('data-widget') !== "undefined") {

						if (self.options.availableWidgets[$(this).attr('data-widget')] != undefined) {
							self.widgetFunction = self[self.options.availableWidgets[$(this).attr('data-widget')].functionName];
							self.widgetFunction($(this).attr('data-widget'), $(this), $(this).attr('data-params'));
						} else {
							$(this).html('templates/dashboard/widget_undefined.ejs', {'localizeHeader': 'modules.dashboard.undefined'});

							$('li.new').removeClass('new');
						}
					}


				});


				var margin_x = 10;
				var width_x = Math.round(($("#main-container").width() - 10 * margin_x) / 6);


				gridsterT = $(".gridster").gridster({
					widget_margins: [margin_x, 10],
					widget_base_dimensions: [width_x, 305],
					min_cols: 6,


					draggable: {
						stop: function(event, ui) {
							$(".gs_w").not(this).css("opacity", "1");
							self.findEmptyPlaces();
							$("li.gs_w div.module").removeClass('active');
							setTimeout(function() {
								$("li.gs_w").find('a').unbind("click.prevent");
							}, 300)

							setTimeout(function() {
								self.saveDashboard();
							}, 500);


						},
						start: function(event, ui) {
							$(".gs_w").not('.dragging').css("opacity", "0.5");
							ui.helper.find('a').bind("click.prevent", function(event) {
								event.preventDefault();
							});
							$("li.add-widget").remove();
							ui.helper.find('div.module').addClass('active');

						}
					}
				}).data('gridster');

				if (self.options.IE8 == true) {
					gridsterT.disable();
				}

				$.proxy(gridsterT.recalculate_faux_grid, gridsterT);
				this.saveDashboard();
			},


			quotesStatisticsWidget: function() {
				var parentArguments = arguments;

				var rightsName = this.options.availableWidgets[parentArguments[0]].rights;
				if (permissionsTable[rightsName] == 0 && this.options.defaultDashboardLoaded) {

					parentArguments[1].remove();
					this.options.availableWidgets[parentArguments[0]].installed = 0;

				} else {

					var self = this;
					var localizedHeader = this.options.availableWidgets[parentArguments[0]].localize;
					var widgetName = this.options.availableWidgets[parentArguments[0]].name;
					parentArguments[1].html(this.options.dashLoaderString);

					Quote.countAlternatingQuotes({"status": "REQUESTED|PENDING|SENT"}, function(countQuotesActive) {
						Quote.countAlternatingQuotes({"status": "SENT"}, function(countQuotesWaiting) {
							if (countQuotesWaiting == 0 && countQuotesActive == 0) {
								parentArguments[1].html("templates/dashboard/widget_quotes_empty.ejs", {"localizeHeader": localizedHeader, countQuotesActive: countQuotesActive, countQuotesWaiting: countQuotesWaiting});
								parentArguments[1].find(".active-counter p").removeAttr('data-localize');
								parentArguments[1].find(".active-counter p").html(parentArguments[1].find(".active-counter p").html().replace("{0}", "</p><h3>0</h3><p>"));


							}
							else {
								parentArguments[1].html("templates/dashboard/alternating-quotes/widget-alternating-quotes-statistics.ejs", {"localizeHeader": localizedHeader, countQuotesActive: countQuotesActive, countQuotesWaiting: countQuotesWaiting});

								var contentArray = parentArguments[1].find(".waiting-quotes span").html().split('{0}');
								parentArguments[1].find(".waiting-quotes span").removeAttr('data-localize');
								if (contentArray.length > 1 && $.trim(contentArray[0]) == "" && contentArray[1] && $.trim(contentArray[1]) != "") {
									parentArguments[1].find(".waiting-quotes span").html('<h3><a href="#!quotes/active/1">' + countQuotesWaiting + '</a></h3><br><p>' + contentArray[1] + '</p>');
								} else {
									parentArguments[1].find(".waiting-quotes span").html('<h3><a href="#!quotes/active/1">' + countQuotesWaiting + '</a></h3><br><p data-localize="modules.dashboard.quotes-waiting">quotes waiting for your approval</p>');
								}

								contentArray = parentArguments[1].find(".active-quotes span").html().split('{0}');
								parentArguments[1].find(".active-quotes span").removeAttr('data-localize');
								if (contentArray.length > 1 && $.trim(contentArray[0]) == "" && contentArray[1] && $.trim(contentArray[1]) != "") {
									parentArguments[1].find(".active-quotes span").html('<h3><a href="#!quotes/active/1">' + countQuotesActive + '</a></h3><br><p>' + contentArray[1] + '</p>');
								} else {
									parentArguments[1].find(".active-quotes span").html('<h3><a href="#!quotes/active/1">' + countQuotesActive + '</a></h3><br><p data-localize="modules.dashboard.active-quotes">active quotes</p>');
								}

							}
							parentArguments[1].removeClass('new'); //konieczne


						}, function(error) {
							dashboardErrorHandle(error);
							if (error.status == 403)
								parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader});
							else
								parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader});
							parentArguments[1].removeClass('new'); //konieczne


						});
					}, function(error) {
						dashboardErrorHandle(error);
						if (error.status == 403)
							parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader});
						else
							parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader});
						parentArguments[1].removeClass('new'); //konieczne


					});
				}
			},
			projectsStatisticsWidget: function() {
				var parentArguments = arguments;

				var rightsName = this.options.availableWidgets[parentArguments[0]].rights;
				if (permissionsTable[rightsName] == 0 && this.options.defaultDashboardLoaded) {
					parentArguments[1].remove();
					this.options.availableWidgets[parentArguments[0]].installed = 0;
				} else {

					var self = this;
					var localizedHeader = this.options.availableWidgets[parentArguments[0]].localize;
					var widgetName = this.options.availableWidgets[parentArguments[0]].name;
					parentArguments[1].html(this.options.dashLoaderString);

					Project.count({"status": "OPENED"}, function(countProjectsOpened) {
						Project.count({"status": "CLOSED"}, function(countProjectsClosed) {
							if (countProjectsOpened == 0 && countProjectsClosed == 0) {
								parentArguments[1].html("templates/dashboard/widget_projects_empty.ejs", {"localizeHeader": localizedHeader, countProjectsOpened: countProjectsOpened, countProjectsClosed: countProjectsClosed});
								parentArguments[1].find(".active-counter p").removeAttr('data-localize');
								parentArguments[1].find(".active-counter p").html(parentArguments[1].find(".active-counter p").html().replace("{0}", "</p><h3>0</h3><p>"));
							}
							else {
								parentArguments[1].html("templates/dashboard/widget_projects_statistics.ejs", {"localizeHeader": localizedHeader, countProjectsOpened: countProjectsOpened, countProjectsClosed: countProjectsClosed});


								var contentArray = parentArguments[1].find(".waiting-quotes span").html().split('{0}');
								parentArguments[1].find(".waiting-quotes span").removeAttr('data-localize');
								if (contentArray.length > 1 && $.trim(contentArray[0]) == "" && contentArray[1] && $.trim(contentArray[1]) != "") {
									parentArguments[1].find(".waiting-quotes span").html('<h3><a href="#!projects/active/1">' + countProjectsOpened + '</a></h3><br><p>' + contentArray[1] + '</p>');
								} else {
									parentArguments[1].find(".waiting-quotes span").html('<h3><a href="#!projects/active/1">' + countProjectsOpened + '</a></h3><br><p data-localize="modules.dashboard.opened-projects">opened projects</p>');
								}

								contentArray = parentArguments[1].find(".active-quotes span").html().split('{0}');
								parentArguments[1].find(".active-quotes span").removeAttr('data-localize');
								if (contentArray.length > 1 && $.trim(contentArray[0]) == "" && contentArray[1] && $.trim(contentArray[1]) != "") {
									parentArguments[1].find(".active-quotes span").html('<h3><a href="#!projects/history/1">' + countProjectsClosed + '</a></h3><br><p>' + contentArray[1] + '</p>');
								} else {
									parentArguments[1].find(".active-quotes span").html('<h3><a href="#!projects/history/1">' + countProjectsClosed + '</a></h3><br><p data-localize="modules.dashboard.closed-projects">closed invoices</p>');
								}


							}

							parentArguments[1].removeClass('new'); //konieczne


						}, function(error) {
							dashboardErrorHandle(error);
							if (error.status == 403)
								parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader});
							else
								parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader});
							parentArguments[1].removeClass('new'); //konieczne


						});
					}, function(error) {
						dashboardErrorHandle(error);
						if (error.status == 403)
							parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader});
						else
							parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader});
						parentArguments[1].removeClass('new'); //konieczne


					});
				}
			},


			invoicesStatisticsWidget: function() {
				var parentArguments = arguments;

				var rightsName = this.options.availableWidgets[parentArguments[0]].rights;
				if (permissionsTable[rightsName] == 0 && this.options.defaultDashboardLoaded) {
					parentArguments[1].remove();
					this.options.availableWidgets[parentArguments[0]].installed = 0;
				} else {

					var self = this;
					var localizedHeader = this.options.availableWidgets[parentArguments[0]].localize;
					var widgetName = this.options.availableWidgets[parentArguments[0]].name;
					parentArguments[1].html(this.options.dashLoaderString);

					Invoice.count({"view": "OVERDUE"}, function(countInvoicesOverdue) {
						Invoice.count({"view": "EARLY_UNPAID"}, function(countInvoices) {
							parentArguments[1].html("templates/dashboard/widget_invoices_statistics.ejs", {"localizeHeader": localizedHeader, countInvoicesOverdue: countInvoicesOverdue, countInvoices: countInvoices});
							parentArguments[1].removeClass('new'); //konieczne


							var contentArray = parentArguments[1].find(".available-invoices span").html().split('{0}');
							parentArguments[1].find(".available-invoices span").removeAttr('data-localize');
							if (contentArray.length > 1 && $.trim(contentArray[0]) == "" && contentArray[1] && $.trim(contentArray[1]) != "") {
								parentArguments[1].find(".available-invoices span").html('<h3><a href="#!invoices/active/1">' + (countInvoicesOverdue + countInvoices) + '</a></h3><br><p>' + contentArray[1] + '</p>');
							} else {
								parentArguments[1].find(".available-invoices span").html('<h3><a href="#!invoices/active/1">' + (countInvoicesOverdue + countInvoices) + '</a></h3><br><p data-localize="modules.dashboard.invoices-available">invoices available</p>');
							}

							contentArray = parentArguments[1].find(".overdue-invoices span").html().split('{0}');
							parentArguments[1].find(".overdue-invoices span").removeAttr('data-localize');
							if (contentArray.length > 1 && $.trim(contentArray[0]) == "" && contentArray[1] && $.trim(contentArray[1]) != "") {
								parentArguments[1].find(".overdue-invoices span").html('<h3><a href="#!invoices/active/1">' + countInvoicesOverdue + '</a></h3><br><p>' + contentArray[1] + '</p>');
							} else {
								parentArguments[1].find(".overdue-invoices span").html('<h3><a href="#!invoices/active/1">' + countInvoicesOverdue + '</a></h3><br><p data-localize="modules.dashboard.overdue-invoices">overdue invoices</p>');
							}


						}, function(error) {
							dashboardErrorHandle(error);
							if (error.status == 403)
								parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader});
							else
								parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader});
							parentArguments[1].removeClass('new'); //konieczne


						});
					}, function(error) {
						dashboardErrorHandle(error);
						if (error.status == 403)
							parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader});
						else
							parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader});
						parentArguments[1].removeClass('new'); //konieczne


					});
				}
			},

			invoicesWidget: function() {
				var parentArguments = arguments;

				var rightsName = this.options.availableWidgets[parentArguments[0]].rights;
				if (permissionsTable[rightsName] == 0 && this.options.defaultDashboardLoaded) {
					parentArguments[1].remove();
					this.options.availableWidgets[parentArguments[0]].installed = 0;
				} else {

					var self = this;
					var localizedHeader = this.options.availableWidgets[parentArguments[0]].localize;
					var widgetName = this.options.availableWidgets[parentArguments[0]].name;
					parentArguments[1].html(this.options.dashLoaderString);

					Invoice.findAll({"view": "OVERDUE,EARLY_UNPAID", "limit": 6}, function(invoices) {
						if (invoices.length == 0) {
							parentArguments[1].html("templates/dashboard/widget_invoices_empty.ejs", {"localizeHeader": localizedHeader});
							parentArguments[1].find(".active-counter p").removeAttr('data-localize');
							parentArguments[1].find(".active-counter p").html(parentArguments[1].find(".active-counter p").html().replace("{0}", "</p><h3>0</h3><p>"));

						} else {
							parentArguments[1].html("templates/dashboard/widget_invoices.ejs", {"localizeHeader": localizedHeader, invoices: invoices});
							parentArguments[1].removeClass('new'); //konieczne
							bindViewDownload($(".entity-list.invoices li"));

						}
					}, function(error) {
						dashboardErrorHandle(error);
						if (error.status == 403)
							parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader});
						else
							parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader});
						parentArguments[1].removeClass('new'); //konieczne


					});
				}
			},


			recentQuotesWidget: function() {
				var parentArguments = arguments;

				var rightsName = this.options.availableWidgets[parentArguments[0]].rights;
				if (permissionsTable[rightsName] == 0 && this.options.defaultDashboardLoaded) {
					parentArguments[1].remove();
					this.options.availableWidgets[parentArguments[0]].installed = 0;
				} else {

					var self = this;
					var localizedHeader = this.options.availableWidgets[parentArguments[0]].localize;
					var widgetName = this.options.availableWidgets[parentArguments[0]].name;
					parentArguments[1].html(this.options.dashLoaderString);
					Quote.findAllAlternatingQuotes({"status": "REQUESTED|PENDING|SENT", "start": 0, "limit": 6}, function(alternatingQuotes) {

						if (alternatingQuotes.length == 0) {
							parentArguments[1].html("templates/dashboard/widget_quotes_empty.ejs", {"localizeHeader": localizedHeader, "quotes": quotes, "empty": true});
							parentArguments[1].find(".active-counter p").removeAttr('data-localize');
							parentArguments[1].find(".active-counter p").html(parentArguments[1].find(".active-counter p").html().replace("{0}", "</p><h3>0</h3><p>"));


						} else {


							if (quotes == null) {
								quotes = new Quotes($("body"));
							}

							var alternatingQuotesList = quotes.prepareAlternatingQuotesList(alternatingQuotes);


							parentArguments[1].html("templates/dashboard/alternating-quotes/widget-alternating-quotes-recent.ejs", {"localizeHeader": localizedHeader, "alternatingQuotes": alternatingQuotesList, "empty": false});
							localizeAttribute(".module-quotes .content ul li .preview-link", "title", null);
							parentArguments[1].find("[rel=tooltip-dash]").tooltip({placement: 'bottom'});

							if (permissionsTable['quote_view'] == 0) {
								localizeAttribute(".module-quotes .content ul li .preview-link", "title", null);

							}
						}

						parentArguments[1].removeClass('new');
						if (permissionsTable['request_quote'] == 0) {
							$(".raq").addClass('disabled');
						}
						$("#dashboard-3 .overlay").remove();

					}, function(error) {

						dashboardErrorHandle(error);
						if (error.status == 403)
							parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader});
						else
							parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader});
						parentArguments[1].removeClass('new'); //konieczne

					});

				}
			},

			recentProjectsWidget: function() {

				var parentArguments = arguments;
				var rightsName = this.options.availableWidgets[parentArguments[0]].rights;
				if (permissionsTable[rightsName] == 0 && this.options.defaultDashboardLoaded) {
					parentArguments[1].remove();
					this.options.availableWidgets[parentArguments[0]].installed = 0;
				} else {

					var self = this;
					var localizedHeader = this.options.availableWidgets[parentArguments[0]].localize;
					var widgetName = this.options.availableWidgets[parentArguments[0]].name;

					parentArguments[1].html(this.options.dashLoaderString);

					Project.findAll({"status": "OPENED", "start": 0, "limit": 6}, function(projects) {
						if (projects.length == 0) {
							//$("#dashboard-4 .module").addClass('module-empty');
							parentArguments[1].html("templates/dashboard/widget_projects_empty.ejs", {"localizeHeader": localizedHeader, "projects": projects, "empty": true});
							parentArguments[1].find(".active-counter p").removeAttr('data-localize');
							parentArguments[1].find(".active-counter p").html(parentArguments[1].find(".active-counter p").html().replace("{0}", "</p><h3>0</h3><p>"));

						}
						else {
							parentArguments[1].html("templates/dashboard/widget_projects_recent.ejs", {"localizeHeader": localizedHeader, "projects": projects, "empty": false});
							localizeAttribute(".module-projects .content ul li .preview-link", "title", null);
							parentArguments[1].find("[rel=tooltip-dash]").tooltip({placement: 'bottom'});


						}
						if (permissionsTable['request_quote'] == 0) {
							$(".rap").addClass('disabled');
						}

						parentArguments[1].removeClass('new'); //konieczne
					}, function(error) {

						if (error.status == 403)
							parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader});
						else
							parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader});
						dashboardErrorHandle(error);
						parentArguments[1].removeClass('new'); //konieczne
					});
				}

			},

			contactWidget: function() {
				var parentArguments = arguments;
				var self = this;
				var localizedHeader = this.options.availableWidgets[parentArguments[0]].localize;
				var widgetName = this.options.availableWidgets[parentArguments[0]].name;

				if (contacts != null) {
					contacts.init($("body"), {inSingle: true});
				} else {
					contacts = new Contacts($("body"), {inSingle: true});
				}

				parentArguments[1].append(this.options.dashLoaderString);

				ContactModel.salesData(function(salesData) {
					salesData.pmResponsible.avatar = baseURL + 'users/' + salesData.pmResponsible.id + '/image?width=63&height=63&crop=true';
					salesData.salesPerson.avatar = baseURL + 'users/' + salesData.salesPerson.id + '/image?width=63&height=63&crop=true';

					parentArguments[1].html("templates/dashboard/widget_contact.ejs", $.extend(salesData, {"localizeHeader": localizedHeader}));
					parentArguments[1].removeClass('new'); //konieczne


				}, function(error) {
					if (error.status == 403)
						parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader});
					else
						parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader});
					dashboardErrorHandle(error);
					parentArguments[1].removeClass('new'); //konieczne
				});
			},

			customerReviewWidget: function() {
				var parentArguments = arguments;
				var localizedHeader = this.options.availableWidgets[parentArguments[0]].localize;
				var self = this;
				Task.getProjectsPendingReviews(function(projects) {

					if (projects.length != 0) {
						$.each(projects, function(i, project) {
							$.each(project.tasksForReview, function(j, task) {
								$.each(task.filesForReview, function(k, file) {
									file.downloadURL = baseURL + "projects/files/" + file.id;
									if (typeof file.fileUrl !== "undefined") {
										file.onlineReview = true;
									} else {
										file.onlineReview = false;
									}
								});
							});
						});

						parentArguments[1].html("templates/dashboard/widget_customer_review.ejs", {"projects": projects});
						if (!$("html").hasClass("lt-ie9")) {
							$(".content-scrollable").jScrollPane({
								overlayScrollbar: true
							});

						}

						$.each($(".review-localize"), function() {
							var htmlToReplace = $(this).html().replace("{0}", $(this).data('number-of-reviews'));
							$(this).removeAttr("data-localize");
							$(this).html(htmlToReplace);
						});


						$.each($(".task-id-number"), function() {
							var htmlToReplace = $(this).html().replace("{id}", $(this).data('task-id'));
							$(this).removeAttr("data-localize");
							$(this).html(htmlToReplace);
						});


					} else {
						parentArguments[1].html("templates/dashboard/widget_customer_review_empty.ejs", {});
						parentArguments[1].find(".active-counter p").removeAttr('data-localize');
						parentArguments[1].find(".active-counter p").html(parentArguments[1].find(".active-counter p").html().replace("{0}", "</p><h3>0</h3><p>"));
					}
					parentArguments[1].removeClass('new'); //konieczne
				}, function(error) {

					parentArguments[1].removeClass('new'); //konieczne
					//TODO error handling
				});
			},


			reportsFirstWidget: function() {

				var parentArguments = arguments;

				var rightsName = this.options.availableWidgets[parentArguments[0]].rights;
				if (permissionsTable[rightsName] == 0 && this.options.defaultDashboardLoaded) {
					parentArguments[1].remove();
					this.options.availableWidgets[parentArguments[0]].installed = 0;
				} else {

					var self = this;
					self.options.defaultReportTitle = "Default report";

					var localizedHeader = this.options.availableWidgets[parentArguments[0]].localize;
					var widgetName = this.options.availableWidgets[parentArguments[0]].name;

					parentArguments[1].html(this.options.dashLoaderString);

					if (self.options.loadedReportsError != false || self.options.loadedReports.length == 0) {

						if (self.options.loadedReportsError.status == 403) {
							parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader, "widgetName": widgetName});
						}
						else
							parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader, "widgetName": widgetName});
						dashboardErrorHandle(self.options.loadedReportsError);

					} else {


						var reports = self.options.loadedReports;


						var i = 0;
						for (i = 0; i < reports.length; i++) {
							if (reports[i].chartType != null) break;

						}
						if (i >= reports.length) i = 0;


						if (reports.length == 0) {

							parentArguments[1].html("templates/dashboard/widget_report_noreports.ejs", {"reportID": reports[i].id, "widgetName": widgetName, "localizeHeader": localizedHeader, "reports": null});

						} else {

							widgetName = reports[i].localizedName;
							self.options.defaultReportTitle = widgetName;
							parentArguments[1].html("templates/dashboard/widget_report.ejs", {"reportID": reports[i].id, "widgetName": widgetName, "localizeHeader": "-", "reports": reports});
							parentArguments[1].find(".content").width(parentArguments[1].width());
							parentArguments[1].find(".content").height(parentArguments[1].height() - 52);
							parentArguments[1].find('.content').html(self.options.dashLoaderStringInner);
							self.options.defaultReportInstalled = reports[i].id;
							Report.getChart(reports[i].id, '', function(reportChart) {
								if (reportChart == null || typeof reportChart.script == 'undefined' || reportChart.script == null || (location.hash != "#" && location.hash != "#!")) {
									if (typeof reports[i] !== undefined && typeof reports[i].localizedName !== undefined && reports[i].localizedName != null)
										widgetName = reports[i].localizedName;
									parentArguments[1].html('templates/dashboard/widget_report_emptychart.ejs', {"widgetName": widgetName, "localizeHeader": localizedHeader});
									parentArguments[1].removeClass('new');
								} else {
									var newID = parentArguments[0] + new Date().getTime();
									parentArguments[1].find(".content").attr('id', newID);

									parentArguments[1].find(".content").width(parentArguments[1].width());
									parentArguments[1].find(".content").height(parentArguments[1].height() - 51);
									parentArguments[1].removeClass('new'); //konieczne
									if (parentArguments[1].find(".content").length > 0)
										self.parseJS(reportChart.script, parentArguments[1].find(".content").width(), parentArguments[1].find(".content").height(), newID, function() {


											blockChart = false;
											if ($('#' + newID + ' .overlay').length > 0) {
												$('#' + newID).parents('li').html("templates/dashboard/widget_report_refresh.ejs", {"widgetName": widgetName, "localizeHeader": localizedHeader});
											}
										}, function() {
											blockChart = false;
											parentArguments[1].html("templates/dashboard/widget_report_error.ejs", {"widgetName": widgetName, "localizeHeader": localizedHeader});
											parentArguments[1].removeClass('new');
										});
								}
							}, function(error) {
								if (error.status == 403)
									parentArguments[1].html("templates/dashboard/widget_403.ejs", {"widgetName": widgetName, "localizeHeader": localizedHeader});
								else
									parentArguments[1].html("templates/dashboard/widget_report_error.ejs", {"widgetName": widgetName, "localizeHeader": localizedHeader});
								dashboardErrorHandle(error);
								parentArguments[1].removeClass('new');
							});

						}

					}

				}

			},


			reportByIdWidget: function() {
				var parentArguments = arguments;

				var rightsName = this.options.availableWidgets[parentArguments[0]].rights;
				if (permissionsTable[rightsName] == 0 && this.options.defaultDashboardLoaded) {
					parentArguments[1].remove();
					this.options.availableWidgets[parentArguments[0]].installed = 0;
				} else {

					var self = this;
					var localizedHeader = this.options.availableWidgets[parentArguments[0]].localize;
					var widgetName = this.options.availableWidgets[parentArguments[0]].name;

					parentArguments[1].html(this.options.dashLoaderString);


					if (self.options.loadedReportsError != false || self.options.loadedReports.length == 0) {

						if (self.options.loadedReportsError.status == 403)
							parentArguments[1].html("templates/dashboard/widget_403.ejs", {"localizeHeader": localizedHeader, "widgetName": widgetName});
						else
							parentArguments[1].html("templates/dashboard/widget_error.ejs", {"localizeHeader": localizedHeader, "widgetName": widgetName});
						dashboardErrorHandle(self.options.loadedReportsError);

					} else {

						var reports = self.options.loadedReports;

						var i = 0;
						for (i = 0; i < reports.length; i++) {
							if (reports[i].id == parentArguments[2])
								break;


						}


						if (i >= reports.length || reports.length == 0) {

							parentArguments[1].html("templates/dashboard/widget_report_missing.ejs", {"widgetName": widgetName, "localizeHeader": localizedHeader, "reports": null});

						} else {

							parentArguments[1].html("templates/dashboard/widget_report.ejs", {"reportID": reports[i].id, "widgetName": widgetName, "localizeHeader": localizedHeader, "reports": reports});
							//parentArguments[1].find('.report-name-span').append(': '+reports[i].localizedName);

							parentArguments[1].find(".content").width(parentArguments[1].width());
							parentArguments[1].find(".content").height(parentArguments[1].height() - 51);

							parentArguments[1].find('.content').html(self.options.dashLoaderStringInner);

							Report.getChart(reports[i].id, '', function(reportChart) {


								//$("#report-chosen>span").html((reports[i].name.length>40 ? (reports[i].name.substr(0, 37)+"...") : reports[i].name)).removeAttr("data-localize");


								if (reportChart == null || reportChart.script == undefined || reportChart.script == null || (location.hash != "#" && location.hash != "#!")) {

									parentArguments[1].html('templates/dashboard/widget_report_emptychart.ejs', {"reportID": reports[i].id, "widgetName": widgetName, "localizeHeader": localizedHeader});
									parentArguments[1].removeClass('new');

								} else {
									var newID = parentArguments[0] + new Date().getTime();
									//arguments[1].find(".content").width(arguments[1].width());
									parentArguments[1].find(".content").attr('id', newID);

									parentArguments[1].find(".content").width(parentArguments[1].width());
									parentArguments[1].find(".content").height(parentArguments[1].height() - 52);
									parentArguments[1].removeClass('new'); //konieczne

									if (parentArguments[1].find(".content").length > 0) {

										self.parseJS(reportChart.script, parentArguments[1].find(".content").width(), parentArguments[1].find(".content").height(), newID, function() {
											blockChart = false;
											if ($('#' + newID + ' .overlay').length > 0) {
												$('#' + newID).parents('li').html("templates/dashboard/widget_report_refresh.ejs", {"widgetName": widgetName, "localizeHeader": localizedHeader});
											}
										}, function() {
											blockChart = false;
											parentArguments[1].html("templates/dashboard/widget_report_error.ejs", {"widgetName": widgetName, "localizeHeader": localizedHeader});
											parentArguments[1].removeClass('new');
										});
									} else {

									}
								}


							}, function(error) {
								if (error.status == 403)
									parentArguments[1].html("templates/dashboard/widget_403.ejs", {"widgetName": widgetName, "localizeHeader": localizedHeader});
								else
									parentArguments[1].html("templates/dashboard/widget_report_error.ejs", {"widgetName": widgetName, "localizeHeader": localizedHeader});
								dashboardErrorHandle(error);
								parentArguments[1].removeClass('new');


							});

						}


					}
				}

			},


			reloadGridster: function() {
				var self = this;
				//resizeCounter++;

				$('.gridster li[data-widget|="report"]').html(this.options.dashLoaderString);


				setTimeout(function() {

					if ($("head style").length > 0) {

						$("head style:last-child").remove();
					}


					gridsterT.serialize();

					var margin_x = 10;
					var width_x = Math.round(($("#main-container").width() - 10 * margin_x) / 6);

					gridsterT.options = $.extend(true, gridsterT.options, {widget_margins: [margin_x, 10], widget_base_dimensions: [width_x, 305]});

					gridsterT.wrapper_width = $("#main-container").width();


					gridsterT.min_widget_width = (gridsterT.options.widget_margins[0] * 2) +
						gridsterT.options.widget_base_dimensions[0];
					gridsterT.min_widget_height = (gridsterT.options.widget_margins[1] * 2) +
						gridsterT.options.widget_base_dimensions[1];
					//gridsterT.init();

					gridsterT.generate_grid_and_stylesheet();
					gridsterT.get_widgets_from_DOM();
					gridsterT.set_dom_grid_height();
					gridsterT.$wrapper.addClass('ready');
					gridsterT.draggable();


					//gridsterT.generate_grid_and_stylesheet();
					$.proxy(gridsterT.recalculate_faux_grid, gridsterT);


					self.findEmptyPlaces();

					$.each($('.gridster li[data-widget|="report"]'), function() {
						if ($(this) !== undefined && $(this).attr('data-widget') !== "undefined" && self.options.availableWidgets[$(this).attr('data-widget')] != undefined) {
							self.widgetFunction = self[self.options.availableWidgets[$(this).attr('data-widget')].functionName];

							//
							self.widgetFunction($(this).attr('data-widget'), $(this), $(this).attr('data-params'));
						} else {
							$(this).html('templates/dashboard/widget_undefined.ejs', {'localizeHeader': 'modules.dashboard.undefined'});
						}


					});

					if (($(".content-scrollable").length != 0 || $(".content-scrollable").data("jsp")) && !$("html").hasClass("lt-ie9")) {
						$(".content-scrollable").data("jsp").destroy();
						setTimeout(function() {
							$(".content-scrollable").jScrollPane({
								overlayScrollbar: true
							});
						}, 500);
					}

				}, 0);
			},

			findEmptyPlaces: function() {
				var serializedGridster = gridsterT.serialize();
				if (serializedGridster.length == 0) {
					if (this.options.IE8 == false) {
						$(".add-widget").remove();
						if ($(window).width() >= 1024) {
							$('.gridster').append('<li  style="display:none" class="gs_w2 add-widget" data-sizey="' + 1 + '" data-sizex="' + 6 + '" data-col="' + 1 + '" data-row="' + 1 + '"></li>');
							$(".gridster .add-widget").html('templates/dashboard/widget_add_widget.ejs', {'widgetSize': 6, 'widgetRow': 1, 'widgetCol': 1});
							$('li.add-widget').fadeIn();
							return true;

						}
					}

				}
				var maxRow = 0;


				$.each(serializedGridster, function(index, value) {
					if (maxRow < value.row) maxRow = value.row;
				});

				var gridsterArray = new Array(maxRow);
				for (var i = 1; i <= maxRow; i++) {
					gridsterArray[i] = new Array(7);
				}
				for (var i = 1; i <= maxRow; i++) {
					for (var j = 1; j < 7; j++) {
						gridsterArray[i][j] = 0;
					}
				}

				$.each(serializedGridster, function(index, value) {
					for (var i = value.row; i < value.row + value.size_y; i++)
						for (var j = value.col; j < value.col + value.size_x; j++)
							gridsterArray[i][j] = 1;

				});


				var emptyPlaces = Array();
				var beforeEmpty = false;


				for (var i = 1; i <= (maxRow + 1); i++) {
					if (beforeEmpty == true) {
						if ((j - startPoint) > 1)
							emptyPlaces[emptyPlaces.length] = {'row': (i - 1), 'start': startPoint, 'size': (7 - startPoint)};
					}
					beforeEmpty = false;
					var startPoint = 0;
					var endPoint = 0;
					if (i > maxRow) break;
					for (var j = 1; j < 7; j++) {
						if (gridsterArray[i][j] == 0) {
							if (startPoint == 0) {
								startPoint = j;
							}
							beforeEmpty = true;


						} else {
							if (beforeEmpty == true) {
								beforeEmpty = false;
								if ((j - startPoint) > 1)
									emptyPlaces[emptyPlaces.length] = {'row': i, 'start': startPoint, 'size': (j - startPoint)};

								startPoint = 0;
							}
						}
					}
				}
				if (this.options.IE8 == false) {

					$(".add-widget").remove();

					if ($(window).width() >= 1024)
						$.each(emptyPlaces, function(index, value) {
							if (index == 0) {

								$('.gridster').append('<li  style="display:none" class="gs_w2 add-widget" data-sizey="' + 1 + '" data-sizex="' + value.size + '" data-col="' + value.start + '" data-row="' + value.row + '"></li>');
								$(".gridster .add-widget").html('templates/dashboard/widget_add_widget.ejs', {'widgetSize': value.size, 'widgetRow': value.row, 'widgetCol': value.start});
							}
						});
					$('li.add-widget').fadeIn();

				}

				//bindAddWidgetButton();
				//bindDetachWidgetButton();

			},

			"#search-widgets keyup": function(element) {
				var filter = element.val();


				if (filter) {
					$.each($("#widget-modal .modal-body .widget-item h1"), function() {
						$(this).parents(".widget-item").css('display', 'none');
					});

					$.each($("#widget-modal .modal-body .widget-item h1:Contains(" + filter + ")"), function() {
						$(this).parents(".widget-item").css('display', 'block');
					});

					//$("#widget-modal .modal-body .widget-item h1").removeHighlight();
					$.each($("#widget-modal .modal-body .widget-item h1"), function() {
						var StrippedString = $(this).html().replace(/(<([^>]+)>)/ig, "");
						$(this).html(StrippedString);
					});

					$("#widget-modal .modal-body .widget-item h1").highlight(filter);

				} else {
					$.each($("#widget-modal .modal-body .widget-item h1"), function() {
						$(this).parents(".widget-item").css('display', 'block');
					});
					$("#widget-modal .modal-body .widget-item h1").removeHighlight();
				}


				$.each($("#widget-modal .modal-body"), function() {
					var countWidgets = 0;
					$.each($(this).find('.widget-item'), function() {
						if ($(this).css('display') != 'none')
							countWidgets++;
					});
					$('#widget-modal .filters li[data-link="' + $(this).data('tab') + '"] a small').html("(" + countWidgets + ")")
				});
			},


			"#widget-modal .modal-header div.filters ul li a click": function(element) {

				if (!element.parent().hasClass('active') && !element.parent().hasClass('disabled')) {
					var newTab = element.parent().data('link');
					$("#widget-modal .modal-header div.filters ul li").removeClass('active');
					$('#widget-modal .modal-header div.filters ul li[data-link="' + newTab + '"]').addClass('active');
					$('#widget-modal .modal-body').css('display', 'none');
					$('#widget-modal .modal-body[data-tab="' + newTab + '"]').css('display', 'block');
				}
			},

			".widget-detach click": function(element) {
				var self = this;
				var widgetIndex = element.parents('li').data('widget');
				if (widgetIndex == "report-first") self.options.defaultReportInstalled = null;
				if (this.options.availableWidgets[widgetIndex] !== undefined)
					this.options.availableWidgets[widgetIndex].installed = 0;

				$("li.add-widget").remove();
				gridsterT.remove_widget(element.parents('li'));
				setTimeout(function() {
					self.findEmptyPlaces();
					self.saveDashboard();
				}, 600);
			},

			".btn-add-widget click": function(element) {
				var self = this;


				$("#widget-modal").remove();
				$("body").append('templates/dashboard/nm_widget_modal.ejs', {'availableWidgets': self.options.availableWidgets, 'max_size': element.data('widget-size'), 'widgetRow': element.data('pre-row'), 'widgetCol': element.data('pre-col')});
				if (permissionsTable['reports_browse'] == 0) {
					$('#widget-modal li[data-link="reports"]').addClass('disabled');
				}
				//$('#widget-modal').css({"margin-left": -($('#widget-modal').width()/2), "margin-top": -($('#widget-modal').height()/2)});
				$('#widget-modal').on('hidden', function() {
					$('#widget-modal').remove();
					$(".modal-backdrop").remove();
				});


				$("#widget-modal .btn-close").click(function() {
					$("#widget-modal").modal('hide');
				});


				localizeAttribute("#widget-modal .widget-size", "title", null);

				localizeAttribute("#widget-modal .end-of-dashboard", "title", null);


				$("#widget-modal .widget-size").tooltip({
					placement: 'top',
					template: '<div class="tooltip tooltip-blue"><div class="tooltip-arrow"></div><i class="icon icon-info-small-white"></i><div class="tooltip-inner"></div></div>'
				});

				$("#widget-modal .end-of-dashboard").tooltip({
					placement: 'top',
					template: '<div class="tooltip tooltip-blue"><div class="tooltip-arrow"></div><i class="icon icon-info-small-white"></i><div class="tooltip-inner"></div></div>'
				});

				$("#widget-modal").modal('show');
				setVerticalModalMargin();


			},
			".install-widget click": function(element) {
				$(".tooltip").remove();
				var self = this;
				var widgetIndex = element.parents('.widget-item').data('widget');


				if (this.options.availableWidgets[widgetIndex].rights != "" && permissionsTable[this.options.availableWidgets[widgetIndex].rights] == 0) {
					return false;
				} else {


					var widgetParams = element.parents('.widget-item').data('params');
					var widgetSizeX = this.options.availableWidgets[widgetIndex].sizex;
					var newWidgetXY = Array();

					if (parseInt(element.data('pre-row')) != 0 && parseInt(element.data('pre-col')) != 0) {
						newWidgetXY = [parseInt(element.data('pre-row')), parseInt(element.data('pre-col'))];
					}
					else {
						newWidgetXY = self.newWidgetPosition(1, widgetSizeX);
					}


					self.widgetFunction = self[self.options.availableWidgets[widgetIndex].functionName];

					if ($(window).width() <= 1024) {
						gridsterT.add_widget('<li class="new gs_static" data-widget="' + widgetIndex + '" data-params="' + widgetParams + '"></li>', widgetSizeX, 1, newWidgetXY[1], newWidgetXY[0]);

					} else {
						gridsterT.add_widget('<li class="new" data-widget="' + widgetIndex + '" data-params="' + widgetParams + '"></li>', widgetSizeX, 1, newWidgetXY[1], newWidgetXY[0]);
					}


					self.widgetFunction(widgetIndex, $("li.new"), widgetParams);

					this.options.availableWidgets[widgetIndex].installed = 1;

					element.parents('.toolbar').prepend('<span class="status"><i class="icon-installed"></i> <span data-localize="modules.dashboard.modal.installed">Installed</span></span>');
					element.parents('.toolbar').find('a').remove();

					if (parseInt(element.data('pre-row')) != 0 && parseInt(element.data('pre-col')) != 0)
						$("#widget-modal").modal('hide');

					$("body").scrollTo($('li[data-widget="' + widgetIndex + '"]'), 250, {
						offset: -116
					});
					self.saveDashboard();
					this.findEmptyPlaces();
				}
			},


			newWidgetPosition: function(newWidgetRows, newWidgetCols) {
				newWidgetRows = parseInt(newWidgetRows);
				newWidgetCols = parseInt(newWidgetCols);
				var numberOfCols = 7;
				var maxCol = 0;
				var serializedGridster = this.serialize_dashboard();
				var insertRow = 0;
				var insertCol = 0;
				var maxRow = 0;
				$.each(serializedGridster, function(index, value) {
					if (maxRow < parseInt(value.row)) maxRow = parseInt(value.row);
				});


				$.each(serializedGridster, function(index, value) {
					if (maxRow == parseInt(value.row)) {
						if (maxCol < (parseInt(value.col) + parseInt(value.size_x))) maxCol = parseInt(value.col) + parseInt(value.size_x);
					}
				});

				if (maxCol + newWidgetCols > numberOfCols) {
					insertRow = maxRow + 1;
					insertCol = 1;
				} else {
					insertRow = maxRow;
					insertCol = maxCol;
				}

				return [insertRow, insertCol];
			},


			".dash-report-choose click": function(element) {
				/*
					* w chwili obecnej nieuzywane
					var self=this;
					$("#dashboard-report").parents(".module-widget").removeClass('module-empty');
					var replaceText = element.find("span").html();
					$("#report-chosen>span").removeAttr('data-localize');
					$("#report-chosen>span").html( (replaceText.length>40 ? (replaceText.substr(0, 37)+"...") : replaceText));

					$("#dashboard-1 .module").append(loaderString);
					$("#dashboard-1 #dashboard-report").html("");
					Report.getChart(element.attr("reportID"),function(reportChart){

					if(reportChart==null || reportChart.script==null){
					$("#dashboard-1").find(".overlay").remove();
					$("#dashboard-report").parents(".module-widget").addClass('module-empty');
					$("#dashboard-report").append('templates/dashboard/dashboard_empty_chart.ejs',{});

					}else{



					self.parseJS(reportChart.script,$("#dashboard-1").width()-20,240,"dashboard-report",function(){
					$("#dashboard-1").find(".overlay").remove();
					$("#dashboard-report").append('<a class="report-link" href="#!report/'+element.attr("reportID")+'/chart">'+''+'</a>');
					},function(){
					$("#dashboard-1").find(".overlay").remove();
					$("#dashboard-report").parents(".module-widget").addClass('module-empty');
					$("#dashboard-report").append('templates/dashboard/dashboard_error_chart.ejs',{});

					});
					}


					},function(error){
					dashboardErrorHandle(error);
					$("#dashboard-1").find(".overlay").remove();
					$("#dashboard-report").parents(".module-widget").addClass('module-empty');
					$("#dashboard-report").html('templates/dashboard/dashboard_error_chart.ejs',{});

					});
					*/
			},

			".btn-accept-quote-dashboard click": function(element) {
				var currentQuoteID = element.data('quote-id');
				var infoElement = element.parents('.info');
				var amountOfQuote = infoElement.find('big').html();

				element.parents('li.quote-wfa').attr('data-status', 'quote-accepted');
				infoElement.parents('li.quote-wfa').addClass('loading');
				infoElement.html('<i class="icon-loader-green"></i> <strong data-localize="modules.quotes.accepting">Accepting...</strong><a class="quote-acceptance-cancel link-primary" data-quote-id="' + currentQuoteID + '" data-quote-amount="' + amountOfQuote + '" data-localize="general.cancel">Cancel</a>');

				setTimeout(function() {
					if (infoElement.parents('li.quote-wfa').hasClass('loading') && location.hash == "#!") {
						infoElement.find('.quote-acceptance-cancel').remove();
						Quote.acceptQuote(currentQuoteID, function(success) {

							infoElement.parents('li.quote-wfa').removeClass().addClass('quote-p');
							infoElement.html('<big>' + amountOfQuote + '</big> <a class="preview-link" href="#!quote/' + currentQuoteID + '"><i class="icon-preview"></i></a>');
						}, function(error) {
							infoElement.parents('li.quote-wfa').removeClass().addClass('error').attr('data-status', 'quote-acceptance-error');
							infoElement.html('<strong class="info">Sorry, an error occured while accepting quote.</strong><a class="preview-link" href="#!quote/' + currentQuoteID + '"><i class="icon-preview"></i></a>');
						});

					}

				}, 40000);


			},
			".quote-acceptance-cancel click": function(element) {
				var currentQuoteID = element.data('quote-id');
				var amountOfQuote = element.data('quote-amount');
				var infoElement = element.parents('.info');
				infoElement.parents('li.quote-wfa').removeClass('loading');
				element.parents('li.quote-wfa').removeAttr('data-status');
				infoElement.html('<big>' + amountOfQuote + '</big><a class="btn btn-mini btn-ncta btn-accept-quote-dashboard" data-quote-id="' + currentQuoteID + '">Accept</a><a class="preview-link" href="#!quote/' + currentQuoteID + '"><i class="icon-preview"></i></a>');

			},


			parseJS: function(script, width, height, placeholder, successHandler, reportErrorHandler) {
				//successHandler();


				var self = this;

				if (blockChart == false) {
					blockChart = true;
					successHandler2 = successHandler;
					reportErrorHandler2 = reportErrorHandler;
					var widthReg = /width:(\s)*[0-9]*\,?/;
					var heightReg = /height:(\s)*[0-9]*\,?/;
					var nameChartReg = /(.*)\.draw/;
					var chartVarName = script.match(nameChartReg);
					chartVarName = chartVarName[1];
					//  script=script.replace(widthReg,"width: "+width.toString()+",");
					script = script.replace(widthReg, "width: " + width.toString() + ",backgroundColor:\"transparent\",");
					script = script.replace(heightReg, "height: " + height.toString() + ",");
					script = script.replace("getElementById('plotholder')", "getElementById('" + placeholder + "')")
					script = script.replace(chartVarName + ".draw(", 'google.visualization.events.addListener(' + chartVarName + ', "error", reportErrorHandler2); \n google.visualization.events.addListener(' + chartVarName + ', "ready", successHandler2); \n ' + chartVarName + '.draw(');


					script = script.replace('hAxis:', 'chartArea: {left:80,top:30, width:"60%",height:"60%"}, hAxis:');


					if ($.cookie('highcharts') == 1) {


						script = script.replace(/chart\.draw([\S\s]*?)}\);/m, "");

						//LineChart
						//ColumnChart
						//PieChart


						var chartType = 'column';
						if (script.indexOf('ColumnChart') > 0)
							chartType = 'column';
						if (script.indexOf('LineChart') > 0)
							chartType = 'line';
						if (script.indexOf('PieChart') > 0)
							chartType = 'pie';

						$.globalEval(script);
						var theLegend = [];
						var xAxis = [];
						var series = [];


						$.each(financialChartRowData, function(index, value) {
							$.each(value, function(index2, value2) {
								if (index == 0) {
									if (index2 != 0)
										series[index2 - 1] = {"name": value2, "data": []};

								} else {
									if (index2 == 0) {
										if (index != 0)
											theLegend[index - 1] = value2;
									} else {

										series[index2 - 1].data[series[index2 - 1].data.length] = value2;
									}
								}
							});
						})


						drawChartTest(theLegend, series, placeholder, theLegend.length, chartType, true);


						blockChart = false;
					} else {

						try {
							$.globalEval(script);
						} catch (exception) {
							if (exception.message && exception.message === "google is not defined") {
								Report.googleUnreachable = true;
							}
							reportErrorHandler2();
						}
					}
				} else {
					setTimeout(function() {
						self.parseJS(script, width, height, placeholder, successHandler, reportErrorHandler);
					}, 300);
				}

			}




		});


	});