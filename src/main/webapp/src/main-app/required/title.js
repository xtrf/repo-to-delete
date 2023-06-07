(function() {

    var opts = {
        method: 'GET',
        headers: {}
      };
      setTimeout(function(){
        fetch( window.baseURL + 'branding/customer-portal-branding-enabled', opts).then(function (response) {
          return response.json();
        })
        .then(function (res) {
          generateTitle(res);
          window.brandingChanged = res.lastBrandingChange;
        });
      }, 100);
    function generateTitle (res) {
        var title = document.getElementsByTagName('title')[0];
        title.innerHTML = res.customerPortalBrandingEnabled ? 'Customer Portal' : 'XTRF Customer Portal';
    }

})();