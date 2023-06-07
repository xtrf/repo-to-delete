var projects = null;
var resources = null;
var quotes = null;
var contacts = null;
var customerID = null;
var reportsController = null;
var dateFormat = null;
var dateHourFormat = null;
var filesController = null;
var tasksController = null;
var requestQuoteController = null;
var account = {
	account: null,
	socialMedia: null,
	profile: null
};
var tourController = null;
var invoices = null;
var dashboards = null;
var offices = null;
if (!baseURL)
	var baseURL = '';
if (!buildNumber)
	var buildNumber = '';
if (!homeApiUrl)
	var homeApiUrl = '/home-api/';
var defaultPageLimit = 5;
var pageLimit = 5;
var historyPageLimit = 15;
var loaderString = ' <div class="overlay"><div class="loader"><img src="static/img/js_img/351.gif"></div></div>';
var bigLoaderString = '<div class="overlay section-loader" style=""><div class="loader" style=""><img src="static/img/js_img/351.gif"></div></div>';
var addToURL = "";
var sessionObject = null;
var permissionsHash = {'POST': {}, 'GET': {}, 'PUT': {}, 'DELETE': {}};
var permissionsTable = {};
var companyName = "";
var portalName = "";
var lastPage = 0;
var pdf_info = null;
var showLoader = 1;
var helperController = null;
var salesDataGlobal = null;
var contactPersons = {};
var permissions = {};
var settings = {};
var systemCustomizations = [];
var fallbackLanguage = 'en-us';
steal('./session.js',
	'./settings.js',
	'./security.js',
	'./branding-colors.js',
	'jquery/class',
	'jquery/model',
	'jquery/view',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	'./projects.js',
	'./contacts.js',
	'./helper.js',
	'./raq.js',
	'./reports.js',
	'jquery/jquery.js',
	'./quotes.js',
	'./tasks.js',
	'./invoices.js',
	'./resources.js',
	'./account/social_media.js',
	'./account/profile.js',
	'./account/account_model.js',
	'./account/account.js',
	'./tour.js',
	'./dashboard.js').then(function($) {
		steal(
			'./../static/js/jquery.cookie.js',
			'./../static/js/jquery.highlight-4.closure.js',
			'./../static/js/jquery.form.js',
			'./../static/js/select2.js',
			'./../static/js/jquery.dataTables.js',
			'./../static/js/jquery-ui-1.8.23.custom.min.js',
			'./../static/js/jquery.scrollTo-1.4.3.1-min.js',
			'./../static/js/jquery.dateFormat-1.0.js',
			'./../static/js/jquery.localize.js',
			'./../static/js/jquery.base64.js',
			'./../static/js/waypoints.min.js',
			'./../static/js/jquery.placeholder.js',
			'./../static/js/bootstrap/bootstrap-modal.js',
			'./../static/js/bootstrap/bootstrap-transition.js',
			'./../static/js/bootstrap/bootstrap-dropdown.js',
			'./../static/js/bootstrap/bootstrap-tooltip.js',
			'./../static/js/bootstrap/bootstrap-transition.js',
			'./../static/js/utils.js',
			'./../static/js/jquery.draggable.js',
			'./../static/js/jquery.coords.js',
			'./../static/js/jquery.gridster.js',
			'./../static/js/jquery.collision.js',
			'./../static/js/jquery.mousewheel.js',
			'./../static/js/jquery.raty.js',
			'./../static/js/jquery.debounce-1.0.5.js',
			'./../static/js/date.js',
			'./../static/js/jscrollpane.js',
			'./../static/js/heartcode-canvasloader-min.js',
			'./../static/js/underscore.js',
			'./../static/js/pdf.detection.js',
			'./../static/js/highcharts.js',
			'./../static/js/moment.js',
			'./../static/js/jQuery.XDomainRequest.js',
			'./../static/js/linkify.js').then(function($) {
				steal(
					'./../static/js/bootstrap/bootstrap-popover.js',
					'./../static/js/daterangepicker.js',
					'./../static/js/jquery.gridster.extras.js',
					'./../static/js/exporting.js',
					'./components/date-range-picker.js',
					'./../static/js/jquery.linkify.js',
					function($) {
						if (!$.support.cors && window.XDomainRequest) {
							if ($.cookie("jsessionid") != null) {
								addToURL = '.json;jsessionid=' + $.cookie("jsessionid");
							} else {
								addToURL = ".json";
							}
						}

						$.ajaxSetup({
							cache: false
						});
						$.route.ready(false);
						getSession();

						loadSettings(function(_settings) {
							settings = _settings;

							loadSecuritySettings(function(_securitySettings) {
								settings.securitySettings = _securitySettings;
							})
						});
					});
				/*END*/
			});

		/*END*/
	});


function readyPage(cSession) {


	jQuery.expr[':'].Contains = function(a, i, m) {
		return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
	};
	var permissionsTableSource = {
		'projects_browse': {'GET': ['/projects']},
		'project_view': {'GET': ['/projects/{projectId}', '/projects/{projectId}/tasks', '/projects/{projectId}/files', '/projects/{projectId}/confirmation']},
		'quotes_browse': {'GET': ['/quotes']},
		'quote_view': {'GET': ['/quotes/{quoteId}', '/quotes/{quoteId}/files', '/quotes/{quoteId}/tasks', '/quotes/{quoteId}/confirmation']},
		'invoices_browse': {'GET': ['/invoices']},
		'reports_browse': {'GET': ['/reports', '/reports/{reportId}/table', '/reports/{reportId}/table']},
		'invoice_download': {'GET': ['/invoices/{invoiceId}/document', '/invoices/{invoiceId}/documents/{templateId}']},
		'resources_browse': {'GET': ['/resources']},
		'my_account_edit': {'PUT': ['/customers/{customerId}']},
		'person_view': {'GET': ['/customers/{customerId}/persons/{personId}', '/customers/{customerId}/persons/{personId}/address', '/customers/{customerId}/persons/{personId}/contact', '/customers/{customerId}/persons/{personId}/contact/socialMediaContacts']},
		'person_edit': {'GET': ['/customers/{customerId}/persons'], 'PUT': ['/customers/{customerId}/persons/{personId}', '/customers/{customerId}/persons/{personId}/address', '/customers/{customerId}/persons/{personId}/contact']},
		'person_add': {'POST': ['/customers/{customerId}/persons']},
		'person_delete': {'DELETE': ['/customers/{customerId}/persons/{personId}']},
		'request_quote': {'POST': ['/quotes', '/system/session/files'], 'GET': ['/customers/{customerId}/sales/priceProfiles', '/customers/{customerId}/persons']},
		'persons_browse': {'GET': ['/customers/{customerId}/persons']},
		'company_info_view': {'GET': ['/customers/{customerId}']},
		'change_account_settings': {'PUT': ['/system/account/preferences']},
		'accept_and_reject_quote': {'DELETE': ['/alternating-quotes/{quoteId}/acceptance'], 'POST': ['/quotes/{quoteId}']}
	};
	permissionsTable = {
		'projects_browse': 1,
		'quotes_browse': 1,
		'invoices_browse': 1,
		'reports_browse': 1,
		'invoice_download': 1,
		'resources_browse': 1,
		'my_account_edit': 1,
		'person_details_view': 1,
		'person_details_edit': 1,
		'person_add': 1,
		'person_delete': 1,
		'project_view': 1,
		'quote_view': 1,
		'request_quote': 1,
		'persons_browse': 1,
		'company_info_view': 1,
		'change_account_settings': 1 ,
		'accept_and_reject_quote': 1
	};

	permissions.hasAccessToInvoices = function() {
		return permissionsTable['invoices_browse'] === 1;
	}

	pdf_info = perform_acrobat_detection();


	sessionObject = cSession;

	var getCustomerId = function(session) {
		if (session.type === "Customer")
			return session.id;
		else if (session.type === "CustomerPerson") {
			return session.parentId;
		}
	}

	customerID = getCustomerId(sessionObject);
	dateFormat = cSession.dateFormat;
	dateHourFormat = cSession.dateAndHourFormat;

	appendCssVariables();

	if (!offices) {
		Office
			.findAll()
			.then(function(response) {
				offices = response;
			}, errorHandle);
	}

	if (!isPrintLayout()) {
		var customerAvatar = null;
		if (cSession.type == "CustomerPerson") {
			customerAvatar = baseURL + 'customers/' + cSession.parentId + '/persons/' + cSession.id + '/image?width=53&height=53&crop=true';
		}

		$("body").html("templates/layouts/main_layout.ejs", {accountName: cSession.name, accountEmail: cSession.email, accountUserType: cSession.type, currentLocale: cSession.locale, salesData: salesDataGlobal, customerAvatar: customerAvatar, brandingChanged: window.brandingChanged});

		try {
			if (salesDataGlobal != null) {
				contactPersons[salesDataGlobal.salesPerson.id] = true;
				contactPersons[salesDataGlobal.pmResponsible.id] = true;

				if (salesDataGlobal.additionalResponsibles != null) {
					$.each(salesDataGlobal.additionalResponsibles, function(index, contact) {
						contactPersons[contact.id] = true;
					});
				}
			}
		} catch (err) {

		}

		if ($("#canvasLoader").length == 0) {
			var cl = new CanvasLoader('loader-new');
			cl.setColor('#ffffff');
			cl.setShape('spiral'); // default is 'oval'
			cl.setDiameter(30); // default is 40
			cl.setDensity(48); // default is 40
			cl.setRange(0.9); // default is 1.3
			cl.setFPS(30); // default is 24
			cl.show(); // Hidden by default
		}

		getPermissions(function(permissions) {
			$.each(permissions, function(index, value) {
				permissionsHash[value.httpMethod][value.path] = 1;
			});

			$.each(permissionsTableSource, function(permissionName, permissionNameArray) {
				$.each(permissionNameArray, function(httpMethod, permissionArray) {
					$.each(permissionArray, function(index, singlePermission) {
						if (!permissionsHash[httpMethod][singlePermission]) {
							permissionsTable[permissionName] = 0;
						}
					});
				});
			});

			if (permissionsTable['projects_browse'] === 0) {
				$("#primary-nav li.projects").addClass('disabled').find("a").removeAttr("href");
			}
			if (permissionsTable['quotes_browse'] === 0) {
				$("#primary-nav li.quotes").addClass('disabled').find("a").removeAttr("href");
			}

			if (permissionsTable['reports_browse'] === 0) {
				$("#primary-nav li.reports").addClass('disabled').find("a").removeAttr("href");
			}

			if (permissionsTable['invoices_browse'] === 0) {
				$("#primary-nav li.invoices").remove();
			}

			if (permissionsTable['resources_browse'] === 0) {
				$('#my-account-menu .account-edit[tab="resources"]').remove();
			}


			if (permissionsTable['resources_browse'] == 0) {
				$("#nav a.account-edit").parent().remove();
			}
			if (permissionsTable['request_quote'] == 0) {
				$(".job-request").addClass('disabled');
				$(".raq").addClass('disabled');
				$(".rap").addClass('disabled');
			}
			if (permissionsTable['company_info_view'] == 0) {
				$("#id-edit").remove();
			}

		});

		$("[data-localize]").localize("i18n/customers", {
			language: cSession.locale,
			callback: function(data, defaultCallback) {
				$.fn.select2.defaults.formatNoMatches = function() {
					return data.general['no-matches-found'] || 'No matches found';
				};
				defaultCallback(data);
			}
		});

		//$(".logo img").attr('src',baseURL+'system/partnerZoneLogo?width=200&height=50&crop=true');
		if (cSession.type == "CustomerPerson") {
			Account.getContactPersonDetails(cSession.id, function(contactPerson) {
				$("#profile-picture img").attr('src', baseURL + 'customers/' + customerID + '/persons/' + cSession.id + '/image?width=63&height=63&crop=true&v=' + contactPerson.version);
			}, function(error) {
			});
		}

		localizeAttribute("#contacts", "data-original-title", "");
		$("#contacts").tooltip({ placement: 'bottom', delay: { show: 500, hide: 0 }});

	}
	$("#logout-link").click(function() {
		logout();
	});
	$("#login-info").html(cSession.name);
	$("a.disabled").live("click", function(e) {
		e.preventDefault();
	});

	hideAds();

	function hideAds() {
		if (settings && settings.adsDisabled) {
			$('#main-footer').hide();
		}
	}

	$.loadFallbackLanguage(fallbackLanguage);

	$.each(['append', 'prepend', 'after', 'before', 'html'], function(i, funcName) {
		if (!$.fn[funcName]) return;
		var old = $.fn[funcName];
		$.fn[funcName] = function() {
			if (typeof this.attr("data-localize") == 'undefined'
				&& !this.hasClass('select2-result')
				&& !this.hasClass('select2-result-label')
				&& !this.hasClass('select2-results')
				&& !this.hasClass('chosen-process')
				&& !this.hasClass('select2-container')
				&& !this.hasClass('select2-search-field')
				) {
				var r = old.apply(this, arguments);
				if ($.cookie("xnl") == "true") {
					if ($(this).find("[data-localize]").length > 0) {
						$.each($(this).find("[data-localize]"), function() {
							$(this).html($(this).data('localize'));
						});
					}
				}
				else {
					if ($(this).find("[data-localize]").length > 0)
						$(this).find("[data-localize]").localize("i18n/customers", { language: cSession.locale });
				}
				return r;
			} else {
				var r = old.apply(this, arguments);
				return r;
			}
		};
	});


	$.Controller("Routing", {
		init: function() {
			$(window).resize($.throttle(setVerticalModalMargin, 600));
			if (contacts != null) {
				contacts.init($("body"), {inSingle: true});
			} else {
				contacts = new Contacts($("body"), {inSingle: true});
			}
		},
		setLay: function(setTo) { //function for changing lay if needed
			if (setTo != $("#main-header").attr('layout')) {

				if (setTo == 'main-layout') {


					var customerAvatar = null;
					if (cSession.type == "CustomerPerson")
						customerAvatar = baseURL + 'customers/' + cSession.parentId + '/persons/' + cSession.id + '/image?width=53&height=53&crop=true';


					$("body").html("templates/layouts/main_layout.ejs", {accountName: cSession.name, accountEmail: cSession.email, accountUserType: cSession.type, salesData: salesDataGlobal, customerAvatar: customerAvatar, brandingChanged: window.brandingChanged });
					$('#contacts-list .wrapper').jScrollPane();

					if ($("#canvasLoader").length == 0) {
						var cl = new CanvasLoader('loader-new');
						cl.setColor('#ffffff');
						cl.setShape('spiral'); // default is 'oval'
						cl.setDiameter(30); // default is 40
						cl.setDensity(48); // default is 40
						cl.setRange(0.9); // default is 1.3
						cl.setFPS(30); // default is 24
						cl.show(); // Hidden by default
					}

					$("#profile-picture img").attr('src', baseURL + 'system/account/image?width=48&height=48&crop=false');

				}
				if (setTo == 'report-print') {
					$("body").html("templates/reports/report_print_view.ejs", {});
					hideAds();
					$(".logo-big img").attr('src', baseURL + 'system/partnerZoneLogo?width=200&height=50&crop=true&v='+window.brandingChanged);
				}
			}

			function hideAds() {
				if (settings && settings.adsDisabled) {
					$('footer').children().hide();
				}
			}
		},
		"#contacts click": function(element) {
			$('#contacts-list .wrapper').jScrollPane();
		},


		"#primary-nav ul li a click": function(element) {
			if (element.parents("li").hasClass('disabled')) return false;
		},
		"#main-footer ul li a click": function(element) {
			if (element.parents("li").hasClass('disabled')) return false;
		},
		"route": function() {
			this.setLay('main-layout');
			setTitle('Dashboard', 'page-titles.dashboard');
			doShowLoader();
			updateMenuActivity("dashboard");
			var data = {targetDiv: $("#main-container")};
			if (dashboards != null) {
				dashboards.init($("body"), data);
			} else {
				dashboards = new Dashboards($("body"), data);
			}
		},
		"xnl_on route": function() {
			$.cookie("xnl", "true");
			window.location.hash = "#!";

		},
		"xnl_off route": function() {
			$.cookie("xnl", null);
			window.location.hash = "#!";
		},
		"hc_on route": function() {
			$.cookie("highcharts", "1");
			window.location.hash = "#!";

		},
		"hc_off route": function() {
			$.cookie("highcharts", null);
			window.location.hash = "#!";
		},

		"invoices/:tab/:page route": function(data) {
			this.loadInvoicesList(data);
		},

		"invoices/:tab/:search/:page route": function(data) {
			var self = this;
			self.loadInvoicesList(data);
		},

		loadInvoicesList: function(data) {
			if ($("#main-container").hasClass('dashboard-container')) $("#main-container").html("");
			doShowLoader();
			if (permissionsTable['invoices_browse'] == 0) {
				accessDeniedRedirect();
				return;
			}
			if (invoices && invoices.options.invoiceDate) {
				data.invoiceDate = invoices.options.invoiceDate;
			}

			this.setLay('main-layout');
			setTitle('Invoices List', 'sections.invoices');
			updateMenuActivity("invoices");


			$("body .section-loader").height($(window).height() - 150);
			$("body").removeClass();
			$("#main-container").removeClass().addClass('container');
			$("#main-container").html("templates/layouts/full_list_view.ejs", {});

			data.targetDiv = $("#main-content");
			if (invoices != null) {
				invoices.init($("body"), data);
			} else {
				invoices = new Invoices($("body"), data);
			}
		},

		loadProjectsList: function(data) {
			var self = this;
			var lastSearch = '';
			try {
				lastSearch = projects.options.search;
			} catch (e) {
			}
			if (projects && projects.options.startDate) {
				data.startDate = projects.options.startDate;
			}
			if (projects && projects.options.deadline) {
				data.deadline = projects.options.deadline;
			}
			if (!isChangedTab() && isCurrentPageAndSearch()) return;

			if ($("#main-container").hasClass('dashboard-container')) $("#main-container").html("");
			doShowLoader();
			if (permissionsTable['projects_browse'] == 0) {
				accessDeniedRedirect();
				return;
			}

			this.setLay('main-layout');
			setTitle('Project List', 'sections.projects');
			if (!$('body').hasClass('projects')) {
				$("body").removeClass();
			}
			$("#main-container").removeClass().addClass('container');
			data['list'] = true;
			$("#main-container").html("templates/layouts/full_list_view.ejs", {});

			$("body .section-loader").height($(window).height() - 150);


			updateMenuActivity("projects");

			data.targetDiv = $("#main-content");
			if (projects != null) {
				projects.init($("body"), data);
			} else {
				projects = new Projects($("body"), data);
			}

			function isCurrentPageAndSearch() {
				if (data.search) {
					return $(".projects-header").length == 1 && self.isCurrentPage(data) && lastSearch == data.search;
				} else {
					return $(".projects-header").length == 1 && self.isCurrentPage(data) && (!lastSearch || lastSearch == '');
				}
			}

			function isChangedTab() {
				return (data.tab == 'active' && isHistoryTab()) || (data.tab == 'history' && !isHistoryTab());
			}

			function isHistoryTab() {
				return $("table.projects.table").length == 1;
			}
		},
		isCurrentPage: function(data) {
			var isCurrentPage = ($('.pagination a[pagenumber="' + data.page + '"]').parent().hasClass('active') || (data.page == 1 && $('.pagination').length === 0));
			return isCurrentPage;
		},
		"projects/:tab/:page route": function(data) {
			var self = this;

			if ($(".project-list-opened").length == 1 && $('.pagination a[pagenumber="' + data.page + '"]').parent().hasClass('active')) {
				if (data.tab == "history" && $("table.projects.table").length == 0) {
					self.loadProjectsList(data); //przypadek w którym chcemy przejsc na zakladke historii
				}
			} else {
				self.loadProjectsList(data);
			}
		},

		"resources route": function(data) {
			var self = this;
			if ($("#main-container").hasClass('dashboard-container')) $("#main-container").html("");
			doShowLoader();
			if (permissionsTable['resources_browse'] == 0) {
				accessDeniedRedirect();
				return;
			}

			self.setLay('main-layout');
			setTitle('Resources List', 'sections.resources');
			if (!$('body').hasClass('resources')) {
				$("body").removeClass();
			}

			$("#main-container").html("templates/layouts/full_list_view.ejs", {});
			data.targetDiv = $("#main-content");

			$("#main-container").removeClass().addClass('container');
			if (resources != null) {
				resources.init($("body"), data);
			} else {
				resources = new Resources($("body"), data);
			}

		},

		"projects/:tab/:search/:page route": function(data) {
			var self = this;
			self.loadProjectsList(data);
		},

		"projects/:tab/:page/task/:taskID/review route": function(data) {
			data.review = true;
			this.projectsTask(data);
		},
		"projects/:tab/:page/task/:taskID route": function(data) {
			this.projectsTask(data);
		},

		"projects/:tab/:search/:page/task/:taskID/review route": function(data) {
			data.review = true;
			this.projectsTask(data);
		},
		"projects/:tab/:search/:page/task/:taskID route": function(data) {
			this.projectsTask(data);
		},

		projectsTask: function(data) {
			var self = this;

			if (isProjectsListView() && self.isCurrentPage(data)) {
				tasksController.openTaskModal(data.taskID, false);
			} else {
				$('#bigModal').remove();
				$(".modal-backdrop").remove();
				self.loadProjectsList(data);
				tasksController.openTaskModal(data.taskID, false);
			}

			function isProjectsListView() {
				return $(".projects-list").length == 1;
			}
		},

		loadSingleProject: function(data) {
			if ($("#main-container").hasClass('dashboard-container')) $("#main-container").html("");

			doShowLoader();
			if (permissionsTable['project_view'] == 0) {
				accessDeniedRedirect();
				return;
			}
			this.setLay('main-layout');
			data['list'] = false;
			$("body").removeClass();
			$("#main-container").removeClass().addClass('container');

			updateMenuActivity("projects");

			data.targetDiv = $("#main-container");
			$("body .section-loader").height($(window).height() - 150);
			if (projects != null) {
				projects.init($("body"), data);
			} else
				projects = new Projects($("body"), data);
			if (contacts != null) {
				contacts.init($("body"), {targetDiv: $("#right-content")});
			} else {
				contacts = new Contacts($("body"), {targetDiv: $("#right-content")});
			}
		},

		"project/:projectID route": function(data) {
			var self = this;
			if ($(".single-project-view").length == 1 && $('.module-project[projectid2="' + data.projectID + '"]').length > 0) {


			} else {
				self.loadSingleProject(data);
			}
		},
		"project/:projectID/task/:taskID route": function(data) {

			this.projectTask(data);
		},
		"project/:projectID/task/:taskID/review route": function(data) {

			data.review = true;
			this.projectTask(data);
		},
		projectTask: function(data) {
			var self = this;
			if (isSingleProjectView()) {
				$('#bigModal').remove();
				$(".modal-backdrop").remove();
				tasksController.openTaskModal(data.taskID, false);
			} else {
				self.loadSingleProject(data);
				tasksController.openTaskModal(data.taskID, false);
			}
			function isSingleProjectView() {
				return $(".single-project-view").length == 1 && $('.module-project[projectid2="' + data.projectID + '"]').length > 0;
			}
		},

		"quotes/:tab/:page route": function(data) {
			var self = this;
			self.loadQuotesList(data);
		},

		"quotes/:tab/:search/:page route": function(data) {
			var self = this;
			self.loadQuotesList(data);
		},

		loadQuotesList: function(data) {
			if ($("#main-container").hasClass('dashboard-container')) $("#main-container").html("");
			doShowLoader();
			if (permissionsTable['quotes_browse'] == 0) {
				accessDeniedRedirect();
				return;
			}
			if (quotes && quotes.options.createdOn) {
				data.createdOn = quotes.options.createdOn;
			}
			if (quotes && quotes.options.expirationDate) {
				data.expirationDate = quotes.options.expirationDate;
			}

			this.setLay('main-layout');
			setTitle('Quotes', 'sections.quotes');
			$("body").removeClass();
			$("#main-container").removeClass().addClass('container');
			data['list'] = true;
			if (isNotOnQuotesPage()) {
				$("body .section-loader").height($(window).height() - 150);
				$("#main-container").html("templates/layouts/full_list_view.ejs", {});
			}

			updateMenuActivity("quotes");
			data['targetDiv'] = $("#main-content");
			if (quotes != null) {
				quotes.init($("body"), data);
			} else {
				quotes = new Quotes($("body"), data);
			}
			function isNotOnQuotesPage() {
				return  $("#quotes-header").length === 0;
			}
		},
		"quote/:quoteID route": function(data) {
			if ($("#main-container").hasClass('dashboard-container')) $("#main-container").html("");
			doShowLoader();
			if (permissionsTable['quote_view'] == 0) {
				accessDeniedRedirect();
				return;
			}
			this.setLay('main-layout');
			data['list'] = false;
			$("#main-container").removeClass().addClass('container');

			updateMenuActivity("quotes");

			data['targetDiv'] = $("#main-container");
			$("body .section-loader").height($(window).height() - 150);
			if (quotes != null) {
				quotes.init($("body"), data);
			} else {
				quotes = new Quotes($("body"), data);
			}
			if (contacts != null) {
				contacts.init($("body"), {inSingle: true});
			} else {
				contacts = new Contacts($("body"), {inSingle: true});
			}
		},

		"reports/:page route": function(data) {
			if ($("#main-container").hasClass('dashboard-container')) $("#main-container").html("");
			doShowLoader();
			if (permissionsTable['reports_browse'] == 0) {
				accessDeniedRedirect();
				return;
			}
			this.setLay('main-layout');

			setTitle('Reports', 'sections.reports');

			$("body").removeClass();
			$("#main-container").removeClass().addClass('container');
			data['list'] = true;

			if (!$("#right-content").length > 0) {
				//$("body").append(bigLoaderString);
				$("body .section-loader").height($("body").height());
				$("#main-container").html("templates/layouts/list_view.ejs", {});
				if (contacts != null) {
					contacts.init($("body"), {targetDiv: $("#right-content")});
				} else {
					contacts = new Contacts($("body"), {targetDiv: $("#right-content")});
				}
			}
			updateMenuActivity("reports");
			data['targetDiv'] = $("#left-content");
			if (reportsController != null) {
				reportsController.init($("body"), data);
			} else {
				reportsController = new Reports($("body"), data);
			}
		},
		"report/:id/:officeId/:type route": function(data) {
			if ($("#main-container").hasClass('dashboard-container')) $("#main-container").html("");
			doShowLoader();
			if (permissionsTable['reports_browse'] == 0) {
				accessDeniedRedirect();
				return;
			}
			this.setLay('main-layout');

			$("#main-container").removeClass().addClass('container');

			setTitle('Report View', 'page-titles.report-view');
			data['list'] = false;

			updateMenuActivity("reports");

			data['targetDiv'] = $("#main-container");
			//$("body").append(bigLoaderString);
			$("body .section-loader").height($(window).height() - 150);
			if (reportsController != null) {
				reportsController.init($("body"), data);
			} else {
				reportsController = new Reports($("body"), data);
			}

		},
		"report/:id/:officeId route": function(data) {
			if ($("#main-container").hasClass('dashboard-container')) $("#main-container").html("");
			doShowLoader();
			if (permissionsTable['reports_browse'] == 0) {
				accessDeniedRedirect();
				return;
			}
			data.type = "table";
			this.setLay('main-layout');

			setTitle('Report View', 'page-titles.report-view');
			data['list'] = false;
			$("#main-container").removeClass().addClass('container');

			updateMenuActivity("reports");

			data['targetDiv'] = $("#main-container");
			//$("body").append(bigLoaderString);
			$("body .section-loader").height($(window).height() - 150);
			if (reportsController != null) {
				reportsController.init($("body"), data);
			} else {
				reportsController = new Reports($("body"), data);
			}

		},
		"report/:id/:officeId/print/:type route": function(data) {
			if ($("#main-container").hasClass('dashboard-container')) $("#main-container").html("");
			if (permissionsTable['reports_browse'] == 0) {
				accessDeniedRedirect();
				return;
			}
			setTitle('Report Print View', 'page-titles.report-print-view');
			this.setLay('report-print');
			$("body").removeClass().addClass('single-view').addClass('single-report-view').addClass('report-print-view');
			$("#main-container").removeClass().addClass('container');
			data['print'] = true;


			if (reportsController != null) {
				reportsController.init($("body"), data);
			} else {
				reportsController = new Reports($("body"), data);
			}


		},
		"loading route": function(data) {
			this.setLay('main-layout');
			$("body #main-container").html("");
		},

		".modal-close click": function() {
			$("#myModal").modal('hide');
		},

		".raq click": function(element) {
			if (element.hasClass('disabled')) return false;
			if (!element.hasClass('loading')) {
				element.addClass('loading');
				if (element.attr("id") == "quote-request") {
					element.parent().addClass("loading");
					element.parent().parent().find(".icon-loader-request").css("display", "inline-block");
				}
				if (requestQuoteController == null) {
					requestQuoteController = new RequestQuote(document.body);
					requestQuoteController.requestQuote(element, false);
				} else {
					requestQuoteController.requestQuote(element, false);
				}
			}
			return false;
		},
		".rap click": function(element) {
			if (element.hasClass('disabled')) return false;
			if (!element.hasClass('loading')) {
				element.addClass('loading');
				if (element.attr("id") == "quote-request" || element.attr("id") == "project-request") {
					element.parent().addClass("loading");
					element.parent().parent().find(".icon-loader-request").css("display", "inline-block");
				}
				if (requestQuoteController == null) {
					requestQuoteController = new RequestQuote(document.body);
					requestQuoteController.requestQuote(element, true);
				} else {
					requestQuoteController.requestQuote(element, true);
				}
			}
			return false;
		},

		".account-edit click": function(element) {
			if (element.hasClass('disabled') || element.parents('li').hasClass('disabled')) return false;
			var accountOptions = {};
			accountOptions.tab = element.attr("tab");

			$("#my-account").addClass('loading');

			if (account.account != null) {
				account.account.init($("body"), accountOptions);
			} else {
				account.account = new AccountController($("body"), accountOptions);
			}
		},
		"#display-tour click": function(element) {
			if (tourController == null) {
				tourController = new TourController($("body"));
			} else {
				tourController.showDialog($("body"));
			}
		}

	});


	route2 = new Routing(document.body);

	helperController = new Helper(document.body);
	setTimeout("$.route.ready(true);", 300);
	if (cSession.displayTutorial == true && (location.hash == "#!" || location.hash == "" ) && $.cookie("showtutorial") != "no") {
		$.cookie("showtutorial", "no");
		tourController = new TourController($("body"));
	}

	function isPrintLayout() {
		return location.hash.indexOf('/print/') != '-1';
	}

}


function logout() {
	$.cookie("jsessionid", null);
	$.cookie("showtutorial", null);
	$.ajax({
		url: baseURL + 'system/logout',
		dataType: 'json',
		xhrFields: { withCredentials: true},
		success: function(httpObj) {
			location.href = "index.html";
			getSession();
		}
	});
}

function fillSession(httpObj) {

	if (httpObj == null) {
		var hash = window.location.hash
		$.cookie('hash', hash);
		location.href = "index.html";
		return;
	}
	$("body .overlay").remove();
	$("#all-content").css('display', 'block');
	if ($.cookie('hash') != null) {
		var hash = $.cookie('hash');
		$.cookie('hash', null);
		location.href = "main.html" + hash;
	}
	readyPage(httpObj);
}

function queryBuilder(params) {
	queryString = "";
	$.each(params, function(index, value) {
		valueArray = value.toString().split('|');
		$.each(valueArray, function(index2, value2) {
			queryString += index + "=" + encodeURIComponent(value2) + "&";
		});
		// queryString+=index+"="+value+"&";
	});
	if (queryString.length > 0) {
		queryString = "?" + queryString;
		queryString = queryString.substr(0, queryString.length - 1);
	}
	return queryString;

}


function appendPagination(element, urlAddress, paginationArray, options) {


	paginationArray["urlAddress"] = urlAddress;
	if (paginationArray.numberOfPages > 1)
		element.append("templates/pagination/pagination.ejs", paginationArray);
}

function appendModal() {

}

function setDefaultLogo(img) {
	img.src = baseURL + 'branding/images?type=BRANDING_IMAGE';
}

function setDefaultAvatar(img) {
	img.src = "static/img/js_img/default/avatar.png";
}

function setDefaultMainAvatar(img) {
	img.src = "static/img/js_img/default/a63n.png";
}

function setDefaultAvatar2(img) {
	img.src = "static/img/js_img/default/a63n.png";
}


function dateFromUTC(dateAsString, ymdDelimiter) {
	var pattern = new RegExp("(\\d{4})" + ymdDelimiter + "(\\d{2})" + ymdDelimiter + "(\\d{2}) (\\d{2}):(\\d{2}):(\\d{2})");
	var parts = dateAsString.match(pattern);

	return new Date(Date.UTC(
		parseInt(parts[1])
		, parseInt(parts[2], 10) - 1
		, parseInt(parts[3], 10)
		, parseInt(parts[4], 10)
		, parseInt(parts[5], 10)
		, parseInt(parts[6], 10)
		, 0
	));
}

function errorHandle(error, error2) {
	if (!$("#myModal").hasClass('unauthorized')) {
		$("#myModal").remove();


		if (error2) {
			if (error2 == "no-data") {
				$(".modal-backdrop").remove();
				$("body").append('templates/errors/error2.ejs', {});
				$("#myModal .modal-body").html('<span data-localize="reports.no-data">There is not enough data to draw the chart!</span>');
				$('#myModal').on('hidden', function() {
					$('#myModal').remove();
					$(".modal-backdrop").remove();
				});
				$("#myModal .btn-close").click(function() {
					$("#myModal").modal('hide');
				});
				$("#myModal").modal('show');
			} else {
				$(".modal-backdrop").remove();
				$("body").append('templates/errors/error.ejs', {});
				$("#myModal .modal-body").html(error2.message);
				$("#myModal").modal('show');
			}
		} else {
			if (error.status == 401) {

				if ($("#bigModal").length > 0) {
					$(".modal-backdrop").fadeOut(500);
					$("#bigModal").fadeOut(500, function() {
						$("#bigModal").detach();
						if ($("#myModal.unauthorized").length == 0) {
							$("#myModal").remove();
							$("body").append('templates/errors/unauthorized.ejs', {});
							$('#myModal').on('hidden', function() {
								location.href = "index.html";
							});
							$("#myModal").modal('show');
						}
						;
					});
				} else {
					if ($("#myModal.unauthorized").length == 0) {
						$(".modal-backdrop").remove();
						$("#myModal").remove();
						$("body").append('templates/errors/unauthorized.ejs', {});
						$('#myModal').on('hidden', function() {
							location.href = "index.html";
						});
						$("#myModal").modal('show');
					}
				}


			} else if (error.status == 403) {
				$(".modal-backdrop").remove();
				$("body").append('templates/errors/error_403.ejs', {});
				$("#myModal .btn-close").click(function() {
					$("#myModal").modal('hide');
				});

				$('#myModal').on('hidden', function() {
					$('#myModal').remove();
					$(".modal-backdrop").remove();

				});
				$("#myModal").modal('show');

			} else if (error.status === 'google-unreachable') {
				$(".modal-backdrop").remove();
				$("body").append('templates/errors/error_google_charts.ejs', {});
				$("#myModal .btn-close").click(function() {
					$("#myModal").modal('hide');
				});

				$('#myModal').on('hidden', function() {
					$('#myModal').remove();
					$(".modal-backdrop").remove();

				});
				$("#myModal").modal('show');
			} else {
				$(".modal-backdrop").remove();
				$("body").append('templates/errors/error.ejs', {});
				$('#myModal').on('hidden', function() {
					$('#myModal').remove();
					$(".modal-backdrop").remove();
				});

				$("#myModal").modal('show');
			}
		}

	}
}

function dashboardErrorHandle(error) {

	if ($("#myModal.unauthorized").length == 0) {


		if (error.status == 401) {
			$("#myModal").remove();
			$("body").append('templates/errors/unauthorized.ejs', {});
			$('#myModal').on('hidden', function() {
				location.href = "index.html";
			});
			$("#myModal").modal('show');
			$("#myModal").addClass('unauthorized');


		}
	}
}


function resizeFixedModal(modalWindow, animate) {
	var modalBody = modalWindow.find('.modal-body');
	var offset = modalWindow.height() - $(window).height();
	if (offset < 0) {
		if (modalWindow.hasClass("modal-my-account")) {

			modalBody.height(590);
		} else {
			modalBody.height(464);
		}
	} else if ($(window).height() < 481) {
		modalBody.height(250)
	} else {
		if (animate) {
			modalBody.animate({
				height: modalBody.height() - offset - 15
			});
		} else {
			modalBody.height(modalBody.height() - offset - 15)
		}
	}
}


function setBreadcrumb(bcArray) {
	var bcString = "";
	var bcLength = bcArray.length;
	$.each(bcArray, function(index, value) {
		if (index != (bcLength - 1))
			bcString += '<li><a data-localize="' + value.localize + '" href="' + value.link + '">' + value.name + '</a></li>';
		else
			bcString += '<li data-localize="' + value.localize + '">' + value.name + '</li>';
	});
	$(".breadcrumb").html(bcString);
}

function localizeAttribute(selector, attribute, localizeString) {


	$("body").append('<span id="temp1" style="display:none;" data-localize="' + $(selector).attr("data-localize-2") + '"></span>');
	if ($.cookie("xnl") == "true")
		$.each($("#temp1[data-localize]"), function() {
			$(this).html($(this).data('localize'));
		});
	else
		$("#temp1[data-localize]").localize("i18n/customers", { language: sessionObject.locale });
	if ($("#temp1").html() != "")
		$(selector).attr(attribute, $("#temp1").html());
	$("#temp1").remove();
}

function getPermissions(success, error) {
	return $.ajax({
		url: baseURL + 'api/resources' + addToURL,
		dataType: 'json',
		type: "GET",
		xhrFields: { withCredentials: true},
		success: success,
		error: error
	});
}

function bindViewDownload(element) {

	var confTimeout;
	var target = element.find(".confirmation-download");
	if (element.parent().hasClass("invoices")) {
		var isInvoicesWidget = true;
	}
	target.bind("mouseenter", function() {
		var self = $(this);

		confTimeout = setTimeout(function() {
			if (isInvoicesWidget) {
				element.parents(".gs_w").css('z-index', "99");
			}
			self.find(".tools").stop(true, true).fadeIn(50);
			var topP = Math.floor((self.offset().top - $(window).scrollTop() + 0.9 * self.height()));
			if ($("body").hasClass("invoices")) {
				topP -= Math.floor(0.9 * self.height()) + 4;
			}
			if ((topP + self.find(".tools").height()) > $(window).height()) {
				topP = Math.floor((self.offset().top - $(window).scrollTop() - self.find(".tools").height()));
			}
			self.find(".tools").css({
				top: topP,
				left: $("body").hasClass("invoices") ? self.offset().left - 3 : self.offset().left
			});

		}, 400);
	});
	target.bind("mouseleave", function() {
		if (isInvoicesWidget) {
			element.parents(".gs_w").css('z-index', '');
		}
		var self = $(this);
		clearTimeout(confTimeout);
		self.find(".tools").stop(true, true).fadeOut(50);
	});

	if (target.hasClass("confirmation-download-project")) {
		target.bind("click", function(event) {
			if (event.stopPropagation) {
				event.stopPropagation();
			} else {
				event.cancelBubble = true;
			}
		});
	}
}

function updateMenuActivity(element) {
	if (element === null) {
		$("#primary-nav ul li").removeClass('active');
		$("#primary-nav").find(".indicator").hide();
	} else {
		if (element != "dashboard" && $("#main-header .container .btn-add-widget").length != 0) {
			$("#main-header .container .btn-add-widget").detach();
		}
		$("#primary-nav ul li").removeClass('active');
		$("#primary-nav ul").find("." + element).addClass('active');
		var activeElement = $("#primary-nav ul").find("." + element);
		$("#primary-nav").find(".indicator").show();
		if (activeElement) {
			$("#primary-nav").find(".indicator").css("left", (activeElement.position().left + activeElement.width() / 2 - 7) + "px");
		}
	}
}
function unbindViewDownload(element) {
	element.find(".confirmation-download").unbind("mouseenter");
	element.find(".confirmation-download").unbind("mouseleave");
}

function accessDeniedRedirect() {
	location.hash = "#!";
	$("body").append('templates/errors/error_403.ejs', {});
	$("#myModal .btn-close").click(function() {
		$("#myModal").modal('hide');
	});

	$('#myModal').on('hidden', function() {
		$('#myModal').remove();
		$(".modal-backdrop").remove();

	});
	$("#myModal").modal('show');
	return;
}

function drawChartTest(categoriesV, seriesV, placeholder, legendLength, chartType, onDashboard) {
	var mBottom = 0;
	var xRotation = 0;
	var mLeft = 200;
	var mTop = 20;
	var legendHeight = 200;
	if (legendLength > 0) {
		mBottom = 30;
	}
	if (legendLength > 7) {
		mBottom = 65;
		xRotation = -30;
	}

	if (legendLength > 15) {
		mBottom = 100;
		xRotation = -45;
	}

	if (chartType == 'pie') {
		mBottom = 20;
		mLeft = 0;
		mTop = 20;
	}


	if (!onDashboard) {
		legendHeight = 460;
	}


	var chart;
	$(document).ready(function() {
		chart = new Highcharts.Chart({
			chart: {
				renderTo: placeholder,
				type: chartType,
				marginLeft: mLeft,
				zoomType: 'xy',
				marginBottom: mBottom,
				marginTop: mTop
			},
			title: {
				text: '',
				x: -20 //center
			},
			subtitle: {
				text: '',
				x: -20
			},
			xAxis: {
				categories: categoriesV,
				minRange: 0.1,
				labels: {
					rotation: xRotation,
					align: 'right'

				}

			},
			yAxis: {
				title: {
					text: ''
				},
				plotLines: [
					{
						value: 0,
						width: 1,
						color: '#808080'
					}
				]
			},
			tooltip: {
				formatter: function() {
					return '<b>' + this.series.name + '</b><br/>' +
						this.x + ': ' + this.y + '';
				}
			},
			legend: {
				layout: 'vertical',
				align: 'left',
				verticalAlign: 'top',
				x: 0,
				y: 0,
				borderWidth: 0,
				useHTML: true,
				maxHeight: legendHeight



			},
			plotOptions: {
				line: {
					marker: {
						enabled: false
					}
				}
			},


			series: seriesV
		});
	});

	$.each($("div.highcharts-legend-item span"), function() {
		if ($(this).html().length > 16) {
			var oldHTML = $(this).html();
			$(this).html('<a title="' + $(this).html() + '">' + $(this).html().substr(0, 16) + '...</a>');
			$(this).find('a').tooltip({animation: true, placement: 'right'});


		}
	});
	if (onDashboard) {

		$(".highcharts-legend").css('width', 400);
		$(".highcharts-legend").css('height', legendHeight - 10);
		$(".highcharts-legend").css('overflow', 'hidden');


		$(".module-reports .overlay").remove();
	} else {
		$(".highcharts-legend").css('width', 400);
		$(".highcharts-legend").css('height', legendHeight - 10);
		$(".highcharts-legend").css('overflow', 'hidden');
	}

}

function doShowLoader() {
	showLoader = 1;
	setTimeout(function() {
		if (showLoader == 1) {
			$(".main-loader").height($(window).height()).width($(window).width()).css('display', 'block');
		}
	}, 400);
}

function dontShowLoader() {
	showLoader = 0;
	$(".main-loader").css('display', 'none');
}
function setVerticalModalMargin() {
	if ($("#primary-nav ul li.active").position() != null)
		$("#primary-nav").find(".indicator").css("left", ($("#primary-nav ul li.active").position().left + $("#primary-nav li.active").width() / 2 - 7) + "px");

	if ($(".modal-iconic").length > 0) {
		$(".modal-iconic").css('top', '0');
		if ($(window).height() > $(".modal-iconic").height()) {
			$(".modal-iconic").css('margin-top', ($(window).height() - $(".modal-iconic").height()) / 2 + "px");
		} else {
			$(".modal-iconic").css('margin-top', "0");
		}
	}
}

function escapeDiacritics(toReplace) {
	var diacriticsMap = [
		{'base': 'A', 'letters': /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
		{'base': 'AA', 'letters': /[\uA732]/g},
		{'base': 'AE', 'letters': /[\u00C4\u00C6\u01FC\u01E2]/g},
		{'base': 'AO', 'letters': /[\uA734]/g},
		{'base': 'AU', 'letters': /[\uA736]/g},
		{'base': 'AV', 'letters': /[\uA738\uA73A]/g},
		{'base': 'AY', 'letters': /[\uA73C]/g},
		{'base': 'B', 'letters': /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
		{'base': 'C', 'letters': /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
		{'base': 'D', 'letters': /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
		{'base': 'DZ', 'letters': /[\u01F1\u01C4]/g},
		{'base': 'Dz', 'letters': /[\u01F2\u01C5]/g},
		{'base': 'E', 'letters': /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
		{'base': 'F', 'letters': /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
		{'base': 'G', 'letters': /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
		{'base': 'H', 'letters': /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
		{'base': 'I', 'letters': /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
		{'base': 'J', 'letters': /[\u004A\u24BF\uFF2A\u0134\u0248]/g},
		{'base': 'K', 'letters': /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
		{'base': 'L', 'letters': /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
		{'base': 'LJ', 'letters': /[\u01C7]/g},
		{'base': 'Lj', 'letters': /[\u01C8]/g},
		{'base': 'M', 'letters': /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
		{'base': 'N', 'letters': /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
		{'base': 'NJ', 'letters': /[\u01CA]/g},
		{'base': 'Nj', 'letters': /[\u01CB]/g},
		{'base': 'O', 'letters': /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
		{'base': 'OE', 'letters': /[\u00D6\u0152]/g},
		{'base': 'OI', 'letters': /[\u01A2]/g},
		{'base': 'OO', 'letters': /[\uA74E]/g},
		{'base': 'OU', 'letters': /[\u0222]/g},
		{'base': 'P', 'letters': /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
		{'base': 'Q', 'letters': /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
		{'base': 'R', 'letters': /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
		{'base': 'S', 'letters': /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
		{'base': 'T', 'letters': /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
		{'base': 'TZ', 'letters': /[\uA728]/g},
		{'base': 'U', 'letters': /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
		{'base': 'UE', 'letters': /[\u00DC]/g},
		{'base': 'V', 'letters': /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
		{'base': 'VY', 'letters': /[\uA760]/g},
		{'base': 'W', 'letters': /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
		{'base': 'X', 'letters': /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
		{'base': 'Y', 'letters': /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
		{'base': 'Z', 'letters': /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
		{'base': 'a', 'letters': /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
		{'base': 'aa', 'letters': /[\uA733]/g},
		{'base': 'ae', 'letters': /[\u00E4\u00E6\u01FD\u01E3]/g},
		{'base': 'ao', 'letters': /[\uA735]/g},
		{'base': 'au', 'letters': /[\uA737]/g},
		{'base': 'av', 'letters': /[\uA739\uA73B]/g},
		{'base': 'ay', 'letters': /[\uA73D]/g},
		{'base': 'b', 'letters': /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
		{'base': 'c', 'letters': /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
		{'base': 'd', 'letters': /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
		{'base': 'dz', 'letters': /[\u01F3\u01C6]/g},
		{'base': 'e', 'letters': /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
		{'base': 'f', 'letters': /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
		{'base': 'g', 'letters': /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
		{'base': 'h', 'letters': /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
		{'base': 'hv', 'letters': /[\u0195]/g},
		{'base': 'i', 'letters': /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
		{'base': 'j', 'letters': /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
		{'base': 'k', 'letters': /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
		{'base': 'l', 'letters': /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
		{'base': 'lj', 'letters': /[\u01C9]/g},
		{'base': 'm', 'letters': /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
		{'base': 'n', 'letters': /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
		{'base': 'nj', 'letters': /[\u01CC]/g},
		{'base': 'o', 'letters': /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
		{'base': 'oe', 'letters': /[\u00F6\u0153]/g},
		{'base': 'oi', 'letters': /[\u01A3]/g},
		{'base': 'ou', 'letters': /[\u0223]/g},
		{'base': 'oo', 'letters': /[\uA74F]/g},
		{'base': 'p', 'letters': /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
		{'base': 'q', 'letters': /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
		{'base': 'r', 'letters': /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
		{'base': 's', 'letters': /[\u0073\u24E2\uFF53\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
		{'base': 'ss', 'letters': /[\u00DF]/g},
		{'base': 't', 'letters': /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
		{'base': 'tz', 'letters': /[\uA729]/g},
		{'base': 'u', 'letters': /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
		{'base': 'ue', 'letters': /[\u00FC]/g},
		{'base': 'v', 'letters': /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
		{'base': 'vy', 'letters': /[\uA761]/g},
		{'base': 'w', 'letters': /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
		{'base': 'x', 'letters': /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
		{'base': 'y', 'letters': /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
		{'base': 'z', 'letters': /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
	];

	for (var i = 0; i < diacriticsMap.length; i++) {
		toReplace = toReplace.replace(diacriticsMap[i].letters, diacriticsMap[i].base);
	}

	return toReplace;
}
