var appendCssVariables = function() {
    // fallback colors 
	var colors = {
        topNavigationBackgroundColor: '#FBFBFB',
        topNavigationBackgroundHoverColor: '#FBFBFB',
        topNavigationFontColor: '#535353',
        mainComponentsPrimaryColor: '#00BA00',
        mainComponentsPrimaryHoverColor: '#00AD00',
        mainComponentsTabsColor: '#535353',

        mainComponentsFontColor: "#FFFFFF",
        topNavigationButtonsColor: "#B03127",
        topNavigationButtonsHoverColor: "#B03127"
    }

    $.ajax({
		url: baseURL + 'branding/colors' + addToURL,
		dataType: 'json',
		type: "GET",
		xhrFields: { withCredentials: true},
        success: function(_colors) {
			$.extend(colors, _colors);
        }
	}).always(function() {
        $.each(colors, function (name, value) {
            var variableName = '--' + name;
            document.body.style.setProperty(variableName, value);
        });
    });
};