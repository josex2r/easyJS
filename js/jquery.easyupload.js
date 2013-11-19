(function($) {
$.fn.easyUpload = function(params) {
	var self = this;
	//Selector
	params = typeof params === 'object' ? params : {};
	params.selectorId = self.prop("id");
	return $.easyUpload(params);
};
//Include dataTransfer to jQuery events for file handling
jQuery.event.props.push('dataTransfer');
/***********************************/
/* 		  Create $.easyUpload()	   */
/***********************************/
$.easyUpload = function(params) {
	/***********************************/
	/*   Initialize default settings   */
	/***********************************/
	params = typeof params === 'undefined' ? {} : params;
	settings = {
	/* 	PARAM NAME							IF IS A VALID TYPE				PARAM VALUE			DEFAULT VALUES				*/
		debug			: typeof params.debug			=== 'boolean' 	? params.debug 			: false,
		prettyUpload	: typeof params.prettyUpload	=== 'boolean' 	? params.prettyUpload 	: false, 			//Only allow images!!!!
		//Visual params
		selectorId		: typeof params.selectorId		=== 'string' 	? params.selectorId 	: "NO-NODE",
		dragAndDrop 	: typeof params.dragAndDrop		=== 'boolean' 	? params.dragAndDrop 	: true,				//Enable drag&Drop on the selector
		appendFiles		: typeof params.appendFiles		=== 'boolean' 	? params.appendFiles 	: false,			//Delete or not if exist previous files
		drawFiles 		: typeof params.drawFiles 		=== 'boolean' 	? params.drawFiles 		: true,				//Automatically draw files when added
		containerId		: typeof params.filesContainer	=== 'string' 	? params.filesContainer	: "NO-CONTAINER",
		//Upload params
		autoUpload 		: typeof params.autoUpload		=== 'boolean' 	? params.autoUpload 	: true,				//Auto-upload if append new files
		multiple	 	: typeof params.multiple		=== 'boolean' 	? params.multiple	 	: true,				//Enable multiple upload
		folder 			: typeof params.folder 			=== 'string' 	? params.folder 		: "files/imgs/",	//Folder where files are going to be uploaded
		uploadSingle	: typeof params.uploadSingle	=== 'boolean' 	? params.uploadSingle 	: false,			//Upload one file on each ajax call
		file			: typeof params.file			=== 'string' 	? params.file		 	: "easyUploadBeta",	//RIA file
		//File params
		maxWidth 		: typeof params.maxWidth		=== 'number' 	? params.maxWidth 		: 200,				//If files are images, set width
		maxHeight 		: typeof params.maxHeight 		=== 'boolean' 	? params.maxHeight 		: "",				//If files are images, set height
		maxSize 		: typeof params.maxSize 		=== 'number' 	? params.maxSize 		: 2000,				//Max allowed size in kb
		allowedTypes 	: typeof params.allowedTypes 	=== 'object' 	? params.allowedTypes 	: ["image/png", "image/gif", "image/jpg", "image/jpeg", "application/pdf"],
		//allowedExt 		: typeof params.allowedTypes 	=== 'object' 	? params.allowedTypes 	: ["png", "gif", "jpg", "jpeg", "pdf"],
		//Callback functions
		onUpload		: typeof params.onUpload 		=== 'function' 	? params.onUpload		: false,			//function(file,uploadResult){}
		onRemove	 	: typeof params.onRemove 		=== 'function' 	? params.onRemove 		: false,			//function(file){}
			//onBeforeUpload 	: typeof params.onBeforeUpload 	=== 'function' 	? params.onBeforeUpload : false,
			//onBeforeRemove	: typeof params.onBeforeRemove 	=== 'function' 	? params.onBeforeRemove : false,
		//Góbalo params
		isAdmin 		: typeof params.isAdmin			=== 'boolean' 	? params.isAdmin 		: false,			//Only if use $.easyAjax
		baseUrl 		: typeof base_url				!== "string"	? typeof params.baseUrl	=== 'string' ? params.baseUrl : window.location.href : base_url,			//Only if use $.easyAjax
	};
	if(self.settings.prettyUpload){
		self.settings.drawFiles=true;
		self.settings.allowedTypes=["image/png", "image/gif", "image/jpg", "image/jpeg"];
	}
	//Returns object
	var easyUploadObj = function(settings) {
		var self = this;
		/****************************************/
		/*		 Extend default settings		*/
		/****************************************/
		self.settings = $.extend(self.settings, settings);
		//Paths depends of the location
			self.settings.relPath	= !self.settings.isAdmin ? "../../"+self.settings.folder : "../"+self.settings.folder; //Exit to root directory
			self.settings.absPath	= self.settings.baseUrl+self.settings.folder;
		if(self.settings.debug){
			console.log("Parametters:");
			console.log(self.settings);
		}
		/****************************************/
		/*			 Public attrs				*/
		/****************************************/
		self.files = [];
		/****************************************/
		/*			 Private attrs				*/
		/****************************************/
		var _$selector 	= $("#"+self.settings.selectorId),
			_updateTime	= 1000,
			_isInput	= _$selector[0].nodeName=="INPUT",
			_$filesContainer = undefined,
			_filesReady = 0;
		if(self.settings.debug)	console.log("Is input? "+_isInput);
		/****************************************/
		/*			 Append container			*/
		/****************************************/
		if(self.settings.containerId=="NO-CONTAINER"){
			if(_isInput){
				_$selector.wrap("<div class='easyUploadContainer easyUploadNoStyle'></div>");
				_$filesContainer=$("<div class='easyUploadAppended'></div>").insertAfter(_$selector);
				//_updateTime=300;
			}else{
				_$selector.addClass("easyUploadContainer");
				_$filesContainer=_$selector;
				_$selector.append("<span class='easyUploadFile'>Arrastre los ficheros aquí</span>");
				_$selector.append("<input type='file' style='display:none'>");
				var _$fakeInput=_$selector.find("input[type=file]");
			}
		}else{
			_$filesContainer=$("#"+containerId);
			$("#"+containerId).addClass("easyUploadContainer");
		}
		if(self.settings.debug){
			console.log("Selector:");
			console.log(_$selector);
			console.log("File container:");
			console.log(_$filesContainer);
		}
		/****************************************/
		/*			 Event handlers 			*/
		/****************************************/
		if(!_isInput)
			_$selector.click(function(e){
				e.stopPropagation();
				if(e.target.id===self.settings.selectorId)
					_$fakeInput.click();
			});
		var _handleDragenter = function(evt) {
			if(self.settings.debug)	console.log("Event: dragenter");
			_$selector.addClass("easyUploadEnter");
		};
		var _handleDragleave = function(evt) {
			if(self.settings.debug)	console.log("Event: dragleave");
			_$selector.removeClass("easyUploadEnter");
		};
		var _handleDragover = function(evt) {
			if(self.settings.debug)	console.log("Event: dragover");
			evt.stopPropagation();
			evt.preventDefault();
			evt.dataTransfer.dropEffect = 'copy';
		};
		var _setFiles=function(evt){
			if(self.settings.debug)	console.log("Calling function: _setFiles\nEvent: drop || change");
			if(!self.settings.appendFiles){
				self.files = [];
				_$filesContainer.html("");
			}
			var tempFiles=[];
			if(_isInput && typeof evt!=="undefined")
				tempFiles=_$selector[0].files;
			else{
				evt.stopPropagation();
				evt.preventDefault();
				if(typeof evt.dataTransfer==="undefined")
					tempFiles=_$fakeInput[0].files;
				else{
					tempFiles=evt.dataTransfer.files;
					_handleDragleave();
				}
			}
			var i=tempFiles.length;
			while (i--){
				var file = new File(tempFiles[i]);
				self.files.push(file);
				file.initStatus();
				file.draw();
				if(self.settings.debug) console.log("File added");
			}
		};
		if(self.settings.dragAndDrop){
			//Event launched when mouse drops a file over this item
			_$selector.bind("dragenter", _handleDragenter);
			//Event launched when mouse drops a file over this item
			_$selector.bind("dragleave", _handleDragleave);
			//Event launched when mouse is dragging a file and is over this item
			_$selector.bind("dragover", _handleDragover);
			//Event launched when mouse drops a file over this item
			if(!_isInput)
				_$selector.bind("drop", _setFiles);
		}
		if(_isInput){
			if(self.settings.multiple)
				_$selector.attr("multiple","");
			else
				_$selector.removeAttr("multiple");
			_$selector.bind("change", _setFiles);
		}else{
			if(self.settings.multiple)
				_$fakeInput.attr("multiple","");
			else
				_$fakeInput.removeAttr("multiple");
			_$fakeInput.bind("change", _setFiles);
		}
		/****************************************/
		/*			 File model					*/
		/****************************************/
		var File = function(file){
			var obj		= this;
			//File
			this.file		= file || {};
			this.mime		= this.file.mime 		|| "NO-MIME";
			this.name		= this.file.name 		|| "NO-NAME";
			this.$file		= "NO-FILE";
			this.uploaded	= this.file.uploaded 	|| false;
			this.index		= this.file.index 		|| self.files.length;
			this.url		= this.file.url 		|| "";
			this.relPath	= this.file.relPath 	|| "";
			this.uploadedName=this.file.uploadedName|| "";
			this.size		= this.file.size 		|| 0;
			this.prettyImg	= this.file.prettyImg	|| "NO-SRC";
			//Status
			this.deferred	= $.Deferred();
			this.promise	= this.deferred.promise();
			this.state		= this.promise.state;
			
			this.promise.always(function(){ //Esta función se ejecutará siempre, falle o resuelva
				if(!obj.uploaded){
					obj.draw();
					if(self.settings.multiple)
						_filesReady++;
					else
						_filesReady=1;
					if(self.settings.uploadSingle && self.settings.autoUpload && obj.state()==="resolved")
						obj.upload();
					else
						_checkFilesLoaded();
				}
			});
			this.updateIndex=function(index){
				obj.index=index;
			};
			this.reject=function(){
				setTimeout(function(){obj.deferred.reject();},_updateTime);
			};
			this.resolve=function(){
				setTimeout(function(){obj.deferred.resolve();},_updateTime);
			};
			this.setStatus=function(state){
				obj.state=function(){
					return state;
				};
				obj.draw();
			};
			
			this.initStatus=function(setReader){
				if(_checkFile(obj))
					if(setReader===false)
						obj.setStatus("uploaded");
					else
						_setFileReader(obj);
				else{
					if(self.settings.debug) console.log("Rejecting file: "+obj.index+" -> _checkFile returning false");
					obj.reject();
				}
			};
			//Functions
			this.remove	= function(){
				if(self.settings.debug) console.log("Removing the file: "+obj.index);
				obj.$file.remove();
				_removeFile(obj.index);
			};
			this.draw = function(){
				var status=obj.state()=="pending"?"easyUploadStatePending":obj.state()=="rejected"?"easyUploadStateRejected":obj.state()=="resolved"?"easyUploadStateResolved":obj.state()=="uploading"?"easyUploadStateUploading":obj.state()=="failed"?"easyUploadStateFailed":"easyUploadStateUploaded";
				if(self.settings.debug)
					console.log("Drawing the file: "+obj.index);
				if(self.files.length>0)
					_$filesContainer.find("span.easyUploadFile").remove();
				_$filesContainer.find(".clear").remove();
				if(obj.$file==="NO-FILE"){
					if(!self.settings.prettyUpload)
						var $newFile=$("<div class='easyUploadFile "+_getMimeClass(obj.mime)+"'>"+
											"<div class='easyUploadIcon "+_getMimeClass(obj.mime)+"'></div>"+
											"<div class='easyUploadName easyUploadCutText'>"+obj.name+"</div>"+
											"<div class='easyUploadSize easyUploadCutText'>"+parseInt((obj.size || 1024)/1024)+"kb</div>"+
											"<div class='easyUploadStatus "+status+"'></div>"+
											"<div class='easyUploadCopy'></div>"+
											"<div class='easyUploadRemove'></div>"+
										"</div>");
					else{
						var reader = new FileReader(),
							$newFile=$("<div class='easyUploadFile easyUploadPretty'>"+
											"<div class='easyUploadImg easyUploadPretty "+status+"'><img src='"+obj.prettyImg+"' /></div>"+
											"<div class='easyUploadCopy easyUploadPretty'></div>"+
											"<div class='easyUploadRemove easyUploadPretty'></div>"+
										"</div>");
							reader.onload=function(){
						        var image=new Image();
						        image.onload=function(){
						        	obj.prettyImg=image.src;
						        	$newFile.find(".easyUploadImg img").attr("src",image.src).parent().click(function(e){e.stopPropagation();console.log(e.target)});
						        };
						        image.src=reader.result;
						    };
						    reader.readAsDataURL(obj.file);
					}
					//if(obj.$file=="NO-FILE")
						obj.$file=$newFile;
					//else
						//obj.$file.html($newFile.find("div"));
					_$filesContainer.append(obj.$file);
					obj.$file.find("div.easyUploadCopy").hide();
					obj.$file.find("div.easyUploadRemove").hide();
				}else{
					if(self.settings.prettyUpload)
						obj.$file.find(".easyUploadImg.easyUploadPretty").removeClass("easyUploadStatePending easyUploadStateRejected easyUploadStateResolved easyUploadStateUploading easyUploadStateUploaded").addClass(status);
					else{
						obj.$file.find(".easyUploadStatus").removeClass("easyUploadStatePending easyUploadStateRejected easyUploadStateResolved easyUploadStateUploading easyUploadStateUploaded").addClass(status);
					}
					//Bind mouse events
					if(obj.uploaded && obj.state()==="uploaded"){
						obj.$file.find("div.easyUploadCopy").css("display","block").unbind().click(function(){
							window.prompt("Presione CRTL+C para copiar el texto:",obj.url);
						});
						console.log(obj.uploaded && obj.state()==="uploaded")
						if(!self.settings.prettyUpload)
							obj.$file.find("div.easyUploadName").html("<a target='_blank' href='"+obj.url+"'>"+obj.name+"</a>");
					}else
						obj.$file.find("div.easyUploadCopy").hide();
					if((obj.state()==="resolved" && !self.settings.autoUpload) || (obj.state()==="uploaded" && obj.uploaded))
						obj.$file.find("div.easyUploadRemove").unbind().click(function(){
							obj.remove();
					   	}).show();
				   	else
						obj.$file.find("div.easyUploadRemove").hide();
		   		}
		   		if(!_$filesContainer.find("div").hasClass("clear"))
			   		_$filesContainer.append("<div class='clear'></div>");
			};
			this.upload = function(){
				if (!window.FormData) throw("You need HTML5!");
				var data=new FormData();
				data.append("maxFiles", 1);
				data.append("relPath", self.settings.relPath);
				data.append("absPath", self.settings.absPath);
				data.append("maxWidth", self.settings.maxWidth);
				data.append("maxHeight", self.settings.maxHeight);
				data.append("maxSize", self.settings.maxSize);
				if(obj.state()==="resolved" && !obj.uploaded){
					var data=_getUploadData(obj.index);
					if(typeof $.easyAjax!=="undefined"){
						if(self.settings.debug) console.log("Uploading file"+obj.index+": via jQuery easyAjax");
						$.easyAjax({
							method : "POST",
							//dataType:"multipart/form-data",
							file : self.settings.file,
							data : data,
							success : _handleResponseFiles,
							error:function(){alert("Ther was an error while uploading.");},
							isAdmin : self.settings.isAdmin,
							isFile : true
						}).call();
					}else{
						if(self.settings.debug) console.log("Uploading file:"+obj.index+" via jQuery ajax");
						$.ajax({
							method : "POST",
							//dataType:"multipart/form-data",
							file : self.settings.absPath+self.settings.file,
							data : data,
							success : _handleResponseFiles,
							error:function(){alert("Ther was an error while uploading.");}
						});
					}
				}else{
					obj.reject();
					obj.draw();
				}
			};
			if(self.settings.debug){
				console.log("Instancing new File:");
				console.log(obj);
			}
		};
		
		var _setFileReader = function(file){
			var reader = new FileReader();
			reader.onerror = function(evt) {
				if(self.settings.debug) console.log("Rejected file: "+file.index+" -> Read error");
				file.reject();
			};
			reader.onabort = function(evt) {
				if(self.settings.debug) console.log("Rejected file: "+file.index+" -> Abort reading");
				file.reject();
			};
			reader.onload = function(evt) {
				if(self.settings.debug) console.log("Resolved file: "+file.index+" -> Read completed");
				file.resolve();
			};
			reader.readAsBinaryString(file.file);
		};

		var _drawFiles = function(){
			_updateFileIndex();
			_$filesContainer.html("");
			var i = self.files.length;
			while(i--)
				self.files[i].draw();
			if(self.files.length>0)
				_$selector.find(".easyUploadFile").remove();
			_$filesContainer.append("<div class='clear'></div>");
		};
		
		var _updateFileIndex = function(){
			_$filesContainer.html("");
			var i = self.files.length;
			while(i--)
				self.files[i].updateIndex(i);
		};
		
		var _removeFiles=function(){
			var i=self.files.length;
			while(i-- && i>=0){
				if(typeof self.settings.onRemove==="function")
					self.settings.onRemove(self.files[i]);
				self.files[i].remove();
			}
			return self.files.legth===0;
		};
		
		var _removeFile=function(index){
			if(index<self.files.length){
				if(typeof self.settings.onRemove==="function")
					self.settings.onRemove(self.files[index]);
				self.files.splice(index,1);
				_filesReady--;
				if(self.files.lenght<=0)
		   			_$selector.append("<span class='easyUploadFile'>Arrastre los ficheros aquí</span>");
				return true;
			}else return false;
		};
		
		var _getMimeClass = function(type) {
			if (type.match(/image/))
				return "easyUploadImage";
			else if (type.match(/pdf/))
				return "easyUploadPdf";
			else if (type.match(/url/))
				return "easyUploadUrl";
			else return "easyUploadDoc";
		};
		
		var _checkFile = function(file){
			var result=true;
			/*if(file.file.size<self.settings.maxSize*1024 && self.settings.allowedTypes.indexOf(file.file.type)>0)
				result=true;*/
			return result;
		};
		
		var _checkFilesLoaded=function(){
			console.log(_filesReady)
			if(_filesReady==self.files.length){
				if(self.settings.debug) console.log("All files are ready to upload");
				if(self.settings.autoUpload && !self.settings.uploadSingle)
					_uploadFiles();
			}else
				if(self.settings.debug) console.log("Waiting for files...");
		};
		
		var _handleResponseFile = function(payload){
			if(self.settings.debug)
				console.log(payload);
			if(typeof payload==="string")
				try{
					payload=JSON.parse(payload);
				}catch(e){
					if(self.settings.debug)
						console.log("Invalid JSON String");
				}
			if(payload.result===0){
				self.files[payload.index].uploaded=true;
				self.files[payload.index].setStatus("uploaded");
				self.files[payload.index].url=payload.absPath;
				self.files[payload.index].relPath=payload.relPath;
				self.files[payload.index].uploadedName=payload.name;
			}else{
				self.files[payload.index].uploaded=false;
				self.files[payload.index].setStatus("failed");
				self.files[payload.index].url="";
				self.files[payload.index].relPath="";
				self.files[payload.index].uploadedName="";
			}
			self.files[payload.index].draw();
			if(typeof self.settings.onUpload==="function")
				self.settings.onUpload(self.files[payload.index],payload.result);
		};
		
		var _handleResponseFiles = function(payload){
			if(self.settings.debug)
				console.log(payload);
			if(typeof payload==="string")
				try{
					payload=JSON.parse(payload);
				}catch(e){
					if(self.settings.debug)
						console.log("Invalid JSON String");
				}
			for(var i=0;i<payload.files.length;i++)
				_handleResponseFile(payload.files[i]);
		};
		
		var _getUploadData=function(index){
			var i=self.files.length,
				maxFiles=i,
				maxTypes=self.settings.allowedTypes.length,
				data=new FormData();
			data.append("maxFiles", maxFiles);
			data.append("maxTypes", maxTypes);
			data.append("relPath", self.settings.relPath);
			data.append("absPath", self.settings.absPath);
			data.append("maxWidth", self.settings.maxWidth);
			data.append("maxHeight", self.settings.maxHeight);
			data.append("maxSize", self.settings.maxSize);
			for(var j=0;j<maxTypes;j++)
				data.append("allowedTypes_"+j,self.settings.allowedTypes[j]);
			if(typeof index==="undefined")
				while(i--){
					if(self.files[i].state()==="resolved" && !self.files[i].uploaded){
						data.append("easyUploadFile_"+self.files[i].index, self.files[i].file);
						self.files[i].setStatus("uploading");
					}else if(!self.files[i].uploaded){
						self.files[i].reject();
						self.files[i].draw();
					}
				}
			else
				if(self.files[index].state()==="resolved" && !self.files[index].uploaded){
					data.append("easyUploadFile_"+self.files[index].index, self.files[index].file);
					self.files[index].setStatus("uploading");
				}else if(!self.files[i].uploaded){
					data=false;
					self.files[i].reject();
					self.files[i].draw();
				}
			return data;
		};
		
		var _uploadFiles=function(){
			var i=self.files.length,
				max=i;
			var data=_getUploadData();
			if(typeof $.easyAjax!=="undefined"){
				if(self.settings.debug) console.log("Uploading files: via jQuery easyAjax");
				$.easyAjax({
					method : "POST",
					//dataType:"multipart/form-data",
					file : self.settings.file,
					data : data,
					success : _handleResponseFiles,
					error:function(){alert("Ther was an error while uploading.");},
					isAdmin : self.settings.isAdmin,
					isFile : true
				}).call();
			}else{
				if(self.settings.debug) console.log("Uploading file:"+self.files[i].index+" via jQuery ajax");
				$.ajax({
					method : "POST",
					//dataType:"multipart/form-data",
					file : self.settings.absPath+self.settings.file,
					data : data,
					success : _handleResponseFiles,
					error:function(){alert("Ther was an error while uploading.");}
				});
			}
		};
		
		/****************************************/
		/*			 Public methods				*/
		/****************************************/
		self.upload=function(){
			_uploadFiles();
		};
		self.remove=function(index){
			if(typeof index==="undefined")
				_removeFiles();
			else if(!isNaN(index) && index<self.files.length)
				_removeFile(index);
			else
				return false;
		};
		self.setFile=function(name,mime,url){
			var file = new File({
				name:name,
				uploadedName:name,
				mime:mime,
				uploaded:true,
				url:url,
				prettyImg:url
			});
			_filesReady++;
			self.files.push(file);
			file.initStatus(false);
			file.draw();
			if(self.settings.debug) console.log("File added");
		};
	};
	return new easyUploadObj(settings);
};
}(jQuery));

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(elt /*, from*/) {
		var len = this.length >>> 0;
		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0)
			from += len;
		for (; from < len; from++) {
			if ( from in this && this[from] === elt)
				return from;
		}
		return -1;
	};
}

$.fn.textWidth = function(){
	var text	= $(this).html();
	var html	= '<span>'+text+'</span>';
	$(this).html(text);
	var width	= $(this).find('span:first').width();
	$(this).html(text);
  	return width;
};