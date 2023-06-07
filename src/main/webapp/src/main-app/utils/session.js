function getSession(){
  var session=false;

  var sessionURL='';

  if($.cookie("jsessionid")!=null){
    sessionURL=baseURL + 'system/session.json;jsessionid='+$.cookie("jsessionid");
  }
  else{
    if (!$.support.cors && window.XDomainRequest) {
      sessionURL=baseURL + 'system/session.json';
    }else{
      sessionURL=baseURL + 'system/session';
    }
  }

  $.ajax({
    url: sessionURL,
    dataType: 'json',
    timeout : 60000,
    xhrFields: { withCredentials: true},
    success: function(httpObj){
      if(httpObj.type=="Customer")
        customerID=httpObj.id;
      else if(httpObj.type=="CustomerPerson")
        customerID=httpObj.parentId;
      session=httpObj;

      $.ajax({
        url: baseURL+'customers/'+customerID+'/sales/persons'+addToURL,
        dataType: 'json',
        timeout : 60000,
        xhrFields: { withCredentials: true},
        success: function(salesData){
          salesData.pmResponsible.avatar=baseURL+'users/'+salesData.pmResponsible.id+'/image?width=63&height=63&crop=true';
          salesData.salesPerson.avatar=baseURL+'users/'+salesData.salesPerson.id+'/image?width=63&height=63&crop=true';

          if(salesData.additionalResponsibles!=null)
            $.each(salesData.additionalResponsibles,function(index,value){
              salesData.additionalResponsibles[index].avatar=baseURL+'users/'+salesData.additionalResponsibles[index].id+'/image?width=63&height=63&crop=true';
            });

          salesDataGlobal=salesData;
			$.ajax({
				url: baseURL+'system/customizations'+addToURL,
				dataType: 'json',
				timeout : 60000,
				xhrFields: { withCredentials: true},
				success: function(customizations){
					systemCustomizations = customizations;
					fillSession(session);
				}});
        },
        error: function(error){

          fillSession(session);
          //location.href="index.html";
        }
      });


    },
    error: function(httpObj){
      session=false;
      fillSession(null);
      //location.href="index.html";
    }
  });
  return session;

}

function setTitle(value,dataLocalize,suffix){
  // default text transform depending on locale
  if(window.sessionObject.locale === 'el') {
    setTimeout(function() {
      $('html').addClass('text-transform-none');
    }, 0);
  } else {
    $('html').removeClass('text-transform-none');
  }
  $("body").append('<span id="temp2" style="display:none;" data-localize="'+dataLocalize+'"></span>');
  $("#temp2[data-localize]").localize("i18n/customers", { language: sessionObject.locale });
  var titlePrefix=value;
  if($.trim($("#temp2").html())!=""){
    titlePrefix=$("#temp2").html();
  }
  $("#temp2").remove();

  if(suffix)
    titlePrefix+=" "+suffix;

  if(portalName==""){
    $("body").append('<span id="temp2" style="display:none;" data-localize="page-titles.partner-portal-title">Partner Portal</span>');
    $("#temp2[data-localize]").localize("i18n/customers", { language: sessionObject.locale });
    portalName=$("#temp2").html();
    $("#temp2").remove();
  }
  if(companyName==""){
    $.ajax({
      url: baseURL+'system/companyName'+addToURL,
      dataType: 'text',
      type: "GET",
      xhrFields: { withCredentials: true},
      success: function(data){
        companyName=data;

        document.title=titlePrefix+" - "+portalName+" | "+companyName;

      }
    });
  }else{
    document.title=titlePrefix+" - "+portalName+" | "+companyName;
  }


}