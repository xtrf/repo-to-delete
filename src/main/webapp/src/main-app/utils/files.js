steal(	'jquery/class',
  'jquery/model',
  'jquery/view/ejs',
  'jquery/controller',
  'jquery/controller/route',

  function($){
    $.Model('ProjectFile',{
      findInTask: function ( taskID, params, success, error){

        queryString=queryBuilder(params);
        return $.ajax({
          url: baseURL+'projects/tasks/'+taskID+'/files'+addToURL+queryString,
          dataType: 'json',
          xhrFields: { withCredentials: true},
          success: success,
          error: error
        });
      },
      findInTaskInQuote: function ( taskID, params, success, error){

        queryString=queryBuilder(params);
        return $.ajax({
          url: baseURL+'quotes/tasks/'+taskID+'/files'+addToURL+queryString,
          dataType: 'json',
          xhrFields: { withCredentials: true},
          success: success,
          error: error
        });
      },
      count : function (params, success, error){
        queryString=queryBuilder(params);

        return $.ajax({
          url: baseURL+'projects/tasks/count'+addToURL+queryString,
          dataType: 'json',
          xhrFields: { withCredentials: true},
          success: success,
          error: error
        });

      },
      findInProject: function (projectID, params, success, error){
        queryString=queryBuilder(params);
        return $.ajax({
          url: baseURL+'projects/'+projectID+'/files'+addToURL+queryString,
          dataType: 'json',
          xhrFields: { withCredentials: true},
          success: success,
          error: error
        });
      },
      zipContent: function(fileID,success,error){
        return $.ajax({
          url: baseURL+'projects/files/'+fileID+'/zipContent'+addToURL,
          dataType: 'json',
          xhrFields: { withCredentials: true},
          success: success,
          error: error
        });
      },
      findInQuote: function (quoteID, params, success, error){
        return $.ajax({
          url: baseURL+'quotes/'+quoteID+'/files'+addToURL,
          dataType: 'json',
          xhrFields: { withCredentials: true},
          success: success,
          error: error
        });
      }
    },{});


    $.Controller("Files",{
      init:function(element,options){

      },


      appendFileRow:function(projectDiv,parentDiv,row,depth,lastLinkParam){
        var trimTo=50;
        if((row==null) || (row.directories.length==0 && row.files.length==0)){
          parentDiv.append("templates/projects/files_row.ejs",{nofiles:true});
        }else{


          var currentObj=this;
          var newParentDiv;
          if(depth>0){


            if(row.name.length>(trimTo+3)){
              var extension="";
              if(row.name.lastIndexOf('.')!=-1)
                extension = row.name.substr( (row.name.lastIndexOf('.') -10) );
              row.name=row.name.substr(0,trimTo)+"..."+extension;
            }

            parentDiv.append("templates/projects/files_row.ejs",{name:row.name,depth:depth,type:"dir",downloadable:false,fileID:"",lastLink:lastLinkParam,expandableLink:true});
            newParentDiv=parentDiv.children("li:last-child").children("ul");

          }else{
            newParentDiv=parentDiv;
          }
          var countRows=0;
          if(row) {
			  countRows = row.files.length + row.directories.length;
		  }

          var i=0;
          var lastLink=false;

          var counter=0;

          if(row)
            if(row.directories.length>0){
              $.each(row.directories,function(index,directory){
                counter++;
                i++;

                if(i==countRows)
                  currentObj.appendFileRow(projectDiv,newParentDiv,directory,depth+1,true);
                else
                  currentObj.appendFileRow(projectDiv,newParentDiv,directory,depth+1,false);
              });
            }

          if(row){

            $.each(row.files,function(index,file){
              i++;
              var cType="file";
              if(file.zip){
                cType="zip";
              }
              var downloadLink="";
              if(file.downloadable){
                downloadLink=baseURL+"projects/files/"+file.id;
              }
              if(i==countRows) lastLink=true;


              if(file.name.length>(trimTo+3)){
                var extension = file.name.substr( (file.name.lastIndexOf('.') -10) );
                file.name=file.name.substr(0,trimTo)+"..."+extension;
              }


              newParentDiv.append("templates/projects/files_row.ejs",{"name":file.name,"depth":depth+1,"type":cType,"fileID":file.id,"downloadable":file.downloadable,"downloadLink":downloadLink,"lastLink":lastLink,expandableLink:false});

            });
          }

        }



      },
      ".accordion-toggle click":function(element){
        if(element.parents(".files-group").hasClass('collapsed')){
          element.parents(".files-group").find(".expand-files").show();
          element.parents(".files-group").removeClass('collapsed');

          element.parent().siblings(".accordion-body").addClass('in');
        }
        else{
          element.parents(".files-group").find(".expand-files").hide();
          element.parents(".files-group").addClass('collapsed');
          element.parent().siblings(".accordion-body").removeClass('in');
        }
      },
      fileRowChangeClass:function(element){
        if(element.hasClass('file-row-collapsed')){
          element.removeClass('file-row-collapsed');
          element.addClass('file-row-expanded');
        }else{
          element.addClass('file-row-collapsed');
          element.removeClass('file-row-expanded');
        }
      },

      ".file-row-wrapper>a click":function(element){
        this.fileRowWrapperClick(element);
      },


      fileRowWrapperClick:function(element){

        var self=this;

        if(element.parents('.file-row-wrapper').hasClass('file-row-collapsed') &&  !element.parents('.files-group').find('.expand-files').hasClass('expanded')){

          element.parents('.files-group').find('.expand-files').addClass('expanded');
          element.parents('.files-group').find('.expand-files').html('<span data-localize="general.collapse-all">Collapse all</span>');


        }




        var fileRowWrapper=element.parents(".file-row-wrapper");

        if(fileRowWrapper.hasClass('file-row-zip')){
          if(element.hasClass("zip-expanded")){
            fileRowWrapper.siblings("ul").slideToggle();
            self.fileRowChangeClass(fileRowWrapper);
            self.filterFileList(element.parents(".files-group").find(".filter-files"));
          }else{


            var currentObj=this;
            ProjectFile.zipContent(fileRowWrapper.attr('fileid'),function(zipContent){
              element.addClass("zip-expanded");
              filesController.appendFileRow("",element.parents(".file-row-wrapper").siblings("ul"),zipContent,0);
              fileRowWrapper.siblings("ul").slideDown();

              self.fileRowChangeClass(fileRowWrapper);
              self.filterFileList(element.parents(".files-group").find(".filter-files"));
            });

          }
        }else{
          self.fileRowChangeClass(fileRowWrapper);
          fileRowWrapper.siblings("ul").slideToggle();
          self.filterFileList(element.parents(".files-group").find(".filter-files"));

        }

        if(element.parents('ul.level0').children('li').children('div.file-row-expanded').length==0){

          element.parents('.files-group').find('.expand-files').removeClass('expanded');
          element.parents('.files-group').find('.expand-files').html('<span data-localize="general.expand-all">Expand all</span>');
        }




      },


      loadFiles:function(projectID,projectDiv,page,nthChild){

        this.options.activeTab="files";
        var currentObj=this;

        projectDiv.find(".tab-content .tab-pane").removeClass('active');
        projectDiv.find(".tab-content .tab-pane:nth-child("+nthChild+")").addClass('active');




        ProjectFile.findInProject(projectID,{},function(files){
          var showInput=true;

          $.each(files.tasksFiles,function(index,filesInTask){

            if(filesInTask.output){

              showInput=false;
            }

          });

          var downloadOutputLink="";
          if(files.outputFilesAsZipDownloadable){
            downloadOutputLink=baseURL+"projects/"+projectID+"/files/outputFilesAsZip";
          }


          if(showInput){
            projectDiv.find(".tab-content .tab-pane:nth-child("+nthChild+")").html("templates/projects/files_list.ejs",{showOutput:false,resources:false,"downloadOutputLink":downloadOutputLink});
            localizeAttribute(".filter-files","placeholder","");

            currentObj.loadFilesTab(projectDiv,files,true,nthChild);

          }else{
            projectDiv.find(".tab-content .tab-pane:nth-child("+nthChild+")").html("templates/projects/files_list.ejs",{showOutput:true,resources:false,"downloadOutputLink":downloadOutputLink});
            localizeAttribute(".filter-files","placeholder","");
            currentObj.loadFilesTab(projectDiv,files,false,nthChild);
          }


        });


      },
		loadFilesTab: function (projectDiv, files, input, nthChild) {
			var projectID = $.trim(projectDiv.attr("projectID2"));
			projectDiv.find(".tab-content .tab-pane:nth-child(" + nthChild + ") ul.file-list").html("");
			if (files) {
				$.each(files.tasksFiles, function (index, filesInTask) {
					//input
					if (filesInTask.id === null) {
						Task.findAll(projectID, {}, function (tasks) {
							if (tasks.length > 0 && tasks[0].id) {
								filesInTask.id = tasks[0].id;
							}
							appendFiles(filesInTask);
						}, function () {
							appendFiles(filesInTask);
						});
					} else {
						appendFiles(filesInTask);
                    }

				});
			}
			projectDiv.find('a.files-tab-link').removeClass('loading');


			function appendInputWorkfiles(filesInTask) {
				var downloadLink = filesInTask.id ? baseURL + "projects/tasks/" + filesInTask.id + "/files/inputFilesAsZip" : null;
				if(filesInTask.inputWorkfiles.files.length === 0 ){
					downloadLink = null;
				}
				projectDiv.find(".tab-content .tab-pane:nth-child(" + nthChild + ") .source-files-container ul.level0").append("templates/projects/files_row.ejs", {
					name: filesInTask.idNumber,
					depth: 0,
					type: "task",
					downloadable: true,
					fileID: "",
					lastLink: false,
					expandableLink: true,
					languageCombination: filesInTask.languageCombination,
					downloadLink: downloadLink
				});
				var newParentDiv = projectDiv.find(".tab-content .tab-pane:nth-child(" + nthChild + ") .source-files-container ul.level0").children("li:last-child").children("ul");

				if ((filesInTask.inputWorkfiles.files.length == 0 && filesInTask.inputWorkfiles.directories.length == 0) || filesInTask.inputWorkfiles == null) {
					filesController.appendFileRow(projectDiv, newParentDiv, null, 0);
				} else {
					filesController.appendFileRow(projectDiv, newParentDiv, filesInTask.inputWorkfiles, 0);
				}
			}

			function appendOutputFiles(filesInTask) {
				var downloadLink = filesInTask.id ? baseURL + "projects/tasks/" + filesInTask.id + "/files/outputFilesAsZip" : null;
				if(filesInTask.output.files.length === 0 ){
				  downloadLink = null;
                }
				projectDiv.find(".tab-content .tab-pane:nth-child(" + nthChild + ") .result-files-container ul.level0").append("templates/projects/files_row.ejs", {
					name: filesInTask.idNumber,
					depth: 0,
					type: "task",
					downloadable: true,
					fileID: "",
					downloadLink: downloadLink,
					lastLink: false,
					expandableLink: true,
					languageCombination: filesInTask.languageCombination
				});
				var newParentDiv = projectDiv.find(".tab-content .tab-pane:nth-child(" + nthChild + ") .result-files-container ul.level0").children("li:last-child").children("ul");
				filesController.appendFileRow(projectDiv, newParentDiv, filesInTask.output, 0);
			}

			function appendFiles(filesInTask) {
				if (filesInTask.inputWorkfiles) {
					appendInputWorkfiles(filesInTask);
				}
				if (filesInTask.output) {
					appendOutputFiles(filesInTask);
				}
			}
		},
      loadFilesTabInQuote:function(quoteID,quoteDiv,nthNumber,success){

        ProjectFile.findInQuote(quoteID,{},function(files){
          quoteDiv.find(".tab-content .tab-pane:nth-child("+nthNumber+")").html("templates/projects/files_list.ejs",{showOutput:false,resources:false});
          localizeAttribute(".filter-files","placeholder","");

          $.each(files.tasksFiles,function(index,filesInTask){
            //input
            if(filesInTask){

              quoteDiv.find(".tab-content .tab-pane").removeClass('active');
              quoteDiv.find(".tab-content .tab-pane:nth-child("+nthNumber+")").addClass('active');
              quoteDiv.find(".tab-content .tab-pane:nth-child("+nthNumber+") .source-files-container ul.level0").append("templates/projects/files_row.ejs",{name:filesInTask.idNumber,depth:0,type:"task",downloadable:false,fileID:"",lastLink:false,expandableLink:true,"languageCombination":filesInTask.languageCombination});
              var newParentDiv = quoteDiv.find(".tab-content .tab-pane:nth-child("+nthNumber+") .source-files-container ul.level0").children("li:last-child").children("ul");
              filesController.appendFileRow(quoteDiv,newParentDiv,filesInTask.inputWorkfiles,0);
												 //	quoteDiv.find('ul.nav-tabs li a[tab="tasks"]').parent().removeClass('active');
            }

            quoteDiv.find('ul.nav-tabs li a').removeClass('loading');

          });
          if(success)
            success();



        });

      },


      loadResourcesTabInQuote:function(quoteID,quoteDiv,nthNumber,success){

        ProjectFile.findInQuote(quoteID,{},function(files){

          quoteDiv.find(".tab-content .tab-pane:nth-child("+nthNumber+")").html("templates/projects/resources_list.ejs",{});

          $.each(files.tasksFiles,function(index,filesInTask){
            //input
            if(filesInTask){

              quoteDiv.find(".tab-content .tab-pane").removeClass('active');
              quoteDiv.find(".tab-content .tab-pane:nth-child("+nthNumber+")").addClass('active');

              quoteDiv.find(".tab-content .tab-pane:nth-child("+nthNumber+") .resources-container ul.level0").append("templates/projects/files_row.ejs",{name:filesInTask.idNumber,depth:0,type:"task",downloadable:false,fileID:"",lastLink:false,expandableLink:true,"languageCombination":filesInTask.languageCombination});
              newParentDiv=quoteDiv.find(".tab-content .tab-pane:nth-child("+nthNumber+") .resources-container ul.level0").children("li:last-child").children("ul");
              filesController.appendFileRow(quoteDiv,newParentDiv,filesInTask.inputResources,0);

            }else{

            }
            quoteDiv.find('ul.nav-tabs li a').removeClass('loading');
          });
          if(success)
            success();



        });

      },

      loadResources:function(projectID,projectDiv,nthChild){
        this.options.activeTab="resources";
        var currentObj=this;

        projectDiv.find(".tab-content .tab-pane").removeClass('active');
        projectDiv.find(".tab-content .tab-pane:nth-child("+nthChild+")").addClass('active');
        projectDiv.find(".tab-content .tab-pane:nth-child("+nthChild+")").html("templates/projects/resources_list.ejs",{});


        ProjectFile.findInProject(projectID,{},function(files){


          $.each(files.tasksFiles,function(index,filesInTask){

            projectDiv.find(".tab-content .tab-pane:nth-child("+nthChild+") .resources-container ul.level0").append("templates/projects/files_row.ejs",{name:filesInTask.idNumber,depth:0,type:"dir",downloadable:"false",fileID:"",lastLink:false,expandableLink:true});
            newParentDiv=projectDiv.find(".tab-content .tab-pane:nth-child("+nthChild+") .resources-container ul.level0").children("li:last-child").children("ul");
            if(filesInTask.inputResources==null || (filesInTask.inputResources.files.length==0 && filesInTask.inputResources.directories.length==0) || filesInTask.inputResources==null)

              filesController.appendFileRow(projectDiv,newParentDiv,null,0);
            else
              filesController.appendFileRow(projectDiv,newParentDiv,filesInTask.inputResources,0);


          });
          projectDiv.find('a.resources-tab-link').removeClass('loading');

        });
      },
      "button.expand-files click":function(element){
        self=this;

        var fileList;
        if(element.attr("expand-target")=="result"){
          fileList = element.parents(".file-list").find(".result-files-container .file-browser ul");
        }
        else if(element.attr("expand-target")=="source"){
          fileList = element.parents(".file-list").find(".source-files-container ul");
        }else if(element.attr("expand-target")=="resources"){
          fileList = element.parents(".file-list").find(".resources-container ul");
        }

        element.toggleClass('expanded');

        if(element.hasClass('expanded')){

          element.html('<span data-localize="general.collapse-all">Collapse all</span>');
          $.each(fileList.find(".file-row-wrapper a"),function(){

            var fileRowWrapper=$(this).parents(".file-row-wrapper");
            if(fileRowWrapper.hasClass('file-row-collapsed')){
              if(!$(this).hasClass("file-download")){
                if(!$(this).parents(".file-row-wrapper").hasClass("file-row-task")){
                  self.fileRowWrapperClick($(this));
                }else{
                  var cWrap=$(this);
                  setTimeout(function(){
                    self.fileRowWrapperClick(cWrap);
                  },500);
                }

              }
            }

          });
        }else{


          element.parents(".files-group").find(".filter-files").val("");
          element.html('<span data-localize="general.expand-all">Expand all</span>');
          $.each(fileList.find(".file-row-wrapper a"),function(){

            var fileRowWrapper=$(this).parents(".file-row-wrapper");
            if(fileRowWrapper.hasClass('file-row-expanded')){
              if(!$(this).hasClass("file-download")){
                if($(this).parents(".file-row-wrapper").hasClass("file-row-task")){


                  self.fileRowWrapperClick($(this));
                }else{
                  var cWrap=$(this);
                  setTimeout(function(){
                    if(!$(this).hasClass("file-download"))
                      if(fileRowWrapper.hasClass('file-row-expanded')){
                        self.fileRowWrapperClick(cWrap);
                      }

                  },500);
                }
              }
            }

          });

        }
      },
      ".filter-files keyup":function(element){

        element.change();
      },
      ".filter-files change":function(element){

        this.filterFileList(element);

      },
      filterFileList:function(element){

        var filter=element.val();
        if(filter){

          if(element.parents(".files-group").hasClass('collapsed')){
            element.parents(".files-group").find('.accordion-toggle').click();
          }

          if(!element.parents(".files-group").find(".expand-files").hasClass('expanded')){
            element.parents(".files-group").find(".expand-files").click();
          }

          $.each(element.parents(".files-group").find(".file-browser").find(".file-direct-wrapper:Contains(" + filter + ")"),function(){
            if(!$(this).parent().parent().hasClass('file-row-zip') && !$(this).parent().parent().hasClass('file-row-task') && !$(this).parent().parent().hasClass('file-row-dir'))
              $(this).parent().parent().show();
          });

          $.each(element.parents(".files-group").find(".file-browser").find(".file-direct-wrapper:not(:Contains(" + filter + "))"),function(){
            if(!$(this).parent().parent().hasClass('file-row-zip') && !$(this).parent().parent().hasClass('file-row-task') && !$(this).parent().parent().hasClass('file-row-dir'))
              $(this).parent().parent().hide();
          });
          $.each(element.parents(".files-group").find(".file-direct-wrapper"),function(){
            var StrippedString = $(this).html().replace(/(<([^>]+)>)/ig,"");
            $(this).html(StrippedString);

          });

          element.parents(".files-group").find('.file-direct-wrapper').highlight(filter);
          //element.parents(".files-group").find('.file-direct-wrapper').removeHighlight().highlight(filter);
          //setTimeout(function(){element.parents(".files-group").find('.file-direct-wrapper').highlight(filter);},300);


        }else{
          element.parents(".files-group").find(".file-browser").find(".file-direct-wrapper").parent().parent().show();
          element.parents(".files-group").find('.file-direct-wrapper').removeHighlight();
        }
      }


    });

  });