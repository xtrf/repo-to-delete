var loadSecuritySettings = function(callback) {
	var defaultSettings = { localAuthEnabled: true, ssoEnabled: true };

	$.ajax({
        url: homeApiUrl + 'settings/security/client-portal' + addToURL,
        dataType: 'json',
        type: "GET",
        xhrFields: { withCredentials: true},
        success: function(data) {
			callback(data);
		},
		error: function() {
			callback(defaultSettings);
		}
    });
};