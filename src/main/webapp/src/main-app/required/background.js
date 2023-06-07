(function() {
	var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
	link.type = 'image/x-icon';
	link.rel = 'icon';
	link.href = baseURL+'branding/images?type=CUSTOMER_PORTAL_FAVICON&v=' + Math.floor(Date.now() / 1000);
	document.getElementsByTagName('head')[0].appendChild(link);

})();