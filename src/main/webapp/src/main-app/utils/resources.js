steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	function($) {
		$.Model('Resource', {
				findAll: function(params, success, error) {
					var queryString = queryBuilder(params);
					return $.ajax({
						url: baseURL + 'resources' + addToURL + queryString,
						dataType: 'json',
						xhrFields: { withCredentials: true},
						success: success,
						error: error
					});
				}
			},
			{});

		$.Controller("Resources", {
			init: function(element, options) {
				var self = this;
				self.showResources(options.targetDiv, options);
			},
			showResources: function(element, page, success) {

				Resource.findAll({limit: 10000, start: 0}, function(resources, status, responseData) {

					$(".modal-my-account .tab-pane .wrapper").html("");

					element.html("templates/resources/resources_list.ejs", {resources: resources});

					if(areResourcesPartial()) {
						element.prepend('<div class="alert alert-warning resources-alert" data-localize="modules.resources.partial-resources-error">An error occurred while getting some resources from the CAT tool. Please contact your administrator.</div>');
					}

					$("body").append('<span style="display:none;" id="temp00" data-localize="general.no-matching-records">No matching records found</span>');
					var sZeroRecords = $("#temp00").html();
					$("#temp00").remove();
					$.fn.dataTableExt.oStdClasses.sPaging = "pagination pagination_centered pagination_";
					$.fn.dataTableExt.oStdClasses.sPageButtonActive = "active";
					$('#resources-table').dataTable({
						_filterHtml: 'test',
						bLengthChange: false,
						iDisplayLength: historyPageLimit,
						sPaginationType: "full_numbers",
						bInfo: false,
						"oLanguage": {
							"sZeroRecords": sZeroRecords
						}
					});

					$("#resources-table_filter input").attr('placeholder', 'Search...');
					$("#resources-table_filter input").attr('data-localize-2', 'general.search');
					localizeAttribute("#resources-table_filter input", "placeholder", null);

					$("#resources-tab .wrapper>#resources-table_filter").remove();
					dontShowLoader();

					var filterInput = $("#resources-table_filter input").detach();

					$(".resources-header .search-input-wrapper").append(filterInput);

					if(success)
						success();

					updateMenuActivity(null);

					function areResourcesPartial() {
						return responseData.status === 206;
					}

				}, function(error) {
					errorHandle(error);
					location.hash = "#!";
					dontShowLoader();

				});

			}

		});

	});