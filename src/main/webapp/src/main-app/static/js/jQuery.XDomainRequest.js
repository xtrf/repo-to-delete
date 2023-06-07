// jQuery.XDomainRequest.js
// Author: Jason Moon - @JSONMOON
// IE8+
if (!jQuery.support.cors && window.XDomainRequest) {
	var httpRegEx = /^https?:\/\//i;
	var getOrPostRegEx = /^get|post$/i;
	var sameSchemeRegEx = new RegExp('^'+location.protocol, 'i');
	var xmlRegEx = /\/xml/i;
	
	// ajaxTransport exists in jQuery 1.5+
	jQuery.ajaxTransport('text html xml json', function(options, userOptions, jqXHR){
		
	
		// XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
		if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(userOptions.url) && sameSchemeRegEx.test(userOptions.url)) {
			var xdr = null;
			var userType = (userOptions.dataType||'').toLowerCase();
			return {
				send: function(headers, complete){
					xdr = new XDomainRequest();
					if (/^\d+$/.test(userOptions.timeout)) {
						xdr.timeout = 5000;
					}
					xdr.ontimeout = function(){
						complete(500, 'timeout');
					};
					xdr.onload = function(){
						var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
						var status = {
							code: 200,
							message: 'success'
						};
						var responses = {
							text: xdr.responseText
						};
						/*
						if (userType === 'html') {
							responses.html = xdr.responseText;
						} else
						*/
						try {
							if (userType === 'json') {
								/*
								try {
									responses.json = JSON.parse(xdr.responseText);
									
									
								} catch(e) {
									if(xdr.responseText){
										responses.json= {"value":xdr.responseText};
									}else{
									
									status.code = 500;
									status.message = 'parseerror';
									}
									//throw 'Invalid JSON: ' + xdr.responseText;
								}
								*/
								if(JSON.parse(xdr.responseText)){
									responses.json = JSON.parse(xdr.responseText);
								}else{
									responses.json= {"value":xdr.responseText};
								}
								
							} else if ((userType === 'xml') || ((userType !== 'text') && xmlRegEx.test(xdr.contentType))) {
								var doc = new ActiveXObject('Microsoft.XMLDOM');
								doc.async = false;
								try {
									doc.loadXML(xdr.responseText);
								} catch(e) {
									doc = undefined;
								}
								if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
									status.code = 500;
									status.message = 'parseerror';
									throw 'Invalid XML: ' + xdr.responseText;
								}
								responses.xml = doc;
							}
						} catch(parseMessage) {
							throw parseMessage;
						} finally {

							complete(status.code, status.message, responses, allResponseHeaders);
						}
					};
					xdr.onerror = function(){
						complete(500, 'error', {
							text: xdr.responseText
						});
					};
					xdr.ontimeout = function () {
	                   // alert('xdr ontimeout');
	                };
	                xdr.onprogress = function () {
	                    //alert("XDR onprogress");
	                   // alert("Got: " + xdr.responseText);
	                };
	                
					xdr.open(options.type, options.url);
					
					setTimeout(function () {
					   // console.log(JSON.stringify(userOptions.data));
					   // console.log("type22:");
						//console.log();
						if(options.type=="POST" && userOptions.data!=null)
							xdr.send(JSON.stringify(userOptions.data));
						else
							xdr.send();
					}, 0);
					
					//xdr.send();
				},
				abort: function(){
					if (xdr) {
						xdr.abort();
					}
				}
			};
		}
	});
}