steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	'./../static/js/vendor/jquery.ui.widget.js',

	function($) {

		$.Model('Office', {
			getQueryId: function(id) {
				if (id === 'ALL') { return ''; }
				return id;
			},

			findAll: function(params, options, success, error) {
				var queryString;

				params = typeof params === 'undefined' ? {} : params;
				options = $.extend(true, {
					includeAll: false
				}, options);

				queryString = queryBuilder(params);

				return $.ajax({
					url: baseURL + 'offices' + addToURL + queryString,
					dataType: 'json',
					dataFilter: function(data) {
						var allOffices;

						if (options.includeAll) {
							data = JSON.parse(data);

							allOffices = $.localize.data['i18n/customers'].modules.reports['all-offices'];

							if (data.length > 1) {
								data.unshift({
									id: 'ALL',
									name: allOffices ? allOffices : 'All Offices'
								});
							}

							data = JSON.stringify(data);
						}

						return data;
					},
					xhrFields: { withCredentials: true },
					success: success,
					error: error
				});
			},

			findOne: function(id, success, error) {
				return $.ajax({
					url: baseURL + 'offices/' + id + addToURL,
					dataType: 'json',
					xhrFields: { withCredentials: true },
					success: success,
					error: error
				});
			}
		}, {});


		$.Controller('Offices', {
			init: function() {},

			openChangeOfficeModal: function(forClassName, id) {
				var ClassName;
				var self = this;

				if (forClassName === 'project') { ClassName = Project; }
				if (forClassName === 'quote')   { ClassName = Quote; }

				if (typeof ClassName === 'undefined') {
					throw new Error('Unknown type `' + type + '` for change office modal');
				}

				$.when(
					Office.findAll(),
					ClassName.findOne(id)
				)
				.done(function(officesArgs, classNameArgs) {
					var office;

					self.offices = officesArgs[0];
					self.object = classNameArgs[0];

					$.each(self.offices, function(index, item) {
						if (item.name === self.object.office.name) {
							office = item;
						}
					});

					self.priceProfiles = office.priceProfiles;

					$('#myModal').remove();
					$('body').append('templates/offices/change_office_modal.ejs', {
						offices: self.offices,
						priceProfiles: self.priceProfiles,
						object: self.object
					});

					$('#myModal').on('hidden', function() {
						$('#myModal').remove();
						$('.modal-backdrop').remove();
						$(document).off('click.changeOffice');
					});

					$('.js-select2').select2({
						width: '320px',
						minimumResultsForSearch: 10,
						allowClear: true
					}).on('change', function(event) {
						if (event.target.id !== 'select-office') { return; }

						$('#select-price-profile')
							.html(function() {
								var html = '';
								var office;

								html += '<option></option>';

								$.each(self.offices, function(index, item) {
									if (item.name === $('#select-office').val()) {
										office = item;
									}
								});

								$.each(office.priceProfiles, function(index, priceProfile) {
									html += '<option value="' + priceProfile.name + '">';
									html += priceProfile.name;
									html += '</option>';
								});

								return html;
							})
							.trigger('change');
					});

					$('#myModal').modal('show');

					setVerticalModalMargin();

					$(document).on('click.changeOffice', '.js-change-office-button', function() {
						var changeOffice = {
							office: { name: $('#select-office').val() },
							priceProfile: { name: $('#select-price-profile').val() },
							recalculateRates: $('#recalculate-price-profiles').prop('checked')
						};

						if (! changeOffice.office.name) {
							delete changeOffice.office;
						}

						if (! changeOffice.priceProfile.name) {
							delete changeOffice.priceProfile;
						}

						if (! self.isValid(changeOffice)) { return; }

						ClassName
							.updateOffice(id, changeOffice)
							.done(function() {
								$('#myModal').modal('hide');

								var objectDiv = $('[' + forClassName + '-id="' + id + '"]');

								if (objectDiv.length === 0) {
									objectDiv = $('.module.module-' + forClassName + '[' + forClassName + 'id2="' + id + '"]');
								}

								ClassName
									.findOne(id)
									.done(function(object) {
										objectDiv
											.find('.module-office')
												.text(object.office.name)
												.end()
											.find('.amount span')
												.text(object.totalAgreed.formattedAmount);
									})
									.fail(errorHandle);

								$(document).off('click.changeOffice');
							})
							.fail(function(error) {
								$(document).off('click.changeOffice');
								errorHandle(error);
							});
					});
				})
				.fail(function(error) {
					$(document).off('click.changeOffice');
					errorHandle(error);
				});
			},

			isValid: function(changeOffice) {
				var isValid = true;

				if (! changeOffice.office) {
					$('#select-office').closest('.control-group').addClass('error');
					isValid = false;
				}

				if (! changeOffice.priceProfile && this.priceProfiles.length > 1)  {
					$('#select-price-profile').closest('.control-group').addClass('error');
					isValid = false;
				}

				return isValid;
			},

			openChangeQuoteOfficeModal: function(invoiceID) {
				this.openChangeOfficeModal('quote', invoiceID);
			},

			openChangeProjectOfficeModal: function(projectID) {
				this.openChangeOfficeModal('project', projectID);
			}
		});
});
