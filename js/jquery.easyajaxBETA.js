
//PLUGIN FOR JQUERY
(function ( $ ) {
/***********************************/
/* 		  Create $.ajaxCall()	   */
/***********************************/
$.easyAjax = function( params ) {
	/***********************************/
	/*   Initialize default settings   */
	/***********************************/
	params = typeof params === 'undefined' ? {} : params;
	settings={
		file		: typeof params.file		===	'string'	?	params.file				:	false,	//RIA file
		method		: typeof params.method		===	'string'	?	params.method			:	"POST",	//send method
		dataType	: typeof params.dataType	===	'string' 	?	params.dataType			:	"text",	//payload type
		timeout		: typeof params.timeout		===	'number' 	?	params.timeout			:	20000,	//max timeout
		data		: typeof params.data		===	'object' 	?	params.data				:	{},		//params
		error		: typeof params.error		===	'function' 	?	params.error			:	false,	//error callback
		success		: typeof params.success		===	'function' 	?	params.success			:	false,	//success callback
		complete	: typeof params.complete	===	'function' 	?	params.complete			:	false,	//complete callback
		async		: typeof params.async		===	'boolean' 	?	params.async			:	true,	//is async
		debug		: typeof params.debug		===	'boolean'	?	params.debug			:	false,	//log call
		checkUser	: typeof params.checkUser	===	'boolean'	?	params.checkUser		:	true,	//only allowed users
		isRia		: typeof params.isRia		===	'boolean'	?	params.isRia			:	true,	//RIA+token call
		action		: typeof params.action		===	'string'	?	"&action="+params.action:	"",		//show content
		isFile		: typeof params.isFile		===	'boolean'	?	params.isFile			:	false	//sending files
	};
		
	settings.useToken=settings.isRia;	//use RIA token
	
	if(settings.debug){
		console.log("Initialized easyAjax");
		console.log(settings);
	}

	var easyAjaxObj=function(settings){
		var self=this;
		/***********************************/
		/*   Initialize default functions  */
		/***********************************/
		self.defaultError=function(xhr, textStatus, errorThrown){
			if( typeof self.tempSettings.error === 'function' )
				self.tempSettings.error(xhr);
			else{
				if(self.tempSettings.enableLog) console.log("Error AJAX");
				if (textStatus == 'timeout') {
		           	alert('The conection is taking so much time. Sorry.');
		       	}
				if(xhr.status==0){
					alert('You are offline!!\n Please Check Your Network.');
					//self.call(self.tempSettings);
				}else if(xhr.status==404){
					alert('Requested URL not found.');
				}else if(xhr.status==500){
					alert('Internel Server Error.');
				} 
				if(textStatus=='parsererror'){
					alert('Error.\nParsing Request failed.');
				}else if(textStatus=='timeout'){
					alert('Request Time out.');
				}else {
					alert('Unknow Error.\n'+xhr.responseText);
				}
			}
		};
		self.defaultSuccess=function(data){
			if( typeof self.tempSettings.success === 'function' )
				self.tempSettings.success(data);
			else
				if(data.match(/\<title\>404\sNot\sFound\<\/title\>/)) alert("The page was not found");
				if(self.tempSettings.enableLog) console.log("Success AJAX");
		};
		self.defaultComplete=function(data){
			if( typeof self.tempSettings.complete === 'function' )
				self.tempSettings.complete(data);
			else
	       		if(self.tempSettings.enableLog) console.log("Complete AJAX");
	       	self.isRunning=false;
		};
		/***********************************/
		/*     Extend default settings     */
		/***********************************/
		self.settings=$.extend(self.settings, settings);
		if(self.settings.enableLog) console.log("Individual settings are now setted");
		/***********************************/
		/*     Initialize running vars     */
		/***********************************/
		self.tempSettings={};
		self.isRunning	=	false;
		self.xhr		=	false;
		
		self.stop=function(){
			if (self.isRunning ) self.xhr.abort();
			return self;
		};
		
		self.call=function(tempSettings){
			/***********************************/
			/* 	     Initialize temp vars      */
			/***********************************/
			$.extend(self.tempSettings, self.settings, self.tempSettings, tempSettings);
			
			if(self.tempSettings.enableLog) console.log("Temp settings are now setted");
			if(self.tempSettings.enableLog) console.log("Building AJAX");
			//self.tempSettings.successCallback=self.defaultSuccess(self.tempSettings.success);
			//self.tempSettings.error=self.defaultError;
			//self.tempSettings.complete=self.defaultComplete;
			self.isRunning=true;

			var token="nA";
			if(self.tempSettings.useToken==true){
				token=$('#OLIF_TOKEN').val();
			}
			if(self.tempSettings.isAdmin)
				if(self.tempSettings.isRia)
					var finalURL=ria_url+"li/"+self.tempSettings.file+"/"+token;
				else
					if(self.tempSettings.showContent)
						var finalURL=base_url+self.tempSettings.file+"&action=noContent";
					else
						var finalURL=base_url+self.tempSettings.file;
			else 
				if(self.tempSettings.isRia)
					var finalURL=ria_url+"lo/"+self.tempSettings.file+"/"+token;
				else
					if(self.tempSettings.showContent)
						var finalURL=base_url+self.tempSettings.file+"&action=noContent";
					else
						var finalURL=base_url+self.tempSettings.file;
				
			//PREVENT CACHE
			self.tempSettings.data.date=$.now();
			//-------------
				//alert(self.contentType+" - "+self.processData);
			var callSettings={
	           url			: finalURL,
	           type			: self.tempSettings.method,
	           dataType		: self.tempSettings.dataType,
	           data			: self.tempSettings.data,
	           timeout		: self.tempSettings.timeout,
	           //Always use default functions
	           error		: self.defaultError,  
	           success		: self.defaultSuccess,
	           complete		: self.defaultComplete
	       };
	       if(self.tempSettings.isFile){
				callSettings.cache		= false;
			   	callSettings.contentType= false;
			   	callSettings.processData= false;
	       }
			self.xhr=$.ajax(callSettings);
		        
			return self;
		};
		//Repear last AJAX call
		self.recall=function(){
			var token="nA";
			if(self.tempSettings.useToken==true){
				token=$('#OLIF_TOKEN').val();
			}
			if(self.tempSettings.isAdmin)
				if(self.tempSettings.isRia)
					var finalURL=ria_url+"li/"+self.tempSettings.file+"/"+token;
				else
					if(self.tempSettings.showContent)
						var finalURL=base_url+self.tempSettings.file+"&action=noContent";
					else
						var finalURL=base_url+self.tempSettings.file;
			else 
				if(self.tempSettings.isRia)
					var finalURL=ria_url+"lo/"+self.tempSettings.file+"/"+token;
				else
					if(self.tempSettings.showContent)
						var finalURL=base_url+self.tempSettings.file+"&action=noContent";
					else
						var finalURL=base_url+self.tempSettings.file;
			self.isRunning=true;
			self.xhr=$.ajax({
	           url			: finalURL,
	           type			: self.tempSettings.method,
	           dataType		: self.tempSettings.dataType,
	           data			: self.tempSettings.data,
	           timeout		: self.tempSettings.timeout,
	           retryLimit	: self.tempSettings.retryLimit,
	           //Always use default functions
	           error		: self.defaultError,  
	           success		: self.defaultSuccess,
	           complete		: self.defaultComplete,
	           cache		: self.cache,
			   contentType	: self.contentType,
			   processData	: self.processData
	        });
		        
			return self;
		};
		
	};
	return new easyAjaxObj(settings);
}; //End $.easyAjax()
	
}( jQuery ));
