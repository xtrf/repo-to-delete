'use strict';
var DateRangePickerFactory = (function() {

	return function(datePickers, controller, countQueryParams, findQueryParams, reloadList) {
		var calendarLocale = helperController.calendarLocale();
		var dateFormat = 'YYYY-MM-DD';
		var locale = calendarLocale[sessionObject.locale] ? sessionObject.locale : 'en-us';
		locale = locale.toLowerCase().replace('_', '-');

		var options = {
			autoUpdateInput: false,
			autoApply: true,
			showDropdowns: true,
			alwaysShowCalendars: true,
			linkedCalendars: false,
			locale: {
				format: dateFormat,
				daysOfWeek: calendarLocale[locale].daysShort,
				monthNames: calendarLocale[locale].months
			}
		};

		_.each(datePickers, function(datePicker) {
			datePicker.options = $.extend({}, options);
		})

		return {
			options: options,
			initElements: function() {
				_.each(datePickers, function(datePicker) {
					initDatePickerElement(datePicker);
				});
			},
			init: initOptions
		}

		function initOptions() {
			_.each(datePickers, function(datePicker) {
				if (controller.options[datePicker.name]) {

					countQueryParams[datePicker.from] = findQueryParams[datePicker.from] = controller.options[datePicker.name].from;
					countQueryParams[datePicker.to] = findQueryParams[datePicker.to] = controller.options[datePicker.name].to;
					datePicker.options.startDate = moment(controller.options[datePicker.name].from, "x").format(dateFormat);
					datePicker.options.endDate = moment(controller.options[datePicker.name].to, "x").format(dateFormat);
				}
			})
		}

		function initDatePickerElement(datePicker) {
			var datePickerElement = $('input[name="' + datePicker.name + '"]');
			var clearPickerElement = $('.clear-datepicker[data-target="' + datePicker.name + '"]');
			datePickerElement.daterangepicker(datePicker.options);
			if (datePicker.options.startDate && datePicker.options.endDate) {
				datePickerElement.val(datePicker.options.startDate + ' - ' + datePicker.options.endDate);
				clearPickerElement.css('display', 'block');
			} else {
				clearPickerElement.css('display', 'none');
			}
			datePickerElement.on('apply.daterangepicker', function(ev, picker) {
				$(this).val(picker.startDate.format(dateFormat) + ' - ' + picker.endDate.format(dateFormat));
				controller.options[datePicker.name] = {from: picker.startDate.format('x'), to: picker.endDate.format('x')};
				controller.options.page = 1;
				reloadList.call(controller, controller.options.targetDiv, controller.options);
			});
		}

	};
})();