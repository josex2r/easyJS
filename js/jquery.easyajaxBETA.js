
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
		interval	: typeof params.interval	===	'number' 	?	params.interval			:	0,		//interval recall time
		timeout		: typeof params.timeout		===	'number' 	?	params.timeout			:	20000,	//max timeout
		retry		: typeof params.retry		===	'number' 	?	params.retry			:	0,		//max tries
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
		var _defaultError=function(payload, textStatus, errorThrown){
			if(_tempSettings.retry>0){
				_tempSettings.retry--;
				self.recall();
			}else{
				if(_tempSettings.debug)
					console.log("Error AJAX");
				if( typeof _tempSettings.error === 'function' )
					_tempSettings.error(payload, textStatus, errorThrown);
				else{
					if(xhr.status==0){
						alert('You are offline!! Please Check Your Network.');
					}else if(xhr.status==404){
						alert('Requested URL not found.');
					}else if(xhr.status==500){
						alert('Internel Server Error.');
					} 
					if(textStatus=='parsererror'){
						alert('Error. Parsing Request failed.');
					}else if(textStatus=='timeout'){
						alert('The conection is taking so much time. Sorry.');
					}else{
						alert('Unknow Error. '+xhr.responseText);
					}
				}
			}
		};
		var _defaultSuccess=function(payload){
			if(_tempSettings.debug)
				console.log("Success AJAX");
			if( typeof _tempSettings.success === 'function' )
				_tempSettings.success(payload);
			else
				if(data.match(/\<title\>404\sNot\sFound\<\/title\>/))
					alert("The page was not found");
		};
		var _defaultComplete=function(payload){
			if(_tempSettings.retry===0){
				if(_tempSettings.debug)
					console.log("Complete AJAX");
				_isRunning=false;
				if( typeof _tempSettings.complete === 'function' )
					_tempSettings.complete(payload);
				if(_tempSettings.interval>0)
					setTimeout(self.call,_tempSettings.interval);
			}
		};
		/***********************************/
		/*     Extend default settings     */
		/***********************************/
		self.settings=$.extend(self.settings, settings);
		if(self.settings.debug)
			console.log("Params are ready to rock");
		/***********************************/
		/*     Initialize running vars     */
		/***********************************/
		_tempSettings={};
		_isRunning	=	false;
		_xhr		=	false;
		
		self.stop=function(){
			if (_isRunning)
				_xhr.abort();
			return self;
		};
		
		self.call=function(tempSettings){
			/***********************************/
			/* 	     Initialize temp vars      */
			/***********************************/
			$.extend(_tempSettings, self.settings, _tempSettings, tempSettings);
			
			if(_tempSettings.debug)
				console.log("Temp settings are ready to rock");
			if(_tempSettings.debug)
				console.log("Building AJAX");
			_isRunning=true;

			var token=_tempSettings.useToken?$('#OLIF_TOKEN').val():"nA";
			if(_tempSettings.isAdmin)
				if(_tempSettings.isRia)
					var finalURL=ria_url+"li/"+_tempSettings.file+"/"+token;
				else
					var finalURL=base_url+_tempSettings.file+_tempSettings.action;
			else 
				if(_tempSettings.isRia)
					var finalURL=ria_url+"lo/"+_tempSettings.file+"/"+token;
				else
					var finalURL=base_url+_tempSettings.file+_tempSettings.action;
			//PREVENT CACHE
				_tempSettings.data.cacheControl=$.now();
			var callSettings={
				url			: finalURL,
	           	type		: _tempSettings.method,
	           	dataType	: _tempSettings.dataType,
	           	data		: _tempSettings.data,
	           	timeout		: _tempSettings.timeout,
	           	//Always use default functions
	           	error		: _defaultError,
	           	success		: _defaultSuccess,
           		complete	: _defaultComplete
			};
			if(_tempSettings.isFile){
				callSettings.cache		= false;
			   	callSettings.contentType= false;
			   	callSettings.processData= false;
			}
			_xhr=$.ajax(callSettings);
			return self;
		};
		
		self.recall=function(){
			return self.call(_tempSettings);
		};
		
	};
	return new easyAjaxObj(settings);
};
	
}( jQuery ));
