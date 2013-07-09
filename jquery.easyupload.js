/*
 * Parámetros
 * 	- selectorId		=> En el caso de ejecutar la función sin un selector habrá que especificar el id del elemento donde se manejarán los archivos
 * 	- appendFiles		=> Si se mantedrán los archivos cargados anteriormente o se desecharán al añadir más
 * 	- autoUpload		=> Si se subirán los ficheros automáticamente una vez cargados o no
 * 	- isAdmin			=> En el caso de llamar a la función en el CMS hay que indicarlo aquí
 * 	- dragAndDrop		=> Activar o desactivar el arrastrar ficheros
 * 	- multiple			=> Permitir la subida múltiple de ficheros
 *  - folder			=> Directorio donde se subirán los archivos
 *	- maxWidth			=> En el caso de ser una imagen, el tamaño al cual se redimensionará
 *	- maxHeight			=> En el caso de ser una imagen, el tamaño al cual se redimensionará
 *	- maxSize			=> Tamaño máximo permitido del fichero
 *	- allowedTypes		=> Tipos MIME permitidos
 *	- allowedExt		=> Extensiones permitidas [NO IMPLEMENTADO]
 *	- drawFiles			=> Dibujar los archivos debajo del selector
 *	- uploadCallback	=> Función que se ejecutará cuando se reciba una respuesta del servidor sobre el archivo subido
 *	- removeCallback	=> Función que se ejecutará al eliminar un fichero de la lista de ficheros
 *	- uploadSingle		=> Activar o desactivar la subida individual de ficheros
 * 
 * Funciones
 * 	- $(ELEM).easyUpload()									=> Crea el manejador de ficheros sobre un selector y lo devuelve
 * 	- $.easyUpload()										=> Crea el manejador de ficheros y lo devuelve
 * 	- removeFile(index)										=> Elimina el archivo con la posición "index"
 *	- resetFile(index)										=> Inicializa el estado del archivo con la posición "index"
 *	- uploadAll()											=> Sube al servidor todos los ficheros válidos
 * 	- uploadFile(index)										=> Sube al servidor el archivo con la posición "index"
 * 	- setFakeFile(name,size,type,isUploaded,absPath)		=> Crea un fichero falso
 * 
 * REQUISITOS
 * 	- jQuery
 * 	- easyAjax
 * 
 */

/* INIT PLUGUIN */
( function($) {
	/***********************************/
	/* Create $(selector).easyUpload() */
	/***********************************/
	$.fn.easyUpload = function(params) {
		var self = this;
		//Selector
		params = typeof params === 'object' ? params : {};
		params.selectorId = self.prop("id");
		return $.easyUpload(params);
	}
	//Include dataTransfer property to jQuery events
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
		/* 	PARAM NAME							IF IS A VALID TYPE				PARAM VALUE				DEFAULT VALUES				*/
			selectorId		: typeof params.selectorId		=== 'string' 	? params.selectorId 	: "no-input-selected",
			//fileUploader	: typeof params.fileUploader	=== 'string' 	? params.fileUploader 	: "easyUpload",
			appendFiles		: typeof params.appendFiles		=== 'boolean' 	? params.appendFiles 	: false,			//Delete or not if exist previous files
			autoUpload 		: typeof params.autoUpload		=== 'boolean' 	? params.autoUpload 	: false,			//Auto-upload if append new files
			isAdmin 		: typeof params.isAdmin			=== 'boolean' 	? params.isAdmin 		: false,			//Only if use $.easyAjax
			dragAndDrop 	: typeof params.dragAndDrop		=== 'boolean' 	? params.dragAndDrop 	: true,				//Enable drag&Drop on the selector
			multiple	 	: typeof params.multiple		=== 'boolean' 	? params.multiple	 	: true,				//Enable multiple upload
			folder 			: typeof params.folder 			=== 'string' 	? params.folder 		: "files/temp/",	//Folder where files are going to be moved
			maxWidth 		: typeof params.maxWidth		=== 'number' 	? params.maxWidth 		: 200,				//If files are images, set width
			maxHeight 		: typeof params.maxHeight 		=== 'boolean' 	? params.maxHeight 		: "",				//If files are images, set height
			maxSize 		: typeof params.maxSize 		=== 'number' 	? params.maxSize 		: 2000,				//Max allowed size in kb
			allowedTypes 	: typeof params.allowedTypes 	=== 'object' 	? params.allowedTypes 	: ["image/png", "image/gif", "image/jpg", "image/jpeg", "application/pdf"],
			allowedExt 		: typeof params.allowedTypes 	=== 'object' 	? params.allowedTypes 	: ["png", "gif", "jpg", "jpeg", "pdf"],
			drawFiles 		: typeof params.drawFiles 		=== 'boolean' 	? params.drawFiles 		: true,
			uploadCallback 	: typeof params.uploadCallback 	=== 'function' 	? params.uploadCallback : function(jsonResponse){return false;},	//Function to be executed when ajax has ended succesfully
			removeCallback 	: typeof params.removeCallback 	=== 'function' 	? params.removeCallback : function(){return false;},	//Function to be executed when remove a file
			uploadSingle	: typeof params.uploadSingle	=== 'boolean' 	? params.uploadSingle 	: true				//Dont upload files at the same time
		};
		//Return object
		var easyUploadObj = function(settings) {
			var self = this;
			/****************************************/
			/*		 Extend default settings		*/
			/****************************************/
			self.settings			= $.extend(self.settings, settings);
				//Paths depends where you are calling the scritp
				self.settings.relPath	= self.settings.isAdmin ? "../../" + self.settings.folder : "../" + self.settings.folder;
				self.settings.absPath	= base_url+self.settings.folder;
			/****************************************/
			/*			 Private attrs				*/
			/****************************************/
			var $selector 			= $("#"+self.settings.selectorId);
			var selector			= $selector[0];
			var $appendedSelector	= $selector;
			var isInput				= selector.nodeName=="INPUT";
			var updateTime=1000;
			if(isInput){	
				$selector.wrap("<div class='easyUploadContainer easyUploadNoStyle'></div>");
				$appendedSelector=$("<div class='easyUploadAppended'></div>").insertAfter($selector);
				updateTime=300;
			}else{
				$selector.addClass("easyUploadContainer");
				$selector.append("<span class='easyUploadFile'>Arrastre los ficheros aquí</span>");
			}
			var deferred=$.Deferred();
			/****************************************/
			/*			 Public attrs				*/
			/****************************************/
			//Files to be uploaded and their status
				self.files 			= [];
				self.filesStatus	= []; 						//Contains FileStat objects
				self.uploadedFiles	= [];
				var FileStat=function(index){
					var self=this;					//File status object handler
					this.deferred	= $.Deferred();
					this.promise	= this.deferred.promise();
					this.state		= this.promise.state; 		//Use it as a function "state()"
					this.index		= index;
					this.uploadedURL="";
					this.uploadedName="";
					this.promise.always(function(){ 			//Esta función se ejecutará siempre, falle o resuelva
						//setTimeout(_drawFile,updateTime,self.index);
						var mode=_uploadMode();
						if(mode)
							if(isInput)
								_uploadSingleFile(self.index);
							else
								setTimeout(_uploadSingleFile,updateTime,self.index);
						else
							_checkFilesLoaded();
					});
					this.draw=function(){_drawFile(self.index)};
					this.reset = function(){
						//console.log("reset file "+self.index);
						self.deferred 	= $.Deferred();
						self.promise	= self.deferred.promise();
						self.state		= self.promise.state;
						self.uploadedURL= self.uploadedURL;
						self.uploadedName= self.uploadedName;
						_drawFile(self.index);
						self.promise.always(function(){ 
							if(isInput)
								_drawFile(self.index);
							else
								setTimeout(_drawFile,updateTime,self.index);
						});
					};
					this.setUploadedStatus=function(){
						self.state=function(){return "uploaded"};
					}
				};
			//self.xhr	= self.settings.xhr;		
			//self.readyToUpload	= deferred.promise();
			/****************************************/
			/*			 Private methods 			*/
			/****************************************/
			var _uploadMode=function(){
				return self.settings.uploadSingle;
			};
			var _setFiles=function(evt){
				//console.log("_setFiles()");
				if(!self.settings.appendFiles){
					self.files=[];
					self.uploadedFiles=[];
				}
				var tempFiles=[];
				if(isInput && typeof evt!=="undefined"){
					tempFiles=selector.files;
				}else{
					evt.stopPropagation();
					evt.preventDefault();
					tempFiles=evt.dataTransfer.files;
					_handleDragleave();
				}
				//Insert files into array and delete FileList collection
					var i=tempFiles.length;
					while (i--) {
						self.files.push( tempFiles[i] );
					}
				_setFilesStatus();
				_drawFiles();
			};
			var _checkFileRestrictions=function(index,success,fail){
				//console.log("_checkFileRestrictions("+index+")");
				if (self.files[index].size/1024<self.settings.maxSize && self.settings.allowedTypes.indexOf(self.files[index].type)>=0 )
					//&& self.settings.allowedExt.indexOf(self.files[index].type) >= 0 )
					success();
				else
					fail();
			};
			var _resetFile=function(index){
				//console.log("_resetFile("+index+")");
				self.filesStatus[index].reset();
				_checkFileRestrictions(index,function(){
					_setFileReader(index);
				},function(){
					self.filesStatus[index].deferred.reject();
				});
			};
			var _resetAllFiles=function(){
				var i=self.filesStatus.length;
				while (i--) self.filesStatus[i].reset();
			}
			var _setFileReader=function(index){
				//console.log("_setFileReader("+index+")"+" ---> "+self.filesStatus[index].state());
				var reader = new FileReader();
				reader.onerror = function(evt) {
					self.filesStatus[index].deferred.reject();
				};
				reader.onabort = function(evt) {
					self.filesStatus[index].deferred.reject();
				};
				reader.onload = function(evt) {
					self.filesStatus[index].deferred.resolve();
				};
				reader.readAsBinaryString(self.files[index]);
			};
			var _setFilesStatus=function(){
				//console.log("_setFilesStatus()");
				var i = self.files.length;
				if(!self.settings.multiple) i=1; //Only accepts the first file
				function tempReject(deferred){
					deferred.reject();
				}
				while (i-- && self.uploadedFiles.indexOf(i)<0){
					self.filesStatus[i]=new FileStat(i);
					//File restrictions
					_checkFileRestrictions(i,function(){
						_setFileReader(i);
					},function(){
						setTimeout(tempReject,updateTime,self.filesStatus[i].deferred);
					});
				}
			};
			//Return class with MIME icon
			var _getMimeClass = function(index) {
				var type=self.files[index].type;
				//console.log(self.files[index].type);
				if (type.match(/image/))
					return "easyUploadImage";
				else if (type.match(/pdf/))
					return "easyUploadPdf";
				else return "easyUploadDoc";
			};
			var _drawFile = function(index){
				//console.log("_drawFile("+index+")");
				$appendedSelector.find(".clear").remove();
				if( $appendedSelector.find(".file_"+index).length<=0 ){
					//console.log($appendedSelector.html());
					var html= "<div class='easyUploadFile file_"+index+"'></div>";
					$appendedSelector.append(html);
				}
				var contentHtml   = "<div class='easyUploadIcon "+_getMimeClass(index)+"'></div>";
					if( self.uploadedFiles.indexOf(index)>=0 )
						contentHtml   += "<div class='easyUploadName more-text-collapse'><a target='_blank' href='"+self.filesStatus[index].uploadedURL+"'>"+self.files[index].name+"</a></div>";
					else
						contentHtml   += "<div class='easyUploadName more-text-collapse'>"+self.files[index].name+"</div>";
					contentHtml   += "<div class='easyUploadSize'>"+parseInt(self.files[index].size/1204)+"kb</div>";
					contentHtml   += "<div class='easyUploadStatus easyUploadStatus_"+index+" easyUploadStatus_"+self.filesStatus[index].state()+"'></div>";
					contentHtml   += "<div class='easyUploadCopy'></div>";
					contentHtml   += "<div class='easyUploadRemove remove_"+index+"'></div>";
				$appendedSelector.append("<div class='clear'></div>");
					//if(!self.settings.autoUpload) contentHtml   += "<div class='easyUploadRemove remove_"+index+"'></div>";
					//console.log(contentHtml);
				$appendedSelector.find(".file_"+index).html(contentHtml);
				$appendedSelector.find(".file_"+index).find(".remove_"+index).unbind().click(function(){_removeFile(index)});
				$appendedSelector.find(".file_"+index).find(".easyUploadCopy").unbind().click(function(){
					window.prompt("Presione CRTL+C para copiar el texto",self.filesStatus[index].uploadedURL);
			    });
				//$appendedSelector.css("background","red").css("height","auto");
				//$selector.parent().append(contentHtml);
			};
			var _drawFiles = function() {
				//console.log("_drawFiles()");
				//Clean the files of the box
				if(!self.settings.appendFiles) $appendedSelector.html("");
				var i = self.files.length;
				if(i==0 && self.uploadedFiles.length==0) $selector.append("<span class='easyUploadFile'>Arrastre los ficheros aquí</span>");
				while (i--) {
					_drawFile(i);
				}
				var tempHtml=$appendedSelector.html();
				$selector.insertBefore($appendedSelector);
				$appendedSelector.append("<div class='clear'></div>");
			};
			var _removeFile=function(index){
				if(index<self.files.length){
					self.settings.removeCallback(index,self.filesStatus[index].uploadedName);
					self.files.splice(index,1);
					self.filesStatus.splice(index,1);
					var pos=self.uploadedFiles.indexOf(index);
					self.uploadedFiles.splice(pos,1);
					$appendedSelector.find(".file_"+index).remove();
					return true;
				}else return false;
			};
			var _handleResponseFiles=function(response) {
				var response = JSON.parse(response);
				var i=response.files.length;
				//self.uploadedFiles=[];
				while(i-- && i>=0){
					if(response.files[i].result == 0 || response.files[i].result == "0"){
						self.filesStatus[response.files[i].index].deferred.resolve();
						self.filesStatus[response.files[i].index].uploadedURL=response.files[i].absPath;
						self.filesStatus[response.files[i].index].uploadedName=response.files[i].name;
						self.uploadedFiles.push(i);
					}else
						self.filesStatus[response.files[i].index].deferred.reject();
				}
				self.settings.uploadCallback(response);
			};
			var _handleResponseFile=function(response) {
				if(!response.match(/^\<b\>ERROR\<\/b\>/)){
					var response = JSON.parse(response);
					if(response.files[0].result == 0 || response.files[0].result == "0"){
						self.uploadedFiles.push(response.files[0].index);
						self.filesStatus[response.files[0].index].deferred.resolve();
						self.filesStatus[response.files[0].index].uploadedURL=response.files[0].absPath;
						self.filesStatus[response.files[0].index].uploadedName=response.files[0].name;
						_drawFile(response.files[0].index);
					}else{
						self.filesStatus[response.files[0].index].deferred.reject();
						_drawFile(response.files[0].index);
					}
					self.settings.uploadCallback(response);
				}
			};
			var _checkFilesLoaded=function(){
				function tempState(promise){
					return promise.state();
				}
				var ready=true;
				var i = self.filesStatus.length;
				while (i--) {
					if( tempState(self.filesStatus[i].promise)=="pending" ) ready=false;
				}
				if(ready && self.settings.autoUpload) setTimeout(self.uploadAll,updateTime);
			}
			var _uploadSingleFile=function(index){
				self.uploadFile(index);
			}
			/****************************************/
			/*			 Event handlers 			*/
			/****************************************/
			var _handleDragenter = function(evt) {
				$selector.addClass("easyUploadEnter");
			};
			var _handleDragleave = function(evt) {
				$selector.removeClass("easyUploadEnter");
			};
			var _handleDragover = function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				evt.dataTransfer.dropEffect = 'copy';
			};
			if(self.settings.dragAndDrop){
				//Event launched when mouse drops a file over this item
				$selector.bind("dragenter", _handleDragenter);
				//Event launched when mouse drops a file over this item
				$selector.bind("dragleave", _handleDragleave);
				//Event launched when mouse is dragging a file and is over this item
				$selector.bind("dragover", _handleDragover);
				//Event launched when mouse drops a file over this item
				if(!isInput) $selector.bind("drop", _setFiles);
			}
			if(isInput){
				if(self.settings.multiple) $selector.attr("multiple","");
				$selector.bind("change", _setFiles);
			}
			//Cut text when overflow-x
			$appendedSelector.find(".easyUploadName").textWidth();
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
				setTimeout(_resetAllFiles(),updateTime/2);
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

$.fn.textWidth = function(){
	var text	= $(this).html();
	var html	= '<span>'+text+'</span>';
	$(this).html(text);
	var width	= $(this).find('span:first').width();
	$(this).html(text);
  	return width;
};