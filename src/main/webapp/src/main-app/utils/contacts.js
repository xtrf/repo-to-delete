steal(	'jquery/class',
  'jquery/model',
  'jquery/view/ejs',
  'jquery/controller',
  'jquery/controller/route',

  function($){

    $.Model('ContactModel',{
      salesData : function( success, error ){

        return $.ajax({
          url: baseURL+'customers/'+customerID+'/sales/persons'+addToURL,
          dataType: 'json',
          xhrFields: { withCredentials: true},
          success: function(data){
            helperController.updateSalesData(data);
            success(data);
          },
          error: error
        });
      },
      contactDetails: function(userID, success, error ){
        return $.ajax({
          url: baseURL+'users/'+userID+addToURL,
          dataType: 'json',
          xhrFields: { withCredentials: true},
          success: success,
          error: error
        });
      }
    },{});



    $.Controller("Contacts",{
      init : function( element , options ){
        if(options.inSingle!=null){

        }else{
          if(options.isDashboard!=null)
            this.showContactDashboard(options.targetDiv , options);
          else
            this.showContact(options.targetDiv , options);
        }
      },
      showContactDashboard:function(element,options){
        ContactModel.salesData(function(salesData){
          salesData.pmResponsible.avatar=baseURL+'users/'+salesData.pmResponsible.id+'/image?width=63&height=63&crop=true';
          salesData.salesPerson.avatar=baseURL+'users/'+salesData.salesPerson.id+'/image?width=63&height=63&crop=true';

          element.html("templates/dashboard/dashboard_contacts.ejs",salesData);
          element.find(".overlay").remove();
        },function(error){
          if(error.status!=403)
            errorHandle(error);
          element.addClass('module-empty');
          element.html("templates/dashboard/dashboard_403_contacts.ejs",{});
        });
      },
      showContact:function(element,options){
        ContactModel.salesData(function(salesData){
            salesData.pmResponsible.avatar=baseURL+'users/'+salesData.pmResponsible.id+'/image?width=63&height=63&crop=true';
            salesData.salesPerson.avatar=baseURL+'users/'+salesData.salesPerson.id+'/image?width=63&height=63&crop=true';
            if(salesData.additionalResponsibles!=null)
              $.each(salesData.additionalResponsibles,function(index,value){
                salesData.additionalResponsibles[index].avatar=baseURL+'users/'+salesData.additionalResponsibles[index].id+'/image?width=63&height=63&crop=true';
              });
            element.html("templates/contacts/right_contacts.ejs",salesData);

          },
          function(error){
            if(error.status==403) {
              element.html("templates/contacts/right_contacts_403.ejs",{});
            }else
              errorHandle(error);
          }
        );

      },
      "#instant-contact click":function(element){

        if(!element.hasClass('clicked')){
          element.addClass('clicked');
          this.contactModal(element);
        }

      },
      "#instant-contact-2 click":function(element){
        /*var self=this;

         if(!element.parents('div.module').hasClass('active'))
         self.contactModal(element);
         */

      },
      ".quick-message click":function(element){
        if(!element.hasClass('clicked')){
          element.addClass('clicked');
          if(element.attr("user-name")!="" && element.attr("user-name")!="")
            this.contactModal(element,element.attr("user"),element.attr("user-name"),element.attr("user-position"));
          else
            this.contactModal(element,element.attr("user"));

        }
      },
      "#contacts-list click":function(element){

        return false;
      },
      contactModal:function(element,preSelect,preName,prePosition){
        self=this;
        ContactModel.salesData(function(salesData){
            var avContacts= new Array();
            var count=0;
            var fromSelect=false;
            if(!preSelect) fromSelect=true;

            if(salesData.pmResponsible.id==salesData.salesPerson.id){
              avContacts[0]=salesData.pmResponsible;

            }else{
              avContacts[0]=salesData.pmResponsible;
              avContacts[1]=salesData.salesPerson;
              count=1;
            }
            if(salesData.additionalResponsibles!=null)
              $.each(salesData.additionalResponsibles,function(index,value){
                count++;
                avContacts[count]=value;
              });


            if(preSelect)
              $.each(avContacts,function(index,value){
                if(preSelect==value.id) fromSelect=true;
              });

            if(!fromSelect){
              avContacts[avContacts.length]={id:preSelect,position:prePosition,name:preName};
            }



            $("#myModal").remove();
            $("body").append("templates/contacts/nm_quick_message.ejs",{"avContacts":avContacts});



            localizeAttribute("#select-contact","data-placeholder","");


            $('#myModal').on('hidden', function () {
              $('#myModal').remove();
              $(".modal-backdrop").remove();
            });

            $("#myModal").modal('show');

            setVerticalModalMargin();

            $(".chosen-process").select2({
              width: 'element',
              minimumResultsForSearch: 10,
              allowClear: true
            }).change(function(){
                $("#myModal").find("#s2id_select-contact").css('display','none');
                $("#myModal").find(".contact-info").css('display','table');
                $("#myModal").find(".contact-info").find(".name").html($("#select-contact").children('option[value="'+$("#select-contact").val()+'"]').html());
                $("#myModal").find(".contact-info").find(".job-title").html($("#select-contact").children('option[value="'+$("#select-contact").val()+'"]').attr("position"));
                $("#myModal").find(".contact-info").find(".profile-pic img").attr("src",baseURL+'users/'+$("#select-contact").val()+'/image?width=63&height=63&crop=true');



              });



            $("#send-quick-message").unbind('click');


            $("#send-quick-message").click(function(){
              self.sendQuickMessage($(this));
              return false;

            });

            /*zmiana selecta na avatar + info */



            $("#contact-info-details .close").click(function(){
              $("#select-contact").select2("val","");
              $(this).parents("#contact-info-details").css("display","none");
              $("#myModal").find("#s2id_select-contact").css('display','block');

            });

            /*koniec */




            $("#select-contact").change(function(){
              if($(this).parents(".control-group").hasClass("error"))
                $(this).parents(".control-group").removeClass("error");
            });
            if(preSelect){
              $("#myModal .contact-info").css("display","table");
              $("#myModal").find("#s2id_select-contact").css('display','none');
              $.each(avContacts,function(index,value){
                if(value.id==preSelect){
                  $("#myModal .contact-info").find(".name").html(value.name);
                  $("#myModal .contact-info").find(".job-title").html(value.position);
                  $("#select-contact").val(preSelect);
                  $("#myModal").find(".contact-info").find(".profile-pic img").attr("src",baseURL+'users/'+preSelect+'/image?width=63&height=63&crop=true');

                }
              });

            }



            element.removeClass('clicked');


            $("#quick-message-subject,#quick-message-content").keypress(function(){
              if($(this).parents(".control-group").hasClass("error"))
                $(this).parents(".control-group").removeClass("error");
            });


          },
          function(error){
            element.removeClass('clicked');
          });

      },


      sendQuickMessage:function(element){
        var doSend=true;
        if($("#quick-message-subject").val()==""){
          doSend=false;
          $("#quick-message-subject").parents(".control-group").addClass("error");
        }
        if(isNaN(parseFloat(element.parents(".modal").find("#select-contact").val()))){
          doSend=false;
          $("#select-contact").parents(".control-group").addClass("error");
        }

        if($("#quick-message-content").val()==""){
          doSend=false;
          $("#quick-message-content").parents(".control-group").addClass("error");
        }


        if(doSend){
          element.parents(".modal").find(".modal-footer").append(loaderString);
          $.ajax({
            url: baseURL+'system/account/mail/'+element.parents(".modal").find("#select-contact").val(),
            dataType: 'json',
            type:"POST",
            data: {"subject":$("#quick-message-subject").val(),message:$("#quick-message-content").val()},
            xhrFields: { withCredentials: true},
            success: function(msg){

              element.parents(".modal").find(".modal-footer").children('.overlay').remove();
              element.parents(".modal").find(".content .alert").remove();
              element.parents(".modal").find(".content").prepend('<div class="alert alert-message alert-success"><div class="success-image"></div><br><span data-localize="contact.message-sent">Message sent! Thank you!</span></div>');
              element.parents(".modal").find("form").remove();
              $("#select-contact").val('').trigger("liszt:updated");;
              $("#quick-message-content").val("");
              $("#quick-message-subject").val("");
              if($("#myModal").find("#s2id_select-contact").length>0){
                $("#select-contact").select2("val","");
                $("#myModal").find("#contact-info-details").css("display","none");
                $("#myModal").find("#s2id_select-contact").css('display','block');
              }

              setTimeout(function(){
                $("#myModal, .modal-backdrop").fadeOut(function(){
                  $(this).remove();
                });
              }, 2000);


            },
            error: function(error){
              element.parents(".modal").find(".modal-footer").children('.overlay').remove();
              element.parents(".modal").find(".content .alert").remove();
              element.parents(".modal").find(".content").prepend('<div class="alert alert-message alert-error"><i class="icon-error"></i><span data-localize="contact.message-not-sent">Sorry! There was some problem during sending message. Please try again or contact us via e-mail.</span></div>');
            }
          });
        }
        return false;

      },
      ".contact-us click":function(element){

        $("#myModal").remove();
        $("body").append("templates/contacts/nm_quick_message_2.ejs",{});



        if(element.hasClass('password-recovery')){
          $("#myModal").append('<span id="temp1" data-localize="contact.pr-subject">Problem with password recovery</span>');
          $("#myModal").append('<span id="temp2" data-localize="contact.pr-message">My username/email is #USERNAME# and I have problem with password recovery.</span>');
          $("[data-localize]").localize("i18n/customers", { language: $.cookie("language") });
          $("#quick-message-subject").val($("#myModal #temp1").html());
          $("#quick-message-content").val($("#myModal #temp2").html().replace("#USERNAME#",$("#username").val()));
          $("#myModal #temp1").remove();
          $("#myModal #temp2").remove();

        }
        $("[data-localize]").localize("i18n/customers", { language: $.cookie("language") });

        $("#myModal .modal-close").click(function(){

          $("#myModal").modal('hide');
        });

        $('#myModal').on('hidden', function () {
          $('#myModal').remove();
          $(".modal-backdrop").remove();
        });





        $("#myModal").modal('show');
        setVerticalModalMargin();

        $("#send-quick-message").unbind('click');
        $("#send-quick-message").click(function(){

          element2=$(this);
          var doSend=true;
          if($("#quick-message-subject").val()==""){
            doSend=false;
            $("#quick-message-subject").parents(".control-group").addClass("error");
          }

          if($("#quick-message-content").val()==""){
            doSend=false;
            $("#quick-message-content").parents(".control-group").addClass("error");
          }
          if(doSend){
            element.parents(".modal").find(".modal-footer").append(loaderString);
            $.ajax({
              url: baseURL+'system/mail/contact',
              dataType: 'json',
              type:"POST",
              data: {"subject":$("#quick-message-subject").val(),message:$("#quick-message-content").val(),key:$("#login").val()},
              xhrFields: { withCredentials: true},
              success: function(msg){




                element2.parents(".modal").find(".modal-footer").children('.overlay').remove();
                element2.parents(".modal").find(".content .alert").remove();
                element2.parents(".modal").find(".content").prepend('<div class="alert alert-message alert-success"><div class="success-image"></div><br><span data-localize="contact.message-sent">Message sent! Thank you!</span></div>');
                element2.parents(".modal").find("form").remove();
                $("#quick-message-content").val("");
                $("#quick-message-subject").val("");

                setTimeout(function(){
                  $("#myModal, .modal-backdrop").fadeOut(function(){
                    $(this).remove();
                  });
                }, 2000);


              },
              error: function(error){
                element2.parents(".modal").find(".modal-footer").children('.overlay').remove();
                element2.parents(".modal").find(".content .alert").remove();
                element2.parents(".modal").find(".content").prepend('<div class="alert alert-message alert-error"><i class="icon-error"></i><span data-localize="contact.message-not-sent">Sorry! There was some problem during sending message. Please try again or contact us via e-mail.</span></div>');

              }
            });
          }
        });
        return false;


      },
      ".contact-details click":function(element){
        ContactModel.contactDetails(element.attr("user"),function(contactData){

          $("#myModal").remove();
          contactData.avatar=baseURL+'users/'+contactData.id+'/image?width=63&height=63&crop=true';

          $("body").append('templates/contacts/nm_contact_details.ejs',{contactData:contactData});



          $("#myModal .modal-close").click(function(){
            $("#myModal").modal('hide');
          });

          $('#myModal').on('hidden', function () {
            $('#myModal').remove();
            $(".modal-backdrop").remove();
          });


          $("#myModal").modal('show');
          setVerticalModalMargin();
        });
      },
      ".bc-enabled mouseenter":function(element){

        $(element).data("status", "init");

        ContactModel.contactDetails(element.attr("data-user"), function(contactData){
          contactData.avatar=baseURL+'users/'+contactData.id+'/image?width=53&height=53&crop=true';

          setTimeout(function(){
            if($(".module-sidebar").find(".bc").length==0 && $(element).data("status")!="left"){
              $(element).data("status", "initialized");
              $(".module-sidebar").append('templates/contacts/contact_popover_bc.ejs',{contactData:contactData});
              var bc = $(".module-sidebar").find(".bc");
              $(bc).on("mouseenter", function(){
                $(bc).addClass("hovered");
              });
              $(bc).on("mouseleave", function(){
                $(bc).stop(true,true).animate({
                  "opacity":0,
                  "top": $(element).offset().top-bc.outerHeight()+8-$(window).scrollTop()
                },200, function(){
                  $(this).detach();
                });
              });

              bc.css({
                "left": $(element).position().left-bc.outerWidth()+$(element).width()/2+20,
                "top": $(element).offset().top-bc.outerHeight()-$(window).scrollTop()
              }).animate({
                  "opacity":1,
                  "top": $(element).offset().top-bc.outerHeight()-12-$(window).scrollTop()
                },200);
            }
          }, 400);

        });
      },
      ".bc-enabled mouseleave":function(element){
        try{
          $(element).data("status", "left");
          bc = $(".module-sidebar").find(".bc");
          if(bc.length!=0){
            setTimeout(function(){
              if(!bc.hasClass("hovered")){
                $(element).data("status", "left");
                $(bc).stop(true,true).animate({
                  "opacity":0,
                  "top": $(element).offset().top-bc.outerHeight()+8-$(window).scrollTop()
                },200, function(){
                  $(this).detach();
                });
              }
            }, 200);
          }
        }
        catch(err){

        }
      }



    });

  });