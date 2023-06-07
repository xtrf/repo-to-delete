var loadSettings = function(callback) {
	var defaultSettings = { adsDisabled: false };

	$.ajax({
		url: baseURL + 'system/settings' + addToURL,
		dataType: 'json',
		type: 'GET',
		xhrFields: { withCredentials: true },
		success: function(data) {
			callback(data);
		},
		error: function() {
			callback(defaultSettings);
		}
	});
};