$.fn.easyUploadBeta = function(params) {
		var self = this;
		//Selector
		params = typeof params === 'object' ? params : {};
		params.selectorId = self.prop("id");
		return $.easyUploadBeta(params);
	}
	//Include dataTransfer to jQuery events for file handling
	jQuery.event.props.push('dataTransfer');
	/***********************************/
	/* 		  Create $.easyUpload()	   */
	/***********************************/
	$.easyUploadBeta = function(params) {
		/***********************************/
		/*   Initialize default settings   */
		/***********************************/
		params = typeof params === 'undefined' ? {} : params;
		settings = {
		/* 	PARAM NAME							IF IS A VALID TYPE				PARAM VALUE			DEFAULT VALUES				*/
			debug			: typeof params.debug			=== 'boolean' 	? params.debug 	: false,
			//Visual params
			selectorId		: typeof params.selectorId		=== 'string' 	? params.selectorId 	: "NO-NODE",
			dragAndDrop 	: typeof params.dragAndDrop		=== 'boolean' 	? params.dragAndDrop 	: true,				//Enable drag&Drop on the selector
			appendFiles		: typeof params.appendFiles		=== 'boolean' 	? params.appendFiles 	: false,			//Delete or not if exist previous files
			drawFiles 		: typeof params.drawFiles 		=== 'boolean' 	? params.drawFiles 		: true,				//Automatically draw files when added
			containerId		: typeof params.filesContainer	=== 'string' 	? params.filesContainer	: "NO-CONTAINER",
			//Upload params
			autoUpload 		: typeof params.autoUpload		=== 'boolean' 	? params.autoUpload 	: true,			//Auto-upload if append new files
			multiple	 	: typeof params.multiple		=== 'boolean' 	? params.multiple	 	: true,				//Enable multiple upload
			folder 			: typeof params.folder 			=== 'string' 	? params.folder 		: "files/imgs/",	//Folder where files are going to be uploaded
			uploadSingle	: typeof params.uploadSingle	=== 'boolean' 	? params.uploadSingle 	: true,				//Upload one file on each ajax call
			//File params
			maxWidth 		: typeof params.maxWidth		=== 'number' 	? params.maxWidth 		: 200,				//If files are images, set width
			maxHeight 		: typeof params.maxHeight 		=== 'boolean' 	? params.maxHeight 		: "",				//If files are images, set height
			maxSize 		: typeof params.maxSize 		=== 'number' 	? params.maxSize 		: 2000,				//Max allowed size in kb
			allowedTypes 	: typeof params.allowedTypes 	=== 'object' 	? params.allowedTypes 	: ["image/png", "image/gif", "image/jpg", "image/jpeg", "application/pdf"],
			//allowedExt 		: typeof params.allowedTypes 	=== 'object' 	? params.allowedTypes 	: ["png", "gif", "jpg", "jpeg", "pdf"],
			//Callback functions
			uploadCallback 	: typeof params.uploadCallback 	=== 'function' 	? params.uploadCallback : function(jsonResponse){return false;},	//Function to be executed when ajax has ended succesfully
			removeCallback 	: typeof params.removeCallback 	=== 'function' 	? params.removeCallback : function(){return false;},	//Function to be executed when remove a file
			//Góbalo params
			isAdmin 		: typeof params.isAdmin			=== 'boolean' 	? params.isAdmin 		: false,			//Only if use $.easyAjax
			baseUrl 		: typeof base_url				=== "undefined" ? typeof params.baseUrl	=== 'string' ? params.baseUrl : window.location.href : base_url,			//Only if use $.easyAjax
		};
		//Returns object
		var easyUploadObj = function(settings) {
			var self = this;
			/****************************************/
			/*		 Extend default settings		*/
			/****************************************/
			self.settings = $.extend(self.settings, settings);
			//Paths depends of the location
				self.settings.relPath	= self.settings.isAdmin ? "../../"+self.settings.folder : "../"+self.settings.folder; //Exit to root directory
				self.settings.absPath	= self.settings.base_url+self.settings.folder;
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
				_updateTime	= 600,
				_isInput		= _$selector[0].nodeName=="INPUT",
				_$filesContainer = undefined,
				_filesToUpload = [];
			if(self.settings.debug)	console.log("Is input? "+_isInput);
			/****************************************/
			/*			 Append container			*/
			/****************************************/
			if(self.settings.containerId=="NO-CONTAINER"){
				if(_isInput){
					_$selector.wrap("<div class='easyUploadContainer easyUploadNoStyle'></div>");
					_$filesContainer=$("<div class='easyUploadAppended'></div>").insertAfter(_$selector);
					_updateTime=300;
				}else{
					_$selector.addClass("easyUploadContainer");
					_$filesContainer=_$selector;
					_$selector.append("<span class='easyUploadFile'>Arrastre los ficheros aquí</span>");
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
				if(!self.settings.appendFiles)
					self.files = [];
				var tempFiles=[];
				if(_isInput && typeof evt!=="undefined")
					tempFiles=_$selector[0].files;
				else{
					evt.stopPropagation();
					evt.preventDefault();
					tempFiles=evt.dataTransfer.files;
					_handleDragleave();
				}
				//Insert files into array and delete FileList collection
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
				if(!_isInput) _$selector.bind("drop", _setFiles);
			}
			if(_isInput){
				if(self.settings.multiple)
					_$selector.attr("multiple","");
				else
					_$selector.removeAttr("multiple");
				_$selector.bind("change", _setFiles);
			}
			/****************************************/
			/*			 File model					*/
			/****************************************/
			var File = function(file,type){
				if(self.settings.debug){
					console.log("Creating new File instance:");
					console.log(file);
				}
				var obj		= this;
				//File
				this.file		= file || {};
				this.mime		= this.file.type || type;
				this.name		= this.file.name || "NO-NAME";
				this.$file		= "NO-FILE";
				this.uploaded	= false;
				this.index		= self.files.length;
				this.url		= function(){
					return self.settings.absPath+obj.name;
				};
				//Status
				this.deferred	= $.Deferred();
				this.promise	= this.deferred.promise();
				this.state		= this.promise.state;
				this.promise.always(function(){ //Esta función se ejecutará siempre, falle o resuelva
					obj.draw();
					if(obj.state()=="resolved")
						if(self.settings.uploadSingle && self.settings.autoUpload){
							_filesToUpload.push(obj);
							obj.upload();
						}else
							_checkFilesLoaded();
				});
				this.reject=function(){
					setTimeout(function(){obj.deferred.reject()},_updateTime);
				};
				this.resolve=function(){
					setTimeout(function(){obj.deferred.resolve()},_updateTime);
				};
				this.setStatus=function(state){
					obj.state=function(){return state};
				};
				this.initStatus=function(){
					if(_checkFile(obj))
						_setFileReader(obj);
					else{
						if(self.settings.debug) console.log("Rejecting file: "+file.index+" -> _checkFile returning false");
						obj.reject();
					}
				};
				//Functions
				this.remove	= function(){
					if(self.settings.debug) console.log("Removing the file: "+obj.index);
					obj.$file.remove();
					_removeFile(obj.index);
				};
				this.draw	= function(){
					if(self.settings.debug) console.log("Drawing the file: "+obj.index);
					var status=obj.state()=="pending"?"easyUploadStatePending":obj.state()=="rejected"?"easyUploadStateRejected":obj.state()=="resolved"?"easyUploadStateResolved":obj.state()=="uploading"?"easyUploadStateUploading":obj.state()=="failed"?"easyUploadStateFailed":"easyUploadStateUploaded";
					var $newFile=$("<div class='easyUploadFile'>"+
										"<div class='easyUploadIcon "+_getMimeClass(obj.mime)+"'></div>"+
										"<div class='easyUploadName'>"+obj.name+"</div>"+
										"<div class='easyUploadSize'>"+parseInt((obj.file.size || 1024)/1024)+"kb</div>"+
										"<div class='easyUploadStatus "+status+"'></div>"+
										"<div class='easyUploadCopy'></div>"+
										"<div class='easyUploadRemove'></div>"+
									"</div");
					if(obj.$file=="NO-FILE")
						obj.$file=$newFile;
					else
						obj.$file.html($newFile.find("div"));
					_$filesContainer.append(obj.$file);
					//Bind mouse events
					obj.$file.find("div.easyUploadCopy").unbind().click(function(){
						window.prompt("Presione CRTL+C para copiar el texto",self.filesStatus[index].uploadedURL);
					});
					_$filesContainer.find("div.easyUploadRemove").unbind().click(function(){
						obj.remove();
				   });
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
					if(obj.state()==="resolved"){
						if(self.settings.debug) console.log("Prepairing upload file:"+obj.index);
						data.append("easyUploadFile_"+obj.index, obj.file);
						obj.setStatus("uploading");
						if(typeof $.easyAjax!="undefined"){
							if(self.settings.debug) console.log("Uploading file:"+obj.index+" via jQuery easyAjax");
							$.easyAjax({
								method : "POST",
								//dataType:"multipart/form-data",
								file : "easyUpload",
								data : data,
								success : _handleResponseFile,
								error:function(){obj.setStatus("failed")},
								isAdmin : false,
								isFile : true
							}).call();
						}else{
							if(self.settings.debug) console.log("Uploading file:"+obj.index+" via jQuery ajax");
							$.ajax({
								method : "POST",
								//dataType:"multipart/form-data",
								file : self.settings.absPath+"easyUpload",
								data : data,
								success : _handleResponseFile,
								error:function(){obj.setStatus("failed")}
							});
						}
					}else{
						obj.reject();
						_drawFile(index);
					}
					
				};
			};
			
			var _setFileReader = function(file){
				var reader = new FileReader();
				reader.onerror = function(evt) {
					if(self.settings.debug) console.log("Rejecting file: "+file.index+" -> Lecture error");
					file.reject();
				};
				reader.onabort = function(evt) {
					if(self.settings.debug) console.log("Rejecting file: "+file.index+" -> Abort lecture");
					file.reject();
				};
				reader.onload = function(evt) {
					if(self.settings.debug) console.log("Resolving file: "+file.index+" -> Lecture completed");
					file.resolve();
				};
				reader.readAsBinaryString(file.file);
			};

			var _drawFiles = function(){
				_$filesContainer.html("");
				var i = self.files.length;
				while(i--) self.files[i].draw();
			};
			
			var _removeFile=function(index){
				if(index<self.files.length){
					self.settings.removeCallback(index,self.files[index].name);
					self.files.splice(index,1);
					_drawFiles();
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
				var result=false;
				if(file.file.size<self.settings.maxSize*1024 && self.settings.allowedTypes.indexOf(file.file.type)>0)
					result=true;
				return result;
			}
			
			var _checkFilesLoaded=function(){
				var i=self.files.length;
				_filesToUpload=[];
				while(i--)
					if(self.files[i].state()=="resolved"){
						_filesToUpload.push(self.files[i]);
						if(self.settings.debug) console.log("Prepairing to upload file: "+self.files[i].index);
					}
				_uploadReadyFiles();
			}
			
			
			//AQUI
			var _uploadSingleFile=function(index){
				self.uploadFile(index);
			}
			
			//Cut text when overflow-x
			_$filesContainer.find(".easyUploadName").textWidth();
			/****************************************/
			/*			 Public methods 			*/
			/****************************************/
			self.removeFile=function(index){_removeFile(index)};
			self.draw=function(){_drawFiles()};
			self.resetFile=function(index){_resetFile(index)};
			self.uploadAll = function() {
				if (!window.FormData) throw("You need HTML5!")
				var data=new FormData();
				var i=self.files.length;
				data.append("maxFiles", i);
				data.append("relPath", self.settings.relPath);
				data.append("absPath", self.settings.absPath);
				data.append("maxWidth", self.settings.maxWidth);
				data.append("maxHeight", self.settings.maxHeight);
				data.append("maxSize", self.settings.maxSize);
				while (i--) {
					//console.log(self.filesStatus[i].state());
					if (self.filesStatus[i].state() === "resolved") data.append("easyUploadFile_"+i, self.files[i]);
				}
				//Reset Files Status
				setTimeout(_resetAllFiles(),_updateTime/2);
				//Only if $.easyAjax is defined!
				var xhr = $.easyAjax({
					method : "POST",
					//dataType:"multipart/form-data",
					file : "easyUpload",
					data : data,
					success : _handleResponseFiles, //function(dat){console.log(dat)},
					isAdmin : false,
					isFile : true
				});
				xhr.call();
			};
			self.uploadFile = function(index) {
				if (!window.FormData) throw("You need HTML5!");
				var data=new FormData();
				data.append("maxFiles", self.files.length);
				data.append("relPath", self.settings.relPath);
				data.append("absPath", self.settings.absPath);
				data.append("maxWidth", self.settings.maxWidth);
				data.append("maxHeight", self.settings.maxHeight);
				data.append("maxSize", self.settings.maxSize);
				if (self.filesStatus[index].state() === "resolved" && self.uploadedFiles.indexOf(index)<0){
					//console.log("enviando el archivo:");
					//console.log(self.files[index]);
					self.filesStatus[index].reset();
					data.append("easyUploadFile_"+index, self.files[index]);
					var xhr = $.easyAjax({
						method : "POST",
						//dataType:"multipart/form-data",
						file : "easyUpload",
						data : data,
						success : _handleResponseFile, //function(dat){console.log(dat)},
						error:function(){self.filesStatus[index].deferred.reject()},
						isAdmin : false,
						isFile : true
					});
					xhr.call();
				}else{
					self.filesStatus[index].deferred.reject();
					_drawFile(index);
				}
				
			};
			self.setFakeFile=function(name,size,type,isUploaded,absPath){
				self.files.push({
					name	: name,
					size	: size,
					type	: type
				});
				var index=self.filesStatus.length;
				self.filesStatus.push(new FileStat(index));
				if(isUploaded){
					self.filesStatus[index].state=function(){return "resolved"};
					self.filesStatus[index].uploadedName=name;
					self.filesStatus[index].uploadedURL=absPath;
					self.uploadedFiles.push(index);
				}else{
					self.filesStatus[index].state=function(){return "rejected"};
					self.filesStatus[index].uploadedName="";
					self.filesStatus[index].uploadedURL="";
				}
				_drawFiles();
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