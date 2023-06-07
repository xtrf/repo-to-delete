
load("steal/rhino/rhino.js");


steal('steal/build').then('steal/build/scripts','steal/build/styles',function(){
	
	

	

	utilsFile=readFile("utils/utils.js");
	//console.log(myAcc2);
	utilsFile=utilsFile.replace(/\)\.then\(function\(\$\)[\s|\n]*{[\s|\n]*steal\(/g,",");
	utilsFile=utilsFile.replace(/\/\*END\*\/[.|\s|\n]*}\);/g,"");


	utilsFile=utilsFile.replace("raq.js","raq_p.js");
 raqFile=readFile("utils/raq.js");
	raqFile=raqFile.replace(/\)\.then\(function\(\$\)[\s|\n]*{[\s|\n]*steal\(/g,",");
	raqFile=raqFile.replace(/\/\*END\*\/[.|\s|\n]*}\);/g,"");

	loginFile=readFile("utils/login.js");
	loginFile=loginFile.replace(/\)\.then\(function\(\$\)[\s|\n]*{[\s|\n]*steal\(/g,",");
	loginFile=loginFile.replace(/\/\*END\*\/[.|\s|\n]*}\);/g,"");
	
	steal.File("utils/utils_p.js").save(utilsFile);
	steal.File("utils/raq_p.js").save(raqFile);
	steal.File("utils/login_p.js").save(loginFile);
	
	
	steal.File('production').mkdir()
	steal.File('production/site').mkdir()

	steal.build('required/build.html',{to: 'production/site',pack:''});
	
});


