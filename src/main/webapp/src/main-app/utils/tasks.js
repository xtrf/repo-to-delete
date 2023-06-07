steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',

	function($) {
		$.Model('Task', {
			findAll: function(projectID, params, success, error) {
				var queryString = queryBuilder(params);
				return $.ajax({
					url: baseURL + 'projects/' + projectID + '/tasks' + addToURL + queryString,
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});

			},
			count: function(projectID, success, error) {
				return $.ajax({
					url: baseURL + 'projects/' + projectID + '/tasks/count' + addToURL.substr(5),
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			countQuoteTasks: function(quoteID, success, error) {
				return $.ajax({
					url: baseURL + 'quotes/' + quoteID + '/tasks/count' + addToURL.substr(5),
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			findOne: function(taskID, success, error) {

				return $.ajax({
					url: baseURL + 'projects/tasks/' + taskID + addToURL,
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			findAllInQuote: function(quoteID, params, success, error) {
				var queryString = queryBuilder(params);
				return $.ajax({
					url: baseURL + 'quotes/' + quoteID + '/tasks' + addToURL + queryString,
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			findOneInQuote: function(taskID, success, error) {
				return $.ajax({
					url: baseURL + 'quotes/tasks/' + taskID + addToURL,
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			getPendingReviews: function(taskID, success, error) {
				return $.ajax({
					url: baseURL + 'projects/tasks/' + taskID + '/review',
					dataType: 'json',
					xhrFields: { withCredentials: true },
					success: success,
					error: error
				});
			},
			getReviewedFiles: function(taskID, success, error) {
				return $.ajax({
					url: baseURL + 'projects/tasks/' + taskID + '/review/files/reviewed',
					dataType: 'json',
					xhrFields: { withCredentials: true },
					success: success,
					error: error
				});
			},
			deleteReviewedFile: function(taskID, filename, success, error) {
				return $.ajax({
					url: baseURL + 'projects/tasks/' + taskID + '/review/files/reviewed/' + filename,
					dataType: 'json',
					type: "DELETE",
					xhrFields: { withCredentials: true },
					success: success,
					error: error
				});
			},
			reviewResponsibleChange: function(taskID, personID, success, error) {
				return $.ajax({
					url: baseURL + 'projects/tasks/' + taskID + '/review/personResponsible',
					type: "PUT",
					data: {"personId": personID},
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			},
			setTaskComment: function(taskID, comment, success, error) {
				$.cookie(sessionObject.id + "-" + sessionObject.type + "-" + taskID, comment);
			},
			getTaskComment: function(taskID, success, error) {
				if($.cookie(sessionObject.id + "-" + sessionObject.type + "-" + taskID) != null) {
					return success({'comment': $.cookie(sessionObject.id + "-" + sessionObject.type + "-" + taskID)});
				}
				else {
					return success({'comment': ''});
				}
			},
			sendReview: function(taskID, comment, success, error) {
				return $.ajax({
					url: baseURL + 'projects/tasks/' + taskID + '/review?comment=' + comment,
					type: "PUT",
					dataType: 'json',
					xhrFields: { withCredentials: true},
					success: success,
					error: error,
					cache: false
				});


			},
			getProjectsPendingReviews: function(success, error) {
				return $.ajax({
					url: baseURL + 'projects/review',
					dataType: 'json',
					xhrFields: { withCredentials: true },
					success: success,
					error: error
				});
			}

		}, {});


		$.Controller("Tasks", {
			tasks:[],
			init: function(element, options) {
				options.pageLimit = 25;
				options.pageOffset = 0;
				options.currentPage = 0;

			},
			".modal-task .filters>ul li a click": function(element) {
				if(!element.parent().hasClass("disabled")) {
					$("[rel=tooltip]").tooltip();
					$("[rel=tooltip]").on('click', function() {
						$(this).tooltip('hide');
					});

					var target = element.attr("data-target");

					element.parent().siblings().removeClass('active');
					element.parent().addClass('active');
					$('#bigModal').find(".content.active").removeClass('active');
					$('#bigModal').find(".content[data-source='" + target + "']").addClass('active');
					if(target == "review") {
						$('#bigModal').find(".modal-body").attr("data-mode", "review");
						localizeAttribute(".icon-online-review", "data-original-title", "");
						localizeAttribute(".icon-task-deadline", "data-original-title", "");
						localizeAttribute(".icon-task-deadline-overdue", "data-original-title", "");
					} else {
						$('#bigModal').find(".modal-body").attr("data-mode", "");
					}
				}
			},
			singleTaskModal: function(taskID, activeTab) {
				var self = this;
				$(".modal").remove();

				Task.findOne(taskID, function(taskInfo) {
					ProjectFile.findInTask(taskInfo.id, {}, function(files) {
						self.singleTaskModalInner(taskID, taskInfo, files, activeTab);
					}, function(error) {
						errorHandle(error);
						dontShowLoader();
					});
				}, function(error) {
					if(error.status === 404) {
						$(".modal-backdrop").remove();
						var locationArrray = location.hash.split("/task");
						location.hash = locationArrray[0];
					} else {
						errorHandle(error);
					}
					dontShowLoader();
				});
			},
			singleTaskModalInQuote: function(taskID) {

				var self = this;
				$(".modal").remove();

				Task.findOneInQuote(taskID, function(taskInfo) {
					ProjectFile.findInTaskInQuote(taskInfo.id, {}, function(files) {
						self.singleTaskModalInner(taskID, taskInfo, files)
					}, function(error) {
						errorHandle(error);
						dontShowLoader();
					});
				}, function(error) {
					errorHandle(error);
					dontShowLoader();
				});
			},

			singleTaskModalInner: function(taskID, taskInfo, files, activeTab) {
				if($("#bigModal").length > 0) {
					return ;
				}
				var showOutput = false;
				var showResource = false;
				var hasReviewedFiles = false;
				var hasAwaitingReviews = false;
				var isOverdue = false;

				var taskModal, filesContent, filesTab, resourcesContent, resourcesTab, reviewsContent, reviewsTab, emptyContent, downloadAllFilesLink;
				var self = this;
				self.options.filesTemp = new Array();
				self.options.allFiles = new Array();

				if(!taskInfo.hasOutputFiles) {
					taskInfo.hasOutputFiles = null;
				}

				if(files.inputResources != null) {
					if(files.inputResources.directories.length > 0 || files.inputResources.files.length > 0) {
						showResource = true;
					}
				}

				if(files.output != null) {
					if(files.output.directories.length > 0 || files.output.files.length > 0) {
						showOutput = true;
					}
				}
				if(taskInfo.hasActivitiesAwaitingReview != undefined) {
					hasAwaitingReviews = taskInfo.hasActivitiesAwaitingReview;
				}


				$("#bigModal").remove();

				$("body").append("templates/tasks/task_modal.ejs", taskInfo);


				$("#bigModal").modal({
					keyboard: false,
					backdrop: "static"
				});
				taskModal = $("#bigModal");
				taskModal.attr("data-task-id", taskInfo.id);
				filesContent = taskModal.find(".content[data-source='files']");
				filesTab = $("#bigModal .filters li.files");
				resourcesContent = taskModal.find(".content[data-source='resources']");
				resourcesTab = $("#bigModal .filters li.resources");
				reviewsContent = taskModal.find(".content[data-source='review']");
				reviewsTab = $("#bigModal .filters li.reviews");
				emptyContent = taskModal.find(".content.empty");


				resourcesContent.html("templates/projects/resources_list.ejs", {
					showOutput: false,
					resources: false,
					"downloadOutputLink": ""
				});
				setVerticalModalMargin();


				var newParentDiv = taskModal.find(".content[data-source='resources'] .resources-container ul.level0");

				filesController.appendFileRow("", newParentDiv, files.inputResources, 0);

				if(typeof hasAwaitingReviews != 'undefined' && hasAwaitingReviews) {
					Task.getPendingReviews(taskInfo.id, function(review) {
						Task.getReviewedFiles(taskInfo.id, function(reviewedFiles) {
							$.each(review.filesForReview, function(i, file) {
								file.downloadURL = baseURL + "projects/files/" + file.id;
								if(typeof file.fileUrl !== "undefined") {
									file.onlineReview = true;
								} else {
									file.onlineReview = false;
								}
							});

							if(review.dueDate != null && Date.now() - review.dueDate.millisGMT > 0) {
								isOverdue = true;
							}
							// TODO - reviewed files support
							if(reviewedFiles.length > 0) {
								hasReviewedFiles = true;
							}

							downloadAllFilesLink = baseURL + "projects/tasks/" + taskInfo.id + "/review/files/awaiting-review";
							reviewsContent.html("templates/tasks/review_content.ejs", {
								taskReview: review,
								responsibleChangePermission: true,
								hasReviewedFiles: hasReviewedFiles,
								isOverdue: isOverdue,
								downloadAllFilesURL: downloadAllFilesLink,
								reviewedFiles: reviewedFiles
							});


							self.initFileUploader();

							bindViewDownload($(".review-list li.online-review"));

						}, function(error) {
							var errorHTML = false;
							if(typeof error.status != 'undefined' && error.status == '412') {
								var response = $.parseJSON(error.responseText);
								if(typeof response == 'object' && response !== false && response.errorMessage != null) {
									errorHTML = response.errorMessage;
								}

							}
							reviewsTab.addClass('disabled');
							filesTab.find('a').click();
							if(errorHTML) {
								taskModal.find('aside').append('<div class="alert alert-error aside-alert" data-localize="modules.tasks.error-awaiting-reviews">' + errorHTML + '</div>');
							} else {
								taskModal.find('aside').append('<div class="alert alert-error aside-alert" data-localize="modules.tasks.error-awaiting-reviews">Sorry an error occurred. Please contact your Project Manager to correct deadline information and try again later.</div>');
							}


						});
					}, function(error) {
						errorHandle(error);
					});

				}


				if(taskInfo.hasInputWorkfiles == true) {
					filesTab.addClass("active");
					filesContent.addClass("active");
					var showExpandInput = true;

					if(files.inputWorkfiles.directories.length == 0) {
						showExpandInput = false;
					} else {
						showExpandInput = true;
					}


					var showExpandOutput = true;
					if(showOutput) {
						if(files.output.directories.length == 0) {
							showExpandOutput = false;
						} else {
							showExpandOutput = true;
						}
					}

					filesContent.html("templates/projects/files_list.ejs", {
						showOutput: showOutput,
						resources: false,
						"downloadOutputLink": "",
						showExpandInput: showExpandInput,
						showExpandOutput: showExpandOutput
					});


					localizeAttribute(".filter-files", "placeholder", "");
					newParentDiv = taskModal.find(".content[data-source='files'] .source-files-container ul.level0");
					filesController.appendFileRow("", newParentDiv, files.inputWorkfiles, 0);

					if(showOutput) {
						newParentDiv = taskModal.find(".content[data-source='files'] .result-files-container ul.level0");
						filesController.appendFileRow("", newParentDiv, files.output, 0);
					}
				} else {


					if(taskInfo.hasInputResources) {
						filesTab.addClass("disabled");
						resourcesTab.addClass("active");
						resourcesContent.addClass("active");
					} else if(hasAwaitingReviews) {

						taskModal.find(".modal-body").attr("data-mode", "review");
						reviewsTab.addClass("active");
						reviewsContent.addClass("active");

						filesTab.find("a").attr("data-target", "empty");
					} else {

						emptyContent.addClass("active");
					}
				}
				if(activeTab == 'review')
					taskModal.find('a[data-target="review"]').click();


				$("[rel=tooltip]").tooltip();
				$("[rel=tooltip]").on('click', function() {
					$(this).tooltip('hide');
				});

				localizeAttribute(".icon-task-deadline", "data-original-title", "");

				localizeAttribute(".icon-task-service", "title", "");
				localizeAttribute(".icon-task-service", "data-original-title", "");

				localizeAttribute(".icon-task-lang-combination", "title", "");
				localizeAttribute(".icon-task-lang-combination", "data-original-title", "");

				localizeAttribute(".icon-task-name", "title", "");
				localizeAttribute(".icon-task-name", "data-original-title", "");

				//localizeAttribute(".field-deadline","title","");
				//localizeAttribute(".field-deadline","data-original-title","");

				$("#bigModal .modal-close").click(function() {
					$("#bigModal").modal('hide');
				});

				$('#bigModal').on('hidden', function() {
					$('#bigModal').remove();
					$(".modal-backdrop").remove();
					var splittedArray = location.hash.split("/task");
					location.hash = splittedArray[0];
				});
				$("#bigModal").modal('show');
				dontShowLoader();

			},
			".modal-task .upload-button-handler click": function() {
				$("#real-upload-button").click();
			},

			".modal-task #review-comments keyup": function(element) {
				Task.setTaskComment(element.parents(".modal-task").data("task-id"), element.val());
			},

			".modal-task .file-remove-cr click": function(element) {
				var filenameAttr = element.parents("li").attr('data-filename');
				if(typeof filenameAttr !== 'undefined' && filenameAttr !== false) {
					Task.deleteReviewedFile(element.parents("#bigModal").data('task-id'), element.parents("li").data('filename'), function() {
							element.parents("li").remove();
						},
						function(error) {
							var errorHTML = false;

							if(typeof error.status != 'undefined' && error.status == '412') {
								var response = $.parseJSON(error.responseText);
								if(typeof response == 'object' && response !== false && response.errorMessage != null) {
									errorHTML = response.errorMessage;
								}
							}
							if(errorHTML == false) {
								errorHTML = '<span class="error" style="color:#e33d4d" data-localize="modules.tasks.error-while-removing-file">(error while removing file, please contact administrator)</span>';
							} else {
								errorHTML = '<span class="error" style="color:#e33d4d">(' + errorHTML + ')</span>';
							}

							if(element.parents("li").find(".filename .error").length == 0) {
								element.parents("li").find(".filename").append(errorHTML);
								setTimeout(function() {
									element.parents("li").find('.filename .error').fadeOut(500, function() {
										$(this).remove();
									})
								}, 5000);
							}
						}
					)
				} else {
					var listWrapper = element.parents('.uploaded-files-list');

					this.options.filesTemp[element.parents("li").attr('fileindex')] = null;


					var numberOfFiles = 0;

					$.each(this.options.filesTemp, function(index, value) {
						if(value != null)
							numberOfFiles++;
					});


					if(numberOfFiles == 0) {
						$("#step-2-new .next-step").addClass('disabled');
					} else {
						$("#step-2-new .next-step").removeClass('disabled');
					}

					element.parents("li").remove();
					if(listWrapper.children().length == 0) {
						listWrapper.parents('modal-task').find('.review-list').find(".empty-set-placeholder").fadeIn();
						listWrapper.parents('modal-task').find('.actions').fadeOut();
					}
				}


			},
			loadTasksInner: function(projectID, projectDiv, page, success, nthChild, projectTotalAgreed, loadTaskModal, showReview, tasks) {
				var self = this;
				self.options.activeTab = "tasks";
				var reviewTasks = 0;
				if(tasks.length == 0) {
					projectDiv.find('a.tasks-tab-link').parent().removeClass().addClass('disabled');
					projectDiv.find('a.tasks-tab-link').parent().html('<i class="icon-tasks"></i> <span data-localize="gseneral.no-tasks">No tasks</span>');
					projectDiv.find('a.summary-tab-link').parent().addClass('active');
					if(projectDiv.find('.nav-tabs li:not(.disabled)').length > 0) {
						projectDiv.find('.nav-tabs li:not(.disabled)').first().find('a').click();
					}
				} else {
					while(reviewTasks < tasks.length && tasks[reviewTasks].hasActivitiesAwaitingReview) {
						reviewTasks++;
					}
					projectDiv.find(".tab-content .tab-pane").removeClass('active');
					projectDiv.find(".tab-content .tab-pane:nth-child(" + nthChild + ")").addClass('active');
					projectDiv.find(".tab-content .tab-pane:nth-child(" + nthChild + ")").html("templates/projects/tasks_list.ejs", {tasks: tasks, projectTotalAgreed: projectTotalAgreed, tasksAwaitingCR: reviewTasks, paginationPages: this.options.pages, currentPage: this.options.currentPage });;
					localizeAttribute(".icon-online-review", "data-original-title", "");
					localizeAttribute(".icon-task-deadline", "data-original-title", "");
					localizeAttribute(".icon-task-deadline-overdue", "data-original-title", "");
					$("[rel='tooltip']").tooltip();
					$("[rel=tooltip]").on('click', function() {
						$(this).tooltip('hide');
					});

				var btnCTAclass = "";
					if(typeof showReview != 'undefined') {
						btnCTAclass = ".btn-cta";
					}
					if(typeof loadTaskModal != 'undefined') {
						if($('.single-task-href' + btnCTAclass + '[taskid="' + loadTaskModal + '"]').length > 0) {
							if($('.single-task-href' + btnCTAclass + '[taskid="' + loadTaskModal + '"]').length > 1) {
								var counter = 0;
								$.each($('.single-task-href' + btnCTAclass + '[taskid="' + loadTaskModal + '"]'), function() {
									if(counter == 0)
										$(this).click();
									counter++;
								});
							} else
								$('.single-task-href' + btnCTAclass + '[taskid="' + loadTaskModal + '"]').click();
						}
					}
				}
				projectDiv.find('a.tasks-tab-link').removeClass('loading');
				if(success)
					success();

				// pagination buttons click
				$('.pagination__list__item__button').on('click', function() {
					var pageNumber = $(this).attr('data-load');
					var offset = pageNumber * self.options.pageLimit;
					self.options.pageOffset = offset;
					self.options.currentPage = parseInt(pageNumber);
					self.pagination(projectID, projectDiv, false);
				});
			},

			loadTasks: function(projectID, projectDiv, page, success, nthChild, projectTotalAgreed, loadTaskModal, showReview) {
				var self = this;
				var taskList = $('#tasks-pagination-list');
				// counting tasks
				Task.count(projectID, function(res) {
					self.options.tasksItems = res;
					self.options.pages = Math.ceil(self.options.tasksItems / self.options.pageLimit);
				}, function(error) {
					errorHandle(error);
					projectDiv.find('a.tasks-tab-link').removeClass('loading');
				});

				Task.findAll(projectID, {"limit": self.options.pageLimit, "start": self.options.pageOffset}, function(tasks) {
					self.tasks = tasks;
					self.loadTasksInner(projectID, projectDiv, page, success, nthChild, projectTotalAgreed, loadTaskModal, showReview, tasks);

				}, function(error) {
					errorHandle(error);
					projectDiv.find('a.tasks-tab-link').removeClass('loading');
				});
			},
			loadTasksInQuote: function(quoteID, quoteDiv, nthChild, success, vatNote, quoteTotalAgreed) {
				var self = this;
				self.options.activeTab = "tasks";
				// counting tasks
				Task.countQuoteTasks(quoteID, function(res) {
					self.options.tasksItems = res;
					self.options.pages = Math.ceil(self.options.tasksItems / self.options.pageLimit);
				}, function(error) {
					errorHandle(error);
					projectDiv.find('a.tasks-tab-link').removeClass('loading');
				});

				Task.findAllInQuote(quoteID, {"limit": self.options.pageLimit, "start": self.options.pageOffset}, function(tasks) {
					if(tasks.length === 0) {
						quoteDiv.find('a[tab="tasks"]').parent().removeClass().addClass('disabled');
						quoteDiv.find('a[tab="tasks"]').parent().html('<i class="icon-tasks"></i> <span data-localize="general.no-tasks">No tasks</span>');
						if(quoteDiv.find('ul li a').length > 0) {
							quoteDiv.find('ul li a').first().click();
						}
						//quoteDiv.find('a.summary-tab-link').parent().addClass('active');

					} else {


						quoteDiv.find("ul.nav-tabs li").removeClass('active');
						quoteDiv.find("ul.nav-tabs li:nth-child(" + nthChild + ")").addClass('active');
						quoteDiv.find(".tab-content .tab-pane").removeClass('active');
						quoteDiv.find(".tab-content .tab-pane:nth-child(" + nthChild + ")").addClass('active');

						quoteDiv.find(".tab-content .tab-pane:nth-child(" + nthChild + ")").html("templates/quotes/tasks_list.ejs", {tasks: tasks, vatNote: true, quoteTotalAgreed: quoteTotalAgreed, paginationPages: self.options.pages, currentPage: self.options.currentPage});
						quoteDiv.find('ul.nav-tabs li a').removeClass('loading');

					}
					if(success)
						success();

					$('.pagination .pagination-button').on('click', function() {
						if($(this).hasClass('disabled')) {
							return false
						}
						var buttonId = $(this).attr("id");
						self.pagination(quoteID, quoteDiv, buttonId, false);
					});
					$('.pagination__list__item__button').on('click', function() {
						var pageNumber = $(this).attr('data-load');
						var offset = pageNumber * self.options.pageLimit;
						self.options.pageOffset = offset;
						self.options.currentPage = parseInt(pageNumber);
						self.pagination(quoteID, quoteDiv, false);
					});


				}, function(error) {
					errorHandle(error);
					projectDiv.find('a.tasks-tab-link').removeClass('loading');
				});


			},
			".single-task-href click": function(element) { //task info
				var taskID = element.attr('taskid');
				if(!element.hasClass('clicked')) {
					/*only for quotes now*/
					if(element.parents(".module").hasClass("module-quote")) {
						tasksController.singleTaskModalInQuote(taskID);
					}
				}
			},

			openTaskModal: function(taskID, isQuoteTask) {
				if(isQuoteTask) {
					tasksController.singleTaskModalInQuote(taskID);
				} else {
					tasksController.singleTaskModal(taskID, '');
				}
			},

			".modal-task .responsible-change click": function(element, event) {
				event.preventDefault();

				var self = this;
				var addPermission = true;


				var taskModalFooter = $(".modal-task .content[data-source='review'] footer");
				taskModalFooter.append("templates/tasks/responsible_change_popover.ejs", {});
				localizeAttribute(".modal-task .content[data-source='review'] footer .search-person", "placeholder", "");

				var responsibleChangePopover = taskModalFooter.find("#responsible-change");
				responsibleChangePopover.fadeIn(200);


				$("body").on("click", function(event) {
					var target = $(event.target);
					var fn = arguments.callee;
					if(target.parents("#responsible-change").length == 0) {
						$("body").unbind("click", fn);
						responsibleChangePopover.fadeOut(200, function() {
							$(this).detach();
						});
					}
				});

				self.populateContactsList();
			},
			'#responsible-change .contacts-list li click': function(element, event) {
				element.addClass("loading");
				var name = element.text();
				var responsibleChangePopover = $("#responsible-change");

				Task.reviewResponsibleChange($("#bigModal").attr("data-task-id"), element.attr("data-person-id"), function() {
					$("a.responsible-change").html(name);
					setTimeout(function() {
						responsibleChangePopover.fadeOut(200, function() {
							$(this).detach();
						});
					}, 800);
				}, function(error) {
					// TODO error handling
				});
			},
			'#responsible-change a.add-contact click': function(element, event) {
				event.preventDefault();
				var responsibleChangePopover = $("#responsible-change");
				responsibleChangePopover.find(".content[data-state='list']").stop(true, true).animate({
					marginTop: -285,
					opacity: 0
				}, 200);

				responsibleChangePopover.find(".content[data-state='add-form']").stop(true, true).fadeIn(200, function() {
				});

				$("#cancel-creator").on("click", function() {
					responsibleChangePopover.find(".content[data-state='list']").animate({
						marginTop: 0,
						opacity: 1
					}, 200, function() {
						$("#contact-first-name, #contact-last-name, #contact-email").val("");
					});
				});
			},
			'#add-person mouseenter': function(element, event) {
				var self = this;
				if(self.validateCreator(true)) {
					element.removeClass("disabled");
				} else {
					element.addClass("disabled");
				}
			},
			'#add-person click': function(element, event) {
				var self = this;
				if(!element.hasClass("disabled")) {
					var responsibleChangePopover = $("#responsible-change");
					responsibleChangePopover.find(".content[data-state='add-form'] .actions").addClass("loading");
					var contactPerson = {};

					contactPerson.firstName = $("#contact-first-name").val();
					contactPerson.lastName = $("#contact-last-name").val();
					contactPerson.email = $("#contact-email").val();
					Account.addPerson(contactPerson, function() {
						self.populateContactsList();
					}, function(error) {
						$("body").click();
						if(error.status == 401) {
							errorHandle(error);
						} else {
							$(".modal-task footer .col-left .field-responsible").fadeOut(500, function() {
								$(".modal-task footer .col-left .field-responsible").after('<div class="field field-responsible-error"><i class="icon icon-error"></i> <span data-localize="general.error-occoured" style="color:#FF0000">Sorry, an error occurred</span> </div>');
								setTimeout(function() {
									$(".modal-task footer .col-left .field-responsible-error").fadeOut(500, function() {
										$(".modal-task footer .col-left .field-responsible").fadeIn(500);
										$(this).detach();
									});
								}, 3000);
							});
						}
					});
				}
			},
			'#responsible-change .content[data-state="add-form"] input[type="text"] keyup': function(element, event) {
				if(this.validateCreator(false)) {
					$("#add-person").removeClass("disabled");
				} else {
					$("#add-person").addClass("disabled");
				}

			},
			".modal-task .finish-review click": function(element) {
				if(element.hasClass('disabled')) return;
				$("#bigModal").find(".content").append("templates/tasks/review_acceptance.ejs", {});
				$("#bigModal .accept-review").click(function() {

					var finishReview = $(this).parent();
					var modalTask = $(this).parents(".modal-task");
					finishReview.addClass('loading');
					Task.sendReview(modalTask.data('task-id'), modalTask.find("#review-comments").val(), function() {
							modalTask.find('.cr-final-accept').html('<div class="info success"><div class="success-image"></div> <span data-localize="modules.tasks.review-finish-success">You have finished this review, thank you!</span></div>');
							setTimeout(function() {
								modalTask.fadeOut(200, function() {
									modalTask.detach();
								});
								$(".modal-backdrop").fadeOut(200, function() {
									$(this).detach();
								});
							}, 3000);
						},
						function(error) {
							var errorHTML = false;
							if(typeof error.status != 'undefined' && error.status == '412') {
								var response = $.parseJSON(error.responseText);
								if(typeof response == 'object' && response !== false && response.errorMessage != null) {
									errorHTML = response.errorMessage;
								}

							}

							if(errorHTML != false) {
								modalTask.find('.cr-final-accept .info')
									.removeClass("warning")
									.addClass("error")
									.html('<i class="icon icon-warning"></i> <span data-localize="modules.tasks.review-finish-error">Oops! Something went wrong! Try again.</span><span class="error-details">' + errorHTML + '</span>');
							} else {
								modalTask.find('.cr-final-accept .info').removeClass("warning").addClass("error").html('<i class="icon icon-warning"></i> <span data-localize="modules.tasks.review-finish-error">Oops! Something went wrong! Try again.</span>');
							}

							finishReview.removeClass('loading');
							finishReview.find('i').remove();

						});
				});
			},
			'.cr-final-accept .cancel-acceptance click': function() {
				$("#bigModal").find(".cr-final-accept").fadeOut(200, function() {
					$(this).detach();
				});
			},
			'.cr-final-accept .accept-review click': function() {
				//TODO accepting functionality
			},
			validateCreator: function(hint) {
				var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				var valid = true;
				if($("#contact-first-name").val() == "") {
					valid = false;
					if(hint) {
						$("#contact-first-name").addClass("error");
					}
				} else {
					$("#contact-first-name").removeClass("error");
				}
				if($("#contact-last-name").val() == "") {
					valid = false;
					if(hint) {
						$("#contact-last-name").addClass("error");
					}
				} else {
					$("#contact-last-name").removeClass("error");
				}
				if(!re.test($("#contact-email").val())) {
					valid = false;
					if(hint) {
						$("#contact-email").addClass("error");
					}
				} else {
					$("#contact-email").removeClass("error");
				}
				return valid;
			},

			populateContactsList: function() {
				var responsibleChangePopover = $("#responsible-change");
				Account.getContactPersons(function(contactPersons) {
					$.each(contactPersons, function(i, contactPerson) {
						contactPerson.avatar = baseURL + 'customers/' + customerID + '/persons/' + contactPerson.id + '/image?width=33&height=33&crop=true&v=' + contactPerson.version;
					});
					responsibleChangePopover.find(".content[data-state='list'] .contacts-list").html("");
					responsibleChangePopover.find(".content[data-state='list'] .contacts-list").html("templates/tasks/responsible_change_contacts_list.ejs", {contacts: contactPersons})
					responsibleChangePopover.removeClass("loading");
					responsibleChangePopover.find(".content[data-state='add-form'] .actions").removeClass("loading");
					$("#cancel-creator").trigger('click');
					$("#contact-first-name, #contact-last-name, #contact-email").val("");
				}, function(error) {
					$("body").click();
					if(error.status == 401) {
						errorHandle(error);
					} else {
						$(".modal-task footer .col-left .field-responsible").fadeOut(500, function() {
							$(".modal-task footer .col-left .field-responsible").after('<div class="field field-responsible-error"><i class="icon icon-error"></i> <span data-localize="general.error-occoured" style="color:#FF0000">Sorry, an error occurred</span> </div>');
							setTimeout(function() {
								$(".modal-task footer .col-left .field-responsible-error").fadeOut(500, function() {
									$(".modal-task footer .col-left .field-responsible").fadeIn(500);
									$(this).detach();
								});
							}, 3000);
						});
					}
					// TODO handle error
				});
			},
			initFileUploader: function() {
				var self = this;
				var reviewsContent = $("#bigModal").find(".content[data-source='review']");
				var taskID = $("#bigModal").data('task-id');
				var dropZone1 = reviewsContent;


				if(!(window.FileReader && Modernizr.draganddrop)) {
					dropZone1 = null;
					reviewsContent.find('header .actions').fadeIn();
					reviewsContent.find('.no-dnd').css('display', 'none');
					reviewsContent.find(".empty-set-placeholder .upload-button-handler").css({
						"margin-top": "18px",
						"display": "block"
					});
					reviewsContent.find(".icon-upload-reviews").wrap('<a class="upload-button-handler" />');
				}

				$('<div class="upload-errors-container"></div>').insertAfter(reviewsContent.find('#fileupload header'));

				Task.getTaskComment(reviewsContent.parents(".modal-task").data("task-id"), function(message) {
					if(typeof message != 'undefined' && typeof message.comment != 'undefined') {
						reviewsContent.find("#review-comments").val(message.comment);
					}
				});


				$("#fileupload").attr("action", baseURL + 'system/session/files' + addToURL.substr(5));
				var withC = true;
				if(addToURL.length > 0) {
					withC = false;
				}
				var countFiles = 0;

				$('#fileupload').fileupload(
					'option',
					'redirect',
					'http://pzone.com/result.html?%s'
				);

				var jqXHR = null;

				self.options.jqXHR = $('#fileupload').fileupload({
					url: baseURL + 'projects/tasks/' + taskID + '/review/files/reviewed' + addToURL.substr(5),
					uploadTemplateId: null,
					downloadTemplateId: null,
					autoUpload: true,
					dataType: 'json',
					dropZone: dropZone1,
					xhrFields: { withCredentials: withC },
					sequentialUploads: true,
					beforeSend: function(xhr) {
						jqXHR = xhr;
						$("#reviews-list .uploading:last .file-remove").click(function() {
							xhr.abort();
						});
					}
				})
					.bind('fileuploadadd', function(e, data) {
						var cThis = this;
						reviewsContent.find('.actions').fadeIn();

						countFiles++;

						self.options.allFiles[self.options.allFiles.length] = data.files[0];

						var thisFileId = 0;

						$.each(self.options.allFiles, function(index, value) {
							if(data.files[0] == value) {
								thisFileId = index;
							}
						});

						$.each(data.files, function(index, value) {
							if(reviewsContent.find("#reviews-list").length != 0) {
								//"Jest lista";
								reviewsContent.find("#reviews-list").append('templates/tasks/uploaded_file.ejs', {"file": value, "fileIndex": thisFileId, wrap: false});
							} else {
								//"Nie ma listy";
								reviewsContent.find("#user-reviews").prepend('templates/tasks/uploaded_file.ejs', {"file": value, "fileIndex": thisFileId, wrap: true});
							}
							//
						});

						if(countFiles != 0) {
							if(!reviewsContent.find(".finish-review").hasClass("disabled")) {
								reviewsContent.find(".finish-review").addClass("disabled")
							}

							reviewsContent.find(".actions .loader").addClass("active");

						}

					})
					.bind('fileuploaddone', function(e, data) {

						countFiles--;
						var thisFileId = 0;

						$.each(self.options.allFiles, function(index, value) {
							if(data.files[0] == value) {
								thisFileId = index;
							}
						});
						reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"]').find(".progress").remove();
						reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"]').find('.file-remove').css('display', '');
						reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"]').removeClass("uploading");
						var cFile = new Array();
						if(typeof data.jqXHR.responseText != 'undefined' && data.jqXHR.responseText != '') {
							cFile = JSON.parse(data.jqXHR.responseText);
						} else {
							cFile = data.files;
							cFile[0].name = data.files[0].name;
						}
						var ctFile;
						if(cFile[0].name != null) {
							ctFile = cFile[0];
						}
						if(cFile[1] && cFile[1].name != null) {
							ctFile = cFile[1];
						}
						self.options.filesTemp[thisFileId] = ctFile;
						if(countFiles == 0) {
							if(reviewsContent.find(".finish-review").hasClass("disabled")) {
								reviewsContent.find(".finish-review").removeClass("disabled");
							}
						}
						if(countFiles == 0) {
							reviewsContent.find(".actions .loader").removeClass("active");
						}
						$.each(reviewsContent.find('#reviews-list li'), function() {
							var filenameAttr = $(this).attr('data-filename');
							if(typeof filenameAttr !== 'undefined' && filenameAttr !== false) {
								if(ctFile.name == filenameAttr) {
									$(this).remove();
								}
							}

						});
						reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"]').attr('data-filename', ctFile.name);
						reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"]').append('<a class="file-remove-cr" href="javascript:void(0)"><i class="icon-file-remove"></i></a>');


					})
					.bind('fileuploadprogress', function(e, data) {

						var thisFileId = 0;
						$.each(self.options.allFiles, function(index, value) {
							if(data.files[0] == value) {
								thisFileId = index;
							}
						});
						reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"]').find(".bar").css('width', Math.ceil(data.loaded / data.total * 100).toString() + "%")
					})
					.bind('fileuploadalways', function(e, data) {
					})
					.bind('fileuploadfail', function(e, data) {
						var showCustomError = false;
						var customErrorMessage = '';
						try {
							if(data.jqXHR.responseText && $.parseJSON(data.jqXHR.responseText)) {
								var response = $.parseJSON(data.jqXHR.responseText);

								$('.upload-errors-container').append('<div class="alert alert-error"><i class="icon-error"></i><span>' + response.errorMessage + '</span></div>');

								if(response.status == 412) {
									showCustomError = true;
									customErrorMessage = response.errorMessage;
								}

							}
						} catch(e) {
							/*leaving empty catch in case json request not returning json, later behavior is same as in other cases */
						}

						countFiles--;
						var thisFileId = 0;
						$.each(self.options.allFiles, function(index, value) {
							if(data.files[0] == value) {
								thisFileId = index;
							}
						});
						var listWrapper = reviewsContent.find('#reviews-list  li[fileindex="' + thisFileId + '"]').parents('.uploaded-files-list');
						reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"] span.filename').css('color', '#FF0000');
						if(showCustomError) {
							reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"] span.filename').html(reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"] span.filename').html() + '(' + customErrorMessage + ')');
						} else {
							reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"] span.filename').html(reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"] span.filename').html() + '(error)');
						}

						if(countFiles == 0) {
							reviewsContent.find(".actions .loader").removeClass("active");
							if(reviewsContent.find(".finish-review").hasClass("disabled")) {
								reviewsContent.find(".finish-review").removeClass("disabled");
							}
						}

						if(!showCustomError) {
							reviewsContent.find('#reviews-list li[fileindex="' + thisFileId + '"]').remove();
							
							if(listWrapper.children().length == 0) {
								reviewsContent.find('.review-list').find(".empty-set-placeholder").fadeIn();
								reviewsContent.find('.actions').fadeOut();
								listWrapper.remove();
							}
						}


					});

				if(window.FileReader && Modernizr.draganddrop) {
					$(document).bind('dragover', function(e) {
						if(!reviewsContent.find('.empty-set-placeholder').hasClass('active')) {
							reviewsContent.find('.empty-set-placeholder').addClass('active');
						}
					});

					$(document).bind('drop', function(e) {
						reviewsContent.find('.empty-set-placeholder').removeClass('active');
						if(reviewsContent.find('#reviews-list').children().length == 0) {
							reviewsContent.find('.upload-button-wrapper').css('display', 'block');
						}
						//reviewsContent.find('.empty-set-placeholder').removeClass('active');
					});
					window.addEventListener("dragover", function(e) {
						e = e || event;
						e.preventDefault();
					}, false);
					window.addEventListener("drop", function(e) {
						e = e || event;
						e.preventDefault();
					}, false);
					$(document).bind('dragleave', function(e) {
						reviewsContent.find('.empty-set-placeholder').removeClass('active');
					});
					$(document).bind('dragover', function(e) {
						var dropZone = dropZone1,
							timeout = window.dropZoneTimeout;
						if(!timeout) {
							dropZone.addClass('in');
						} else {
							clearTimeout(timeout);
						}
						window.dropZoneTimeout = setTimeout(function() {
							window.dropZoneTimeout = null;
							//reviewsContent.find('.empty-set-placeholder').removeClass('active');
						}, 100);
					});
				}
			},
			"#responsible-change .search-field input keyup": function(element) {
				var filter = element.val();
				if(filter) {
					$.each(element.parents("#responsible-change").find("ul.contacts-list").find("li:not(:Contains(" + filter + "))"), function() {
						$(this).hide();
					});
					$.each(element.parents("#responsible-change").find("ul.contacts-list").find("li:Contains(" + filter + ")"), function() {
						$(this).show();
					});
				} else {
					element.parents("#responsible-change").find("ul.contacts-list li").show();
				}
			},
			// pagination buttons events prev and next
			pagination: function(projectID, projectDiv, buttonID) {
				var self = this;
				var taskTabLink = projectDiv.find('.tasks-tab-link');
				var nthChild = taskTabLink.parent().index() + 1;
				// var paginationNumbersButtons = $('.pagination__list__item__button');
				if(buttonID === 'next-tasks') {
					if(self.options.tasksItems > self.options.pageOffset +1) {
						self.options.pageOffset += self.options.pageLimit;
						self.options.currentPage ++;
					}
				} else if (buttonID === 'prev-tasks')  {
					if(self.options.pageOffset > 0) {
						self.options.pageOffset -= self.options.pageLimit;
						self.options.currentPage --;
					}
				}

				if(projectDiv.hasClass('module-quote')) {
					self.loadTasksInQuote(projectID, projectDiv, nthChild);
				} else if(projectDiv.hasClass('module-project')) {
					self.loadTasks(projectID, projectDiv, false, false, nthChild);
				}
			}
			








		});
	});