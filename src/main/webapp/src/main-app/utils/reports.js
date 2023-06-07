steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	'./offices.js',

	function($) {
		var EMPTY_OFFICE = { id: '' };

		$.Model('Report', {
				googleUnreachable: false,
				findOne: function(id, success, error) {
					return $.ajax({
						url: baseURL + 'reports/' + id + addToURL,
						dataType: 'json',
						xhrFields: { withCredentials: true },
						success: success,
						error: error
					});
				},
				findAll: function(params, success, error) {
					var queryString = queryBuilder(params);
					return $.ajax({
						url: baseURL + 'reports' + addToURL + queryString,
						dataType: 'json',
						xhrFields: { withCredentials: true},
						timeout: 60000,
						success: success,
						error: error
					});
				},
				count: function(params, success, error) {
					var queryString = queryBuilder(params);
					return $.ajax({
						url: baseURL + 'reports/count' + addToURL.substr(5) + queryString,
						dataType: 'json',
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});
				},
				getTableTrimmed: function(reportID, officeID, maxRows, maxCols, success, error) {
					return $.ajax({
						url: baseURL + 'reports/' + reportID + '/table' + addToURL + '?officeId=' + Office.getQueryId(officeID) + '&maxRows=' + maxRows + '&maxCols=' + maxCols,
						dataType: 'json',
						xhrFields: { withCredentials: true},
						timeout: 60000,
						success: success,
						error: error
					});
				},
				getTable: function(reportID, officeID, success, error) {
					return $.ajax({
						url: baseURL + 'reports/' + reportID + '/table' + addToURL + '?officeId=' + Office.getQueryId(officeID),
						dataType: 'json',
						xhrFields: { withCredentials: true},
						timeout: 60000,
						success: success,
						error: error
					});
				},
				getChart: function(reportID, officeID, success, error) {
					if(this.googleUnreachable === true) {
						error({status: 'google-unreachable'});
						return;
					}
					return $.ajax({
						url: baseURL + 'reports/' + reportID + '/chart' + addToURL + '?officeId=' + Office.getQueryId(officeID),
						dataType: 'json',
						xhrFields: { withCredentials: true},
						timeout: 60000,
						success: success,
						error: error
					});
				}
			},
			{});


		$.Controller("Reports", {
				init: function(element, options) {
					if(options.print && options.print == true) {
						this.showPrintReport(options.id, options.officeId, options.type);
					} else {


						if(options.list)
							this.showReports(options.targetDiv, options);
						else {
							this.options.reportID = options.id;
							this.options.officeID = options.officeId;
							this.showSingleReport(options.targetDiv, options);
						}
					}


				},

				showSingleReport: function(element, options) {
					var report;
					var office = EMPTY_OFFICE;
					var self = this;
					var showChart = true;

					$.when(
						Office.findAll({}, { includeAll: true }),
						Report.findAll({
							start: 0,
							limit: 10000
						})
					).done(function(officesArgs, reportsArgs) {
						var offices = officesArgs[0];
						var reports = reportsArgs[0];

						$.each(reports, function(index, value) {
							if(value.id == options.id) {
								if(value.chartType === null) {
									showChart = false;
								}
								report = value;
							}
						});

						$.each(offices, function(index, value) {
							if (value.id == options.officeId) { office = value; }
						});

						report.csv = baseURL + 'reports/' + report.id + '/csv?officeId=' + Office.getQueryId(office.id);

						if(options.type == "chart" && showChart == false) {
							location.href = '#!report/' + report.id + '/' + office.id + '/table';
						}

						element.html("templates/reports/report_single_wrapper.ejs", {
							offices: offices,
							office: office,
							reports: reports,
							report: report,
							showChart: showChart
						});

						if(options.type == "table") {
							self.showSingleTable(report.id, office.id);
						}

						if(options.type == "chart") {
							self.showSingleChart(report.id, office.id);
						}

						if(lastPage != 0 && lastPage != "0") {
							$("a.return-button").attr("href", "#!reports/" + lastPage);
							lastPage = 0;
						}


						//dontShowLoader();
						// $("body .overlay").remove();

					}).fail(function(error) {
						dontShowLoader();
						//$("body .overlay").remove();

						errorHandle(error);
						location.hash = "#!";


					});


				},

				".include-checkbox change": function(element) {
					if(element.parent().attr('id') == "include-chart-checkbox") {
						if(element.is(":checked")) {
							$("#chart-view").css('display', 'block');
						} else {
							$("#chart-view").css('display', 'none');
						}
					}

					if(element.parent().attr('id') == "include-table-checkbox") {
						if(element.is(":checked")) {
							$("#table-view").css('display', 'block');
						} else {
							$("#table-view").css('display', 'none');
						}
					}
				},


				showPrintReport: function(reportID, officeID, type) {
					var self = this;
					var reportName = "";
					var showChart = true;
					var cTime = new Date();
					var isIE8 = false;
					if($.browser.msie && parseInt($.browser.version, 10) < 9) {
						isIE8 = true;
					}
					var cTimeString = "";

					cTimeString = $.format.date(new Date(), sessionObject.dateFormat);


					$("h3 .date-container").html(cTimeString);

					$.when(
						// TODO: Use /customer-api/reports/:id
						Office.findAll({}, { includeAll: true }),
						Report.findOne(reportID)
					)
					.done(function(officesArgs, reportArgs) {
						var office;
						var offices = officesArgs[0];
						var report = reportArgs[0];

						$.each(offices, function(index, value) {
							if (value.id == officeID) {
								office = value;
							}
						});

						if (report.chartType === null) { showChart = false; }

						$(".title h2").html(report.localizedName);
						$("h3 .office-container").html(office.name);

					})
					.fail(function(error) {
						$("body .overlay").remove();
						errorHandle(error);
					});

					if(type == 'table') {
						$("#chart-view").css('display', 'none');
						$("#include-table-checkbox").css('display', 'none');
					} else if(type == 'chart') {
						$("#table-view").css('display', 'none');
						$("#include-chart-checkbox").css('display', 'none');
					}


					if(showChart == false) {
						$("#include-chart-checkbox").css('display', 'none');
					}

					if(showChart)
						Report.getChart(reportID, officeID, function(reportChart) {
							if(reportChart == null) {

							} else {
								self.parseJS(reportChart.script, 843, 500, "chart-view",
									function() {

										$('.module-report ul.nav-tabs a[tab="chart"]').removeClass('loading');

									},
									function(error) {

										$('.module-report ul.nav-tabs a[tab="chart"]').removeClass('loading');
										$(".module-report .tab-content .tab-pane").removeClass('active');
										$(".module-report #chart-view").html('templates/reports/report_error_chart.ejs', {});
										$(".module-report #chart-view").addClass('active').addClass('module-empty');


										$(".module-report .tab-content").find(".overlay").remove();
									}
								);
							}
						}, function(error) {
							$("#include-chart-checkbox").css('display', 'none');

							//$(".module-report .tab-content").find(".overlay").remove();
						});

					Report.getTable(reportID, officeID, function(reportTable) {
						if(reportTable == null) {


						} else {
							$("#table-view").html(reportTable.table);

						}
					}, function(error) {
						errorHandle(error);
						$('.module-report ul.nav-tabs a[tab="table"]').removeClass('loading');
						$(".module-report .tab-content .tab-pane").removeClass('active');
						$(".module-report #table-view").html('templates/reports/report_empty_table.ejs', {});
						$(".module-report #table-view").addClass('active').addClass('module-empty');


					});


				},

				showSingleTable: function(reportID, officeID) {


					$.each($(".report-choice .dropdown-menu li"), function() {

						$(this).find('a').attr('href', $(this).find('a').attr('href').replace('chart', 'table'));

					});


					$("body").removeClass();
					$("body").addClass("single-view");
					$("body").addClass("single-report-view");

					$('.module-report ul.nav-tabs li').removeClass('active');
					$('.module-report ul.nav-tabs a[tab="table"]').parent().addClass('active');
					$('.btn-print').css('display', 'block');
					$('.btn-print').attr('href', "#!report/" + reportID + '/' + officeID + "/print/table");
					if($(".module-report .tab-content #table-view #table-wrapper").html() == "") {
						Report.getTable(reportID, officeID, function(reportTable) {

							if(reportTable == null || reportTable.status == 204) {
								$('.module-report ul.nav-tabs a[tab="table"]').removeClass('loading');
								$(".module-report .tab-content .tab-pane").removeClass('active');
								$(".module-report #table-view").html('templates/reports/report_empty_table.ejs', {});
								$(".module-report #table-view").addClass('active').addClass('module-empty');
								$('.btn-print').css('display', 'none');

							} else {
								$(".module-report .tab-content #table-view #table-wrapper").html(reportTable.table);
								$(".module-report .tab-content .tab-pane").removeClass('active');
								$("#table-view").addClass('active');
								$('.module-report ul.nav-tabs a[tab="table"]').removeClass('loading');
								// var myScroll = new iScroll('table-wrapper',{hScroll:true, vScroll:true,hScrollbar: true, vScrollbar: true, hideScrollbar: false, fadeScrollbar: true, scrollbarClass: 'scroll-bar', lockDirection: false});

								$('#table-wrapper').jScrollPane();

								$(".jspContainer").height($(".jspContainer").height() + 18);
								$('.btn-print').css('display', 'block');
							}
							dontShowLoader();
						}, function(error) {
							dontShowLoader();
							errorHandle(error);
							$('.module-report ul.nav-tabs a[tab="table"]').removeClass('loading');
							$(".module-report .tab-content .tab-pane").removeClass('active');
							$(".module-report #table-view").html('templates/reports/report_empty_table.ejs', {});
							$(".module-report #table-view").addClass('active').addClass('module-empty');
							$('.btn-print').css('display', 'none');


						});

					} else {
						dontShowLoader();
						$(".module-report .tab-content .tab-pane").removeClass('active');
						$("#table-view").addClass('active');
						$('.module-report ul.nav-tabs a[tab="table"]').removeClass('loading');
					}
				},
				showSingleChart: function(reportID, officeID) {


					$.each($(".report-choice .dropdown-menu li"), function() {

						$(this).find('a').attr('href', $(this).find('a').attr('href').replace('table', 'chart'));

					});

					$("body").addClass("single-view");
					$("body").addClass("single-report-view");
					$('.module-report ul.nav-tabs li').removeClass('active');
					$('.module-report ul.nav-tabs a[tab="chart"]').parent().addClass('active');
					$('.btn-print').css('display', 'block');
					$('.btn-print').attr('href', "#!report/" + reportID + '/' + officeID + "/print/chart");
					var self = this;
					if($(".module-report .tab-content #chart-view #chart-wrapper").html() == "") {
						Report.getChart(reportID, officeID, function(reportChart) {

							if(reportChart == null || reportChart.status == 204) {
								$('.module-report ul.nav-tabs a[tab="chart"]').removeClass('loading');
								$(".module-report .tab-content .tab-pane").removeClass('active');
								$(".module-report #chart-view").html('templates/reports/report_empty_chart.ejs', {});
								$(".module-report #chart-view").addClass('active').addClass('module-empty');
								$('.btn-print').css('display', 'none');

								$(".module-report .tab-content").find(".overlay").remove();


							} else {
								$("#chart-view").addClass('active');
								self.parseJS(reportChart.script, $(".module-report .tab-content").width() - 20, 600, "chart-view",
									function() {
										$(".module-report .tab-content .tab-pane").removeClass('active');
										$("#chart-view").addClass('active');
										$('.module-report ul.nav-tabs a[tab="chart"]').removeClass('loading');
										$('.btn-print').css('display', 'block');

									},
									function(error) {
										$('.module-report ul.nav-tabs a[tab="chart"]').removeClass('loading');
										$(".module-report .tab-content .tab-pane").removeClass('active');
										$(".module-report #chart-view").html('templates/reports/report_error_chart.ejs', {});
										$(".module-report #chart-view").addClass('active').addClass('module-empty');


										$(".module-report .tab-content").find(".overlay").remove();
										$('.btn-print').css('display', 'none');
									}
								);
							}
							dontShowLoader();
						}, function(error) {
							dontShowLoader();
							errorHandle(error);
							$(".module-report .tab-content").find(".overlay").remove();
							$('.btn-print').css('display', 'none');
						});
					} else {

						$(".module-report .tab-content .tab-pane").removeClass('active');
						$("#chart-view").addClass('active');
						$('.module-report ul.nav-tabs a[tab="chart"]').removeClass('loading');
						$('.btn-print').css('display', 'block');
						dontShowLoader();
					}

				},
				".module-report ul.nav-tabs a click": function(element) {
					var officeID;
					var reportID;
					var reportDiv;

					if(!element.parent().hasClass('active')) {
						element.addClass('loading');

						reportDiv = element.parents(".module-report");
						officeID = reportDiv.attr("officeID");
						reportID = reportDiv.attr("reportID");

						if(element.attr("tab") == "table") {
							this.showSingleTable(reportID, officeID);
						}

						if(element.attr("tab") == "chart") {
							this.showSingleChart(reportID, officeID);
						}
					}
				},

				showReports: function(element, options) {

					pageLimit = defaultPageLimit;

					var offset = pageLimit * (options.page - 1);
					lastPage = options.page;

					var onReject = function(error) {
						errorHandle(error);
						location.hash = "#!";
						//$("body .overlay").remove();
						dontShowLoader();
					};

					Report.count({}, function(reportsCount) {
						if(reportsCount == "0") {
							element.html("templates/reports/reports_list_empty.ejs", {});

							dontShowLoader();
						} else

							$.when(
								Office.findOne('default'),
								Office.findAll({}, { includeAll: true }),
								Report.findAll({
									start: offset,
									limit: pageLimit
								})
							).done(function(officeArgs, officesArgs, reportsArgs) {
								var office = officeArgs[0];
								var offices = officesArgs[0];
								var reports = reportsArgs[0];
								// $("body .overlay").remove();

								if (offices.length === 0) {
									office = EMPTY_OFFICE;
								}

								$.each(reports, function(index, value) {
									reports[index].downloadCSV = baseURL + 'reports/' + value.id + '/csv?officeId=' + Office.getQueryId(office.id);
								});

								element.html("templates/reports/reports_list.ejs", {
									office: office,
									offices: offices,
									reports: reports
								});

								var numberOfPages = Math.ceil(reportsCount / pageLimit);
								var paginationArray = {"numberOfPages": numberOfPages, "pageLimit": pageLimit, "currentPage": options.page};
								appendPagination(element.parent().find(".pagination"), "#!reports/:page", paginationArray);
								dontShowLoader();
							}).fail(onReject);
					}, onReject);

				},
				".hide-report click": function(element) {
					var reportDiv = element.parents(".module-report");
					var reportID = reportDiv.attr("reportID");

					reportDiv.find('.field-report-preview .hide-report').css('display', 'none');
					reportDiv.find('.field-report-preview .view-report').css('display', 'inline');
					reportDiv.find(".content-wrapper").slideUp(500, function() {
						reportDiv.find(".content-wrapper").html("");
						reportDiv.addClass('collapsed');
						reportDiv.removeClass('expanded');
						reportDiv.find('.field-report-preview .view-report').removeClass('active');
						reportDiv.find('.field-report-type a').removeClass('active');
					});


				},

				".view-report click": function(element) {

					if(!element.hasClass('active')) {
						element.siblings().removeClass('active');
						element.addClass('active');

						var reportDiv = element.parents(".module-report");
						var reportID = reportDiv.attr("reportID");
						var officeID = reportDiv.attr("officeID");

						reportDiv.append(loaderString);
						reportDiv.find('.field-report-type .view-report').addClass('active');


						Report.getTableTrimmed(reportID, officeID, 10, 5, function(reportTable) {
							if(reportTable == null || (typeof reportTable.status !== undefined && reportTable.status == 204)) {
								reportDiv.find(".overlay").remove();
								element.removeClass('active');
								reportDiv.removeClass('expanded');
								reportDiv.addClass('collapsed unavailable');
								reportDiv.find('.hide-report').trigger('click');
								reportDiv.find("header a").removeAttr("href");
								reportDiv.append('<div class="overlay" data-localize="general.sorry-cant-show">Sorry, we cannot show it to you</div>');


							} else {

								reportDiv.find('.field-report-preview .view-report').css('display', 'none');
								reportDiv.find('.field-report-preview .hide-report').css('display', 'inline');
								reportDiv.find(".content .content-wrapper").html("templates/reports/report_table_wrapper.ejs", {reportTable: reportTable, reportURL: "#!report/" + reportID + '/' + officeID});
								reportDiv.find(".content-wrapper .table-wrapper").prepend(reportTable.table);

								if(reportTable.colsTrimmed && reportTable.rowsTrimmed) {
									reportDiv.find(".content-wrapper .table-wrapper tr").find("td:last").addClass('faded-out');
									reportDiv.find(".content-wrapper .table-wrapper tr:last").addClass('faded-out');
									reportDiv.find(".content-wrapper .table-wrapper tr:last").prev().addClass('faded-out');
									reportDiv.find(".content-wrapper .table-wrapper .table-trimmer").addClass('trimmed-both').append('<a href="#!report/' + reportID + '/' + officeID + '"><i class="icon-partial-table"></i></a>');
								} else if(reportTable.colsTrimmed) {

									reportDiv.find(".content-wrapper .table-wrapper tr").find("td:last").addClass('faded-out');
									reportDiv.find(".content-wrapper .table-wrapper .table-trimmer").addClass('trimmed-right').append('<a href="#!report/' + reportID + '/' + officeID + '"><i class="icon-partial-table"></i></a>');
								} else if(reportTable.rowsTrimmed) {
									reportDiv.find(".content-wrapper .table-wrapper tr:last").addClass('faded-out');
									reportDiv.find(".content-wrapper .table-wrapper tr:last").prev().addClass('faded-out');
									reportDiv.find(".content-wrapper .table-wrapper .table-trimmer").addClass('trimmed-bottom');
								} else {
									reportDiv.find(".table-trimmer-bottom").detach();
								}

								if(!reportDiv.hasClass('expanded')) {
									reportDiv.removeClass('collapsed');
									reportDiv.addClass('expanded');


									reportDiv.find(".content-wrapper").slideDown();

								} else {
									reportDiv.find(".content-wrapper").css('display', 'block');
								}
								reportDiv.find(".table-trimmer").height(reportDiv.find("table").height());
								reportDiv.find(".overlay").remove();
							}
						}, function(error) {
							errorHandle(error);
							reportDiv.find(".overlay").remove();
							element.removeClass('active');
						});

					}
				},
				".view-chart click": function(element) {

					if(!element.hasClass('active')) {
						element.siblings().removeClass('active');
						element.addClass('active');

						var reportDiv = element.parents(".module-report");
						var reportID = reportDiv.attr("reportID");
						var officeID = reportDiv.attr("officeID");

						var self = this;
						reportDiv.append(loaderString);
						Report.getChart(reportID, officeID, function(reportChart) {
							if(reportChart == null || (typeof reportChart.status !== undefined && reportChart.status == 204)) {
								reportDiv.find(".overlay").remove();
								element.removeClass('active');
								reportDiv.removeClass('expanded');
								reportDiv.addClass('collapsed unavailable');
								reportDiv.find('.hide-report').trigger('click');
								reportDiv.find("header a").removeAttr("href");
								reportDiv.append('<div class="overlay" data-localize="general.sorry-cant-show">Sorry, we cannot show it to you</div>');
							} else {

								reportDiv.find(".content .content-wrapper").html("templates/reports/report_chart_wrapper.ejs", {reportChartHolderID: "report-chart-" + reportID})
								reportDiv.find(".content-wrapper").slideDown();
								self.parseJS(reportChart.script, reportDiv.width() - 20, 378, "report-chart-" + reportID, function() {
										reportDiv.find('.field-report-preview .view-report').css('display', 'none');
										reportDiv.find('.field-report-preview .hide-report').css('display', 'inline');
										reportDiv.find(".overlay").remove();
										if(reportDiv.hasClass('collapsed')) {
											reportDiv.removeClass('collapsed');
											reportDiv.addClass('expanded');
										} else {
											reportDiv.find(".content-wrapper").css('display', 'block');
										}
									},
									function(error) {
										error.message = "Sorry an error occurred while drawing a chart.";
										reportDiv.find(".overlay").remove();
										element.removeClass('active');
										element.addClass('disabled');

										errorHandle(null, error)

									}
								);

							}
						}, function(error) {
							errorHandle(error);
							reportDiv.find(".overlay").remove();
							element.removeClass('active');
						});
					}
				},

				'.report-action-edit-office click': function(element) {
					var reportDiv = element.closest('.module-report');

					element.hide();

					reportDiv
						.find('.dropdown-select2')
						.show();
				},

				'.report-action-change-office click': function(element) {
					var reportDiv = element.closest('.module-report');
					var reportID = reportDiv.attr('reportID');
					var officeID = element.attr('officeID');

					element
						.closest('.dropdown-select2')
						.hide();

					reportDiv
						.attr('officeID', officeID)
						.find('.report-type.view-report.active')
							.removeClass('active')
							.trigger('click')
							.end()
						.find('.report-type.view-chart.active')
							.removeClass('active')
							.trigger('click')
							.end()
						.find('.view-full-report')
							.attr('href', function() {
								return '#!report/'+  reportID + '/' + officeID;
							})
							.end()
						.find('.action-download-report')
							.attr('href', function() {
								return baseURL + 'reports/' + reportID + '/csv?officeId=' + Office.getQueryId(officeID);
							})
						.end()
						.find('.office-name')
							.text(element.text())
							.end()
						.find('.dropdown-toggle')
							.text(element.text())
							.end()
						.find('.report-action-edit-office')
							.show();
				},

				'.overlay click': function(element) {
					element.remove();
				},

				parseJS: function(script, width, height, placeholder, successHandler, reportErrorHandler) {
					successHandler2 = successHandler;
					reportErrorHandler2 = reportErrorHandler;
					var widthReg = /width:(\s)*[0-9]*\,?/;
					var heightReg = /height:(\s)*[0-9]*\,?/;
					var nameChartReg = /(.*)\.draw/;
					var chartVarName;

					try {
						chartVarName = script.match(nameChartReg);
					} catch(exception) {
						reportErrorHandler();
						return;
					}

					chartVarName = chartVarName[1];

					script = script.replace(widthReg, "width: " + width.toString() + ",");
					script = script.replace(heightReg, "height: " + height.toString() + ",");
					script = script.replace("getElementById('plotholder')", "getElementById('" + placeholder + "')");
					script = script.replace(chartVarName + ".draw(", 'google.visualization.events.addListener(' + chartVarName + ', "error", reportErrorHandler2); \n google.visualization.events.addListener(' + chartVarName + ', "ready", successHandler2); \n ' + chartVarName + '.draw(');
					script = script.replace('hAxis:', 'chartArea: {left:80,top:30, width:"60%",height:"60%"}, hAxis:');


					if($.cookie('highcharts') == 1) {
						script = script.replace(/chart\.draw([\S\s]*?)}\);/m, "");


						$.globalEval(script);
						var chartType = 'column';
						if(script.indexOf('ColumnChart') > 0)
							chartType = 'column';
						if(script.indexOf('LineChart') > 0)
							chartType = 'line';
						if(script.indexOf('PieChart') > 0)
							chartType = 'pie';

						$.globalEval(script);

						var theLegend = new Array();
						var xAxis = new Array();
						var series = new Array();


						$.each(financialChartRowData, function(index, value) {
							$.each(value, function(index2, value2) {
								if(index == 0) {
									if(index2 != 0)
										series[index2 - 1] = {"name": value2, "data": []};

								} else {
									if(index2 == 0) {
										if(index != 0)
											theLegend[index - 1] = value2;
									} else {

										series[index2 - 1].data[series[index2 - 1].data.length] = value2;
									}
								}
							});
						})


						drawChartTest(theLegend, series, placeholder, theLegend.length, chartType, false);
						successHandler();
					} else {
						try {
							$.globalEval(script);
						} catch(exception) {
							if(exception.message && exception.message === "google is not defined") {
								Report.googleUnreachable = true;
							}
							reportErrorHandler({message: "Cannot connect google.com"});
						}
					}


				}






			}
		);
	});
