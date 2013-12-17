
//PLUGIN FOR JQUERY
(function ( $ ) {
	
var _easyAjax=[];


var easyAjaxStack={
	isRunning : _easyAjax.length,
	lastAjax : null,
	push : function(easyAjaxObj){
		_easyAjax.push(easyAjaxObj);
		return true;
	},
	pop : function(){
		if(_easyAjax.length>0){
			var returnedEasyAjaxObj=_easyAjax[0];
			_easyAjax.splice(0,1);
			return returnedEasyAjaxObj;
		}else return false;
	},
	remove : function(index){
		obj=index;
		if(index<_easyAjax.length){
			_easyAjax.splice(index,1);
			return true;
		}else return false;
	},
	get : function(index){
		if(index<_easyAjax.length)
			return _easyAjax[index];
		else return false;
	},
	next : function(){
		console.log("Runing easyAjaxStack:");
		console.log(_easyAjax);
		easyAjaxStack.isRunning=_easyAjax.length;
		if(easyAjaxStack.isRunning){
			var incomingCall=easyAjaxStack.get(0);
			if(incomingCall===false)
				easyAjaxStack.isRunning=false;
			else{
				incomingCall.execute();
			}
		}
	}
};
//window.test=easyAjaxStack;
/***********************************/
/* 		  Create $.ajaxCall()	   */
/***********************************/
$.easyAjax = function( params ) {
	/***********************************/
	/*   Initialize default settings   */
	/***********************************/
	params = typeof params === 'undefined' ? {} : params;
	var self=this;
	self.settings={
		//Stack incoming calls
		stack		: typeof params.stack		===	'boolean'	?	params.stack			:	false,	//Stack and wait to execute
		//RIA settings
		file		: typeof params.file		===	'string'	?	params.file				:	false,	//RIA file
		checkUser	: typeof params.checkUser	===	'boolean'	?	params.checkUser		:	true,	//only allowed users RIA[li,lo]
		isRia		: typeof params.isRia		===	'boolean'	?	params.isRia			:	true,	//RIA+token call
		//Hader settings
		method		: typeof params.method		===	'string'	?	params.method			:	"POST",	//send method
		dataType	: typeof params.dataType	===	'string' 	?	params.dataType			:	"text",	//payload type
		data		: typeof params.data		===	'object' 	?	params.data				:	{},		//params
		//Callback
		error		: typeof params.error		===	'function' 	?	params.error			:	false,	//error callback
		success		: typeof params.success		===	'function' 	?	params.success			:	false,	//success callback
		complete	: typeof params.complete	===	'function' 	?	params.complete			:	false,	//complete callback
		//AJAX settings
		interval	: typeof params.interval	===	'number' 	?	params.interval			:	0,		//interval recall time
		timeout		: typeof params.timeout		===	'number' 	?	params.timeout			:	20000,	//max timeout
		retry		: typeof params.retry		===	'number' 	?	params.retry			:	0,		//max tries
		async		: typeof params.async		===	'boolean' 	?	params.async			:	true,	//is async
		debug		: typeof params.debug		===	'boolean'	?	params.debug			:	false,	//log call
		action		: typeof params.action		===	'string'	?	"&action="+params.action:	"",		//show content
		//easyUpload param
		isFile		: typeof params.isFile		===	'boolean'	?	params.isFile			:	false	//sending files
	};
		
	self.settings.useToken=settings.isRia;	//use RIA token
	
	if(self.settings.debug){
		console.log("Initialized easyAjax");
		console.log(self.settings);
	}

	var easyAjaxObj=function(){
		var obj=this;
		/***********************************/
		/*   Initialize default functions  */
		/***********************************/
		var _defaultError=function(payload, textStatus, errorThrown){
			if(_tempSettings.retry>0){
				_tempSettings.retry--;
				obj.recall();
			}else{
				if(_tempSettings.debug)
					console.log("Error AJAX");
				if( typeof _tempSettings.error === 'function' )
					_tempSettings.error(payload, textStatus, errorThrown);
				else{
					if(payload.status==0){
						alert('You are offline!! Please Check Your Network.');
					}else if(payload.status==404){
						alert('Requested URL not found.');
					}else if(payload.status==500){
						alert('Internel Server Error.');
					} 
					if(textStatus=='parsererror'){
						alert('Error. Parsing Request failed.');
					}else if(textStatus=='timeout'){
						alert('The conection is taking so much time. Sorry.');
					}else{
						alert('Unknow Error. '+payload.responseText);
					}
				}
			}
		};
		var _defaultSuccess=function(payload){
			if(_tempSettings.debug)
				console.log("Success AJAX");
			if(typeof _tempSettings.success === 'function')
				_tempSettings.success(payload);
			else
				if(payload.match(/\<title\>404\sNot\sFound\<\/title\>/))
					alert("The page was not found");
		};
		var _defaultComplete=function(payload){
			if(_tempSettings.retry===0){
				if(_tempSettings.debug)
					console.log("Complete AJAX");
				_isRunning=false;
				if(typeof _tempSettings.complete === 'function')
					_tempSettings.complete(payload);
			}
			if(_tempSettings.interval>0)
				setTimeout(obj.run,_tempSettings.interval);
		};
		/***********************************/
		/*     Extend default settings     */
		/***********************************/
		var _tempSettings=self.settings,
			_callSettings={};
		if(_tempSettings.debug)
			console.log("Params are ready to rock");
		/***********************************/
		/*     Initialize running vars     */
		/***********************************/
		var _isRunning	=	false;
		var _xhr		=	false;
		
		obj.stop=function(){
			if (_isRunning)
				_xhr.abort();
			return obj;
		};
		
		var _setCallSettings=function(newTempSettings){
			_tempSettings=$.extend(_tempSettings, newTempSettings); //Last call priority
				
			if(_tempSettings.debug)
				console.log("Temp settings are ready to rock");
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
			_callSettings={
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
				_callSettings.cache		= false;
			   	_callSettings.contentType= false;
			   	_callSettings.processData= false;
			}
			return _callSettings;
		};
		
		var _callStack=function(){
			if(_tempSettings.debug)
				console.log("Calling Stacked Ajax");
			var currComplete=_callSettings.complete;
			_callSettings.complete=function(){
				currComplete();
				easyAjaxStack.remove(0);
				setTimeout(function(){
					easyAjaxStack.next();
				},500);
			};
			easyAjaxStack.push(obj);
			return obj;
		};
		
		obj.execute=function(){
			_xhr=$.ajax(_callSettings);
			return obj;
		};
		
		obj.run=function(newTempSettings){
			if(_tempSettings.debug)
				console.log("Trying to run");
			_setCallSettings(newTempSettings);
			if(_tempSettings.stack===false)
				return obj.execute();
			else{
				//easyAjaxStack.push(obj);
				_callStack();
				if(!easyAjaxStack.isRunning)
					easyAjaxStack.next(); //Force Stack if not running
				return obj;
			}
		};
		
		obj.recall=function(){
			return obj.run(_tempSettings);
		};
		
		obj.call=function(){}; //Previous version function
		
	};
	return new easyAjaxObj().run();
};
	
}( jQuery ));
