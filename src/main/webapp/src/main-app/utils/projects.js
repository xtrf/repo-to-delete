steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	'./files.js',
	'./offices.js',
	'./tasks.js',

	function($) {
		$.Model('Project', {
			findAll: function(params, success, error) {
				var queryString = queryBuilder(params);
				return $.ajax({
					url: baseURL + 'projects' + addToURL + queryString,
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			count: function(params, success, error) {
				var queryString = queryBuilder(params);
				return $.ajax({
					url: baseURL + 'projects/count' + addToURL.substr(5) + queryString,
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},

			findOne: function(projectID, success, error) {
				return $.ajax({
					url: baseURL + 'projects/' + projectID + addToURL,
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			getFeedback: function(projectID, success, error) {
				return $.ajax({
					url: baseURL + 'projects/' + projectID + '/feedback' + addToURL,
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			postFeedback: function(projectID, feedbackData, success, error) {
				return $.ajax({
					type: "POST",
					contentType: "application/json",
					url: baseURL + 'projects/' + projectID + '/feedback' + addToURL.substr(5),
					dataType: 'json',
					data: JSON.stringify(feedbackData),
					xhrFields: { withCredentials: true},
					success: success,
					error: error,
					cache: false
				});
			},
			sendFeedback: function(projectID, feedbackData, success, error) {
				return $.ajax({
					type: "POST",
					contentType: "application/json",
					url: baseURL + 'projects/' + projectID + '/quality-assurance/feedback' + addToURL.substr(5),
					dataType: 'json',
					data: JSON.stringify(feedbackData),
					xhrFields: { withCredentials: true},
					success: success,
					error: error,
					cache: false
				});
			},
			updateOffice: function(id, changeOffice, success, error) {
				return $.ajax({
					url: baseURL + 'projects/' + id + '/office' + addToURL.substr(5),
					type: 'PUT',
					contentType: 'application/json',
					dataType: 'json',
					xhrFields: { withCredentials: true},
					data: JSON.stringify(changeOffice),
					success: success,
					error: error
				});
			}
		}, {});

		$.Controller("Projects", {
			project: {},
			tasks: [],
			init: function(element, options) {
				this.options.targetDiv = options.targetDiv;

				if (filesController == null) {
					filesController = new Files(document.body);
				}
				if (tasksController == null) {
					tasksController = new Tasks(document.body);
				}
				if (options.list == true) {
					this.showProjects(options.targetDiv, options);
				}
				else {
					this.showSingleProject(options.targetDiv, options);
				}
			},
			showSingleProject: function(element, options) {
				var self = this;
				Project.findOne(options.projectID, function(project) {
					project.availableCustomFields = _.where(project.customFields, {availableForCustomerPortal: true});

					project.showCustomFields = function() {
						return _.any(project.availableCustomFields, function(customField) { return customField.value; })
					};
					self.project = project;

					setTitle('Project', 'page-titles.project', project.idNumber);

					project.projectManager.avatar = baseURL + 'users/' + project.projectManager.id + '/image';
					if (typeof project.contactPersons != 'undefined' && project.contactPersons != undefined)
						project.contactPerson = { avatar: baseURL + 'customers/' + customerID + '/persons/' + project.contactPersons.contactPerson.id + '/image?width=48&height=48&crop=true' };

					var cDate = new Date();
					var widthOfBar = 0;
					if (project.deadline != null)
						widthOfBar = Math.floor((cDate.getTime() - project.startDate.millisGMT) / (project.deadline.millisGMT - project.startDate.millisGMT) * 100);
					if (widthOfBar > 100) widthOfBar = 100;
					if (widthOfBar < 0) widthOfBar = 0;

					element.html("templates/projects/project_single.ejs", {"project": project, "barWidth": widthOfBar});

					localizeAttribute(".excl-vat", "title", "");
					localizeAttribute(".excl-vat", "data-original-title", "");
					localizeAttribute(".send-back-to-item", "title", "");
					localizeAttribute(".send-back-to-item", "data-original-title", "");


					if (project.status == "CANCELLED" || project.status == "CLOSED") {
						$("a.tasks-tab-link").addClass('loading');
						if (lastPage != 0 && lastPage != "0") {
							$("a.return-button").attr("href", "#!projects/history/" + lastPage);
							$("a.link-return").attr("href", "#!projects/history/" + lastPage);
							lastPage = 0;
						} else {
							$("a.return-button").attr("href", "#!projects/history/1");
							$("a.link-return").attr("href", "#!projects/history/1");
						}
					} else {
						if (lastPage != 0 && lastPage != "0") {
							$("a.return-button").attr("href", "#!projects/active/" + lastPage);
							$("a.link-return").attr("href", "#!projects/active/" + lastPage);

							lastPage = 0;
						}
					}

					$("body").addClass('single-view');

					var projectDiv = element.find(".module-project");
					var projectSummaryDiv = element.find(".module-summary");
					var projectID = $.trim(element.find(".module-project").attr("projectID2"));

					//if(project.hasInputWorkfiles==true && project.hasInputResources==true)
					if (typeof options.taskID != 'undefined') {
						if (typeof options.review != 'undefined')
							tasksController.loadTasks(projectID, projectDiv, 1, false, 1, project.totalAgreed.formattedAmount, options.taskID, true);
						else
							tasksController.loadTasks(projectID, projectDiv, 1, false, 1, project.totalAgreed.formattedAmount, options.taskID);
					} else {
						tasksController.loadTasks(projectID, projectDiv, 1, false, 1, project.totalAgreed.formattedAmount);
					}

					$(".notes-placeholder").html(helperController.stripTags(project.customerNotes));
					$('.notes-placeholder').linkify({target: "_blank"});
					$("#download-confirmation, #download-confirmation-view").attr('href', baseURL + "projects/" + projectID + "/confirmation?inline=true");
					$("#download-confirmation-download").attr('href', baseURL + "projects/" + projectID + "/confirmation");
					setBreadcrumb([
						{"name": "Dashboard", "link": "#!", "localize": "sections.dashboard"},
						{"name": "Projects", "link": "#!projects/active/1", "localize": "sections.projects"},
						{"name": project.idNumber}
					]);
					$(".tooltip").detach();
					$("[rel=tooltip]").tooltip();
					$("[rel=tooltip]").on('click', function() {
						$(this).tooltip('hide');
					});

					if (pdf_info.acrobat != null) {
						bindViewDownload(projectSummaryDiv);
					}
					if (typeof options.taskID != 'undefined') {


					}
					dontShowLoader();


				}, function(error) {
					if (window.location.hash.includes('!project/')) {
						location.hash = "#!projects/active/1";
					}
					dontShowLoader();
				});
			},
			"#search-projects submit": function() {
				var searchIdAndNameInput = $("#search-projects").find('input[name="id-and-name"]');

				var self = this;
				try {
					self.options.lastSearch = decodeURIComponent(self.options.search);
				} catch (e) {
					self.options.lastSearch = '';
				}
				if (searchPhraseNotChanged()) {
					self.showProjects(self.options.targetDiv, self.options);
				} else {
					if ($.trim(searchIdAndNameInput.val()) !== '') {
						location.hash = "projects/" + this.options.tab + "/" + encodeURIComponent(searchIdAndNameInput.val()) + "/1";
					}
					else {
						location.hash = "projects/" + this.options.tab + "/1";
					}
				}
				return false;

				function searchPhraseNotChanged() {
					return self.options.lastSearch == $.trim(searchIdAndNameInput.val());
				}
			},
			"#search-projects #clear-search click": function() {
				var self = this;
				try {
					self.options.lastSearch = decodeURIComponent(self.options.search);
				} catch (e) {
					self.options.lastSearch = '';
				}
				location.hash = "projects/" + this.options.tab + "/1";
				$("#search-projects").find('input').val('');
				return false;
			},
			clearDatePicker: function(datePickerName) {
				var targetPicker = $('input[name="' + datePickerName + '"]');
				this.options[datePickerName] = null;
				targetPicker.val('');
				targetPicker.data('daterangepicker').setStartDate('');
				targetPicker.data('daterangepicker').setEndDate('');
			},
			".projects-header .clear-datepicker click": function(element) {
				var targetPickerName = element.data('target');
				this.clearDatePicker(targetPickerName);
				this.showProjects(this.options.targetDiv, this.options);
			},
			".module-project .clear-criteria click": function() {
				this.clearDatePicker('startDate');
				this.clearDatePicker('deadline');
				if (this.options.search) {
					location.hash = "projects/" + this.options.tab + "/1";
				} else {
					this.showProjects(this.options.targetDiv, this.options);
				}

			},
			".projects-header #tab-active click": function() {
				if (this.options.search) {
					location.hash = "projects/active/" + this.options.search + "/1";
				} else {
					location.hash = "projects/active/1";
				}
				return false;
			},
			".projects-header #tab-history click": function() {
				if (this.options.search) {
					location.hash = "projects/history/" + this.options.search + "/1";
				} else {
					location.hash = "projects/history/1";
				}
				return false;
			},

			showProjects: function(element, options) {
				doShowLoader();
				var self = this;
				self.options = options;
				var statusFromTab = "OPENED|CLAIM|CLOSED|CANCELLED";
				var itemsPerPage;
				var offset;
				var pageLimit;
				if (options.tab == "history") {
					pageLimit = historyPageLimit;
					statusFromTab = "CLOSED|CANCELLED";
					itemsPerPage = historyPageLimit;
					offset = pageLimit * (options.page - 1);
				}
				if (options.tab == "active") {
					pageLimit = defaultPageLimit;
					statusFromTab = "OPENED|CLAIM|REQUESTED_PROJECT";
					itemsPerPage = pageLimit;
					offset = pageLimit * (options.page - 1);
				}

				var projectsDatePickers = [
					{name: 'startDate', from: 'startDateFrom', to: 'startDateTo'},
					{name: 'deadline', from: 'deadlineFrom', to: 'deadlineTo'}
				];

				var projectsOptions = {"status": statusFromTab, "start": offset, "limit": itemsPerPage};
				var countOptions = {"status": statusFromTab};

				var dateRangePickers = new DateRangePickerFactory(projectsDatePickers, this, countOptions, projectsOptions, this.showProjects);

				if (options.search) {
					try {
						projectsOptions.search = decodeURIComponent(options.search);
						countOptions.search = decodeURIComponent(options.search);
					} catch (err) {
						location.hash = "";
					}
				}

				dateRangePickers.init();

				$.when(
						Project.count(countOptions),
						Project.findAll(projectsOptions)
					)
					.done(function(projectCountArgs, projectArgs) {
						var countProjects = projectCountArgs[0];
						var projects = projectArgs[0];
						options.projectCount = countProjects;

						$.each(projects, function(index, value) {
							projects[index].confirmationLink = baseURL + "projects/" + value.id + "/confirmation";
						});

						$.each(projects, function(index, value) {
							if (value.name != null && value.name != "" && value.name.length >= 32) {
								projects[index].shortName = value.name.substr(0, 29) + "...";
							} else {
								projects[index].shortName = value.name;
							}
						});

						$("body").addClass('projects').addClass('files').addClass('tasks');
						$("body").removeClass('single-view');

						if (projects.length === 0) {
							if (self.options.search || self.options.startDate || self.options.deadline) {
								element.html("templates/projects/projects_empty_search.ejs", {tab: options.tab});
							} else {
								element.html("templates/projects/projects_empty_list.ejs", {tab: options.tab});
								element.find(".counter span").removeAttr('data-localize');
								element.find(".counter span").html(element.find(".counter span").html().replace("{0}", "<big>0</big>"));
							}


							element.find(".projects-header .tools .btn-group a").removeClass("active");
							element.find('.projects-header .tools .btn-group a[tab="' + options.tab + '"]').addClass("active");
						} else {
							$.each(projects, function(index, value) {
								if (projects[index].deadline != null) {
									var cDate = new Date();
									var widthOfBar = Math.floor((cDate.getTime() - projects[index].startDate.millisGMT) / (projects[index].deadline.millisGMT - projects[index].startDate.millisGMT) * 100);
									if (widthOfBar > 100) widthOfBar = 100;
									if (widthOfBar < 0) widthOfBar = 0;
									projects[index].widthOfBar = widthOfBar;
								} else {
									projects[index].widthOfBar = 0;
								}
							});


							var numberOfPages = Math.ceil(options.projectCount / pageLimit);


							var paginationArray = {"numberOfPages": numberOfPages, "pageLimit": pageLimit, "currentPage": options.page};

							if (options.tab == "history") {
								element.html("templates/projects/projects_list_table.ejs", {"projects": projects});
								$.each($(".project-name-tooltip"), function() {
									$(this).attr('title', $(this).siblings('span.hidden-title').html());
								});

								if (permissionsTable['project_view'] == 0) {
									$("table.projects a").removeAttr('href');
								}

							}
							else {
								element.html("templates/projects/projects_list.ejs", {
									"projects": projects,
									"offices": offices
								});
								if (permissionsTable['project_view'] == 0) {
									$(".action-bar").addClass('disabled');

								}
							}


							if (options.search) {
								appendPagination(element.children(".content").children(".pagination"), "#!projects/" + options.tab + "/" + options.search + "/:page", paginationArray);
							} else {
								appendPagination(element.children(".content").children(".pagination"), "#!projects/" + options.tab + "/:page", paginationArray);
							}
							element.find(".projects-header .tools .btn-group a").removeClass("active");
							element.find('.projects-header .tools .btn-group a[tab="' + options.tab + '"]').addClass("active");

						}

						localizeAttribute('#search-projects input[name="startDate"]', 'placeholder', null);
						localizeAttribute('#search-projects input[name="deadline"]', 'placeholder', null);
						localizeAttribute('#search-projects input[name="id-and-name"]', 'placeholder', null);

						dateRangePickers.initElements();

						$(".project-name-tooltip").tooltip({ html: true});

						dontShowLoader();
						if (self.options.search) {
							try {
								$('#search-projects input[name="id-and-name"]').val(decodeURIComponent(self.options.search));
							} catch (err) {
								location.hash = "";
							}
						}

						if ($.trim($('#search-projects input[name="id-and-name"]').val()) === "") {
							$("#search-projects #clear-search").css('display', 'none');
						} else {
							$("#search-projects #clear-search").css('display', 'block');
						}
					})
					.fail(function(error) {
						errorHandle(error);
						location.hash = "#!";
						dontShowLoader();
					});
			},

			".module-project .tab-content .pagination .pagination-button click": function(element) {
				var projectDiv = element.parents(".module-project");
				var projectID = $.trim(element.parents(".module-project").attr("projectID2"));
				// projectDiv.find('.tab-content .tab-pane:nth-child(1)').append(loaderString);
				// tasksController.loadTasks(projectID, projectDiv, element.attr("pageNumber"), false);
				tasksController.pagination(projectID, projectDiv, element.attr("id"), false);
			},

			".module-project .action-bar click": function(element, event) {
				if (element.hasClass('disabled')) return;
				if (!$(event.target).hasClass('project-download') && !$(event.target).parent().hasClass('project-download')) {
					if (!element.hasClass("clicked")) {
						var projectDiv = element.parents(".module-project");
						projectDiv.find(".action-bar").addClass('clicked')
						var self = this;

						if (projectDiv.hasClass('collapsed')) {
							projectDiv.append(loaderString);
							projectDiv.find(".field-progress").fadeOut();
							projectDiv.find(".field-download").fadeIn();

							if (pdf_info.acrobat != null) {
								bindViewDownload(projectDiv);
							}
							var projectID = $.trim(element.parents(".module-project").attr("projectID2"));
							Project.findOne(projectID, function(project) {


								Task.findAll(projectID, {}, function(tasks) {
									if (projectDiv.children(".content").children(".content-wrapper").length <= 0) {
										var cDate = new Date();

										var widthOfBar = 0;
										if (project.deadline != null)
											widthOfBar = Math.floor((cDate.getTime() - project.startDate.millisGMT) / (project.deadline.millisGMT - project.startDate.millisGMT) * 100);

										if (widthOfBar > 100) widthOfBar = 100;
										if (widthOfBar < 0) widthOfBar = 0;

										var confirmationLink = baseURL + "projects/" + projectID + "/confirmation";
										project.languageCombinationsString = helperController.getLanguageCombinationsString(project.languageCombinations);


										if (project.languageCombinations.length > 1 && project.languageCombinations[0].sourceLanguage.symbol != project.languageCombinations[1].sourceLanguage.symbol) {
											project.sourceLanguage = "";

											$.each(project.languageCombinations, function(index, value) {
												if (index + 1 == project.languageCombinations.length)
													project.sourceLanguage += value.sourceLanguage.name;
												else
													project.sourceLanguage += value.sourceLanguage.name + ", ";
											});

											project.targetLanguages = project.languageCombinations[0].targetLanguage.name;

										} else {
											if (project.languageCombinations.length > 0) {
												project.sourceLanguage = project.languageCombinations[0].sourceLanguage.name;
												project.targetLanguages = "";

												$.each(project.languageCombinations, function(index, value) {
													if (index + 1 == project.languageCombinations.length)
														project.targetLanguages += value.targetLanguage.name;
													else
														project.targetLanguages += value.targetLanguage.name + ", ";
												});
											} else {
												project.sourceLanguage = "";
												project.targetLanguages = "";
											}
										}
										var tasksLength = tasks.length;

										if (typeof project.contactPersons != 'undefined' && project.contactPersons != undefined) {
											project.contactPerson = { avatar: baseURL + 'customers/' + customerID + '/persons/' + project.contactPersons.contactPerson.id + '/image?width=48&height=48&crop=true' };
											project.sendBackTo = { avatar: baseURL + 'customers/' + customerID + '/persons/' + project.contactPersons.sendBackTo.id + '/image?width=48&height=48&crop=true' };
											$.each(project.contactPersons.additionalContacts, function(index, value) {
												value.avatar = baseURL + 'customers/' + customerID + '/persons/' + value.id + '/image?width=48&height=48&crop=true'
											});
										}
										projectDiv.children(".content").append("templates/projects/project_expanded.ejs", {"project": project, "barWidth": widthOfBar, "confirmationLink": confirmationLink, "tasksLength": tasksLength});


										localizeAttribute(".send-back-to-item", "title", "");
										localizeAttribute(".send-back-to-item", "data-original-title", "");

										projectDiv.children(".content").children(".content-wrapper").slideDown(function() {
											projectDiv.toggleClass('collapsed');
											projectDiv.addClass('expanded');
										});
										projectDiv.children(".overlay").remove();
										projectDiv.find(".tab-content .tab-pane:nth-child(1)").addClass('active');
										projectDiv.find(".action-bar").removeClass("clicked");
										$("[rel=tooltip]").tooltip();
										$("[rel=tooltip]").on('click', function() {
											$(this).tooltip('hide');
										});
										if (project.awaitingCustomerReview == true) {
											var taskTabLink = projectDiv.find('.tasks-tab-link');
											var nthChild = taskTabLink.parent().index() + 1;
											projectDiv.find('.tasks-tab-link').parent().siblings().removeClass('active');
											projectDiv.find('.tasks-tab-link').parent().addClass('active');
											tasksController.loadTasksInner(projectID, projectDiv, 2, false, nthChild, taskTabLink.parents(".module-project").data("totalagreed"), false, false, tasks);
										}
									} else {
										projectDiv.children(".overlay").remove();
										projectDiv.find(".action-bar").removeClass("clicked");
									}

								}, function(error) {
									errorHandle(error);
								});
							}, function(error) {
								errorHandle(error);
							});
						} else {
							projectDiv.children(".content").children(".content-wrapper").slideUp(500, function() {
								projectDiv.children(".content").children(".content-wrapper").remove()
							});
							projectDiv.removeClass('expanded');
							projectDiv.addClass('collapsed');
							projectDiv.find(".action-bar").removeClass("clicked");
							projectDiv.find(".field-progress").fadeIn();
							projectDiv.find(".field-download").fadeOut();
							if (pdf_info.acrobat != null) {
								unbindViewDownload(projectDiv);
							}
						}
					}
				}
			},

			".module-project .tabs ul.nav-tabs li a click": function(element) {
				var projectID = $.trim(element.parents(".module-project").attr("projectID2"));
				var projectDiv = element.parents(".module-project");

				nthChild = element.parent().index() + 1;

				if (!($(element).parent().hasClass('active')) && !($(element).hasClass("project-download"))) {
					$(element).addClass('loading');
				}

				projectDiv.find('.tabs li').removeClass('active');
				projectDiv.find('.tabs li:nth-child(' + nthChild + ')').addClass('active');

				if (element.hasClass('summary-tab-link')) {
					$(element).removeClass('loading');
					projectDiv.find('.tab-content .tab-pane').removeClass('active');
					projectDiv.find('.tab-content .tab-pane:nth-child(' + nthChild + ')').addClass('active');
				}

				if (element.hasClass('tasks-tab-link')) {
					tasksController.loadTasks(projectID, projectDiv, 2, false, nthChild, element.parents(".module-project").data("totalagreed"));
				}

				if (element.hasClass('files-tab-link')) {
					filesController.loadFiles(projectID, projectDiv, 1, nthChild);
				}

				if (element.hasClass('resources-tab-link')) {
					filesController.loadResources(projectID, projectDiv, nthChild);
				}
			},


			".projects-header .tools .btn click": function(element) {
				if (!element.hasClass("active")) {
					element.siblings().removeClass("active");
					element.addClass("active");
				}
			},
			".open-feedback-modal click": function(element) {
				var projectID = $.trim(element.parents(".module-project").attr("projectID2"));


				$("#myModal").remove();
				$("body").append('templates/projects/customer_feedback.ejs', {projectID: projectID, feedbackData: null});


				$(".stars").raty({
					starOff: 'static/img/js_img/star-off.png',
					starOn: 'static/img/js_img/star-on.png',
					width: false
				})

				$("#myModal .modal-close").click(function() {
					$("#myModal").modal('hide');
				});

				$('#myModal').on('hidden', function() {
					$('#myModal').remove();
					$(".modal-backdrop").remove();
				});


				$("#myModal").modal('show');


			},
			".survey-send click": function(element) {
				if (element.hasClass('disabled')) return false;
				element.parents('.modal-body').find('.alert').remove();
				element.prepend('<i class="icon-loader-green"></i>')
				element.addClass('loading').addClass('disabled');

				var feedbackData = {customerFeedbackAnswers: []};
				$.each(element.parents(".modal-body").find('ul.project-survey li.question'), function() {
					var currentRate = 1;
					if ($(this).find('.stars').raty('score') != undefined)
						currentRate = $(this).find('.stars').raty('score');
					feedbackData.customerFeedbackAnswers[feedbackData.customerFeedbackAnswers.length] =
					{"value": currentRate, "customerFeedbackQuestion": {"id": $(this).data('id')}};
					;
				});
				feedbackData.comment = element.parents(".modal-body").find('ul.project-survey li.comment textarea').val();
				var projectID = element.parents('.modal-body').data('project-id');


				Project.postFeedback(projectID, feedbackData, function(success) {
					element.find('i').remove();
					element.removeClass('loading');
					element.parents('.modal-body').prepend('<div class="alert alert-icon"><i class="icon-success"></i><span>Thank you for sending feedback.</span></div>');
					setTimeout(function() {
						$("#myModal").modal('hide');
					}, 5000);

				}, function(error) {
					element.find('i').remove();
					element.removeClass('loading').removeClass('disabled');

					var errorResponse = $.parseJSON(error.responseText);
					var errorString = '<span data-localize="quote.request-problem">Sorry, an unknown error occoured</span>';
					if (typeof errorResponse.errorMessage != 'undefined') {
						errorString = errorResponse.errorMessage;
					}
					element.parents('.modal-body').prepend('<div class="alert alert-error"><i class="icon-error"></i><span>' + errorString + '</span></div>');

				});

			},

			".module-office click": function(element) {
				var projectDiv = element.closest('.module-project');
				var projectID = $.trim(projectDiv.attr('projectid2'));

				var officesController = new Offices(element);

				officesController.openChangeProjectOfficeModal(projectID);
			},
			".leave-feedback click": function() {
				$("#myModal").remove();
				$("body").append("templates/projects/feedback/leave-feedback-modal.ejs", {projectId: this.project.idNumber, projectName: this.project.name, targetLanguages: targetLanguages()});

				$('#myModal').on('hidden', function() {
					$('#myModal').remove();
					$(".modal-backdrop").remove();
				});
				localizeAttribute("#target-languages", "placeholder", "modules.quotes.input-quote-select-pp-ph");
				localizeAttribute("#feedback-type", "placeholder", "modules.quotes.input-quote-select-pp-ph");

				$("#myModal").modal('show');
				$(".chosen-process").select2({
					width: "320px",
					minimumResultsForSearch: 10,
					allowClear: true
				});

				function targetLanguages() {
					return _.uniq(_.filter(_.map(tasksController.tasks,
						function(task) {
							if (task.languageCombination.targetLanguage.id !== null) {
								return task.languageCombination.targetLanguage;
							}
						}), function(targetLanguage) {
						return targetLanguage;
					}), function(targetLanguage) {
						return targetLanguage.id;
					});
				}
			},
			"#send-feedback click": function(element) {
				var self = this;
				var description = $("#description").val();
				var targetLanguages = $("#target-languages").select2("val");
				var feedbackType = $("#feedback-type").select2("val");
				if (requiredFiledsAreEmpty()) {
					hintRequiredFields();
				} else {
					element.addClass('disabled');
					element.addClass('loading');
					element.prepend('<i class="icon-loader-light"></i>');
					sendFeedback({type: feedbackType, targetLanguages: targetLanguages, description: description});
				}

				function hintRequiredFields() {
					if (!$("#description").val()) {
						$("#description").parents(".control-group").addClass('error');
					}
					if (!$("#feedback-type").select2("val")) {
						$("#feedback-type").parents(".control-group").addClass('error');
					}
					$("#description").unbind('keyup');
					$("#description").bind('keyup', function() {
						$("#description").parents(".control-group").removeClass('error');
					});
					$("#feedback-type").unbind('change');
					$("#feedback-type").bind('change', function() {
						$("#feedback-type").parents(".control-group").removeClass('error');
					});
				}

				function requiredFiledsAreEmpty() {
					return $.trim(description) === '' || !feedbackType;
				}

				function sendFeedback(feedbackData) {
					Project.sendFeedback(self.project.id, feedbackData, function() {
						showFeedbackSentModal();
						if (feedbackData.type === "CUSTOMER_CLAIM") {
							reloadProject();
						}
					}, function(error) {
						errorHandle(error);
					});

					function showFeedbackSentModal() {
						$("#myModal").modal('hide');
						$("body").append("templates/projects/feedback/feedback-sent-modal.ejs", {});
						$('#myModal').on('hidden', function() {
							$('#myModal').remove();
							$(".modal-backdrop").remove();
						});
						$("#myModal").modal('show');
					}

					function reloadProject() {
						self.options.projectID = self.project.id;
						self.showSingleProject(self.options.targetDiv, self.options);
					}

				}
			}
		});
	});





