/*
 * Parámetros (es un objeto)

 * 
 * Métodos
 * 	- $.easyWindow()		=> Crea una ventana y la devuelve como objeto
 * 	- .open()				=> Abre un objeto creado con la función $.easyWindow()
 *	- .close()				=> Cierra un objeto creado con la función $.easyWindow()
 *	- .toggle()				=> Abre o cierra una ventana según se encuentre abierta o cerrada
 * 	- .reload()				=> Vuelve a cargar la ventana
 * 	- .setSettings()		=> Cambia el valor de algunos parámetros
 * 
 * REQUISITOS
 * 	- en el archivo bootstrap.js, modificar el método 'enforceFocus' comentando la línea 'that.$element.focus();' 
 * 	- easyajax
 *  - jqueryUI
 */



(function($){
	/***********************************/
	/* 		  Create $.easyWindow()	   */
	/***********************************/
	$.easyTabs = function(params) {

		/***********************************/
		/*   Initialize default settings   */
		/***********************************/
		params = typeof params === 'undefined' ? {} : params;
		var self={
				settings:{
					/* PARAM NAME					IS A VALID TYPE						PARAM VALUE				DEFAULT VALUE				*/	
					debug		: typeof params.debug				===	'boolean'	?	params.debug			:	false,
					toolbar		: typeof params.toolbar				===	'boolean'	?	params.toolbar			:	true,
					file		: typeof params.file				===	'string'	?	params.file				:	"inicio",
					isAdmin		: typeof params.isAdmin				===	'boolean'	?	params.isAdmin			: 	false,
					data		: typeof params.data				===	'object'	?	params.data				:	{action:"noContent"},
					width		: typeof params.width				===	'string'	?	params.width			:	"auto",
					height		: typeof params.height				===	'string'	?	params.height			:	"auto",
					background	: typeof params.background			===	'boolean'	?	params.background		: 	false,
					bootstrap	: typeof params.bootstrap			===	'number'	?	params.bootstrap		:	2,
					title		: "easyTabs Title"
				},
				tabs:[],
				toolbar:null
			},
			_zIndex=0;
		
		/***********************************/
		/*   	  	Tab Model			   */
		/***********************************/
		var easyTabsObj=function(settings){
			var obj	= this;
			
			/************************************/
			/*     Extend default settings      */
			/************************************/
			obj.settings=$.extend(self.settings, settings);
			obj.html="";
			obj.index=self.tabs.length;
			
			var _$tab=$('<div class="modal fade" id="easyTabsModal_'+obj.index+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"></div>').css("z-index",_zIndex).append(
					'<div class="modal-dialog"><div class="modal-content"></div></div>'
				),
				_$content=_$tab.find("div.modal-content"),
				_$body=$('<div class="modal-body"></div'),
				_$footer=$('<div class="modal-footer"></div>'),
				_isBig=false,
				_prevStatus={
					width:0,
					height:0,
					right:0,
					left:0,
					top:0
				};
			obj.isBig=_isBig;
			_zIndex++;
			
			obj.settings.title+=" "+obj.index;
			if(self.settings.bootstrap===2)
				var _$header=$('<div class="modal-header easyTabDraggable"><span class="btn btn-link pull-right easyTabClose"><i class="icon-remove"></i></span><span class="btn btn-link pull-right easyTabFullScreen"><i class="icon-fullscreen"></i></span><span class="btn btn-link pull-right easyTabMinimize"><i class="icon-minus"></i></span><h4 class="modal-title" id="myModalLabel">'+obj.settings.title+'</h4></div>');
			else
				var _$header=$('<div class="modal-header easyTabDraggable"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title" id="myModalLabel">'+obj.settings.title+'</h4></div>');
			_$content.append(_$header).append(_$body).append(_$footer);
			
			obj.$tab=_$tab;
			
			obj.reload=function(newContent){
				if(self.settings.debug)
					console.log("---- Reloading tab: "+obj.index);
				return self;
			};

			obj.open=function(){
				if(self.settings.debug)
					console.log("---- Opening tab: "+obj.index);
				_$tab.modal('show');
				_$tab.trigger('focus');
				if(self.settings.toolbar)
					self.toolbar.update(obj.index,"open");
				return self;
			};
			
			obj.hide=function(){
				if(self.settings.debug)
					console.log("---- Hiding tab: "+obj.index);
				_$tab.modal('hide');
				if(self.settings.toolbar)
					self.toolbar.update(obj.index,"minimize");
				return self;
			};
			
			obj.close=function(){
				if(self.settings.debug)
					console.log("---- Closing tab: "+obj.index);
				_$tab.modal('hide');
				setTimeout(function(){
					obj.$tab.remove();
					self.tabs.splice(obj.index,1);
				},400);
				if(self.settings.toolbar)
					self.toolbar.update(obj.index,"close");
				return self;
			};
			
			obj.toggle=function(){
				if(self.settings.debug)
					console.log("---- Toggling tab: "+obj.index);
				_$tab.modal('toggle');
				return self;
			};
			
			obj.fullScreen=function(){
				if(!_isBig){
					_prevStatus={
						top	  : _$tab.css("top"),
						left  : _$tab.css("left"),
						width : _$tab.css("width"),
						height: _$tab.css("height")
					};
					var maxH=$("#easyTabsContainer").height()-(self.settings.toolbar?$("#easyTabsToolbar").height():0)-5;
					_$tab.animate({
						top:$("#easyTabsContainer").css("top"),
						left:288,
						height:maxH,
						width:$("#easyTabsContainer").width()-20
					});
					if(self.settings.bootstrap===2)
						_$header.find(".easyTabFullScreen").html('<i class="icon-resize-small"></i>');
					else
						_$header.find(".easyTabFullScreen").html('<i class="icon-resize-small"></i>');
					_$tab.draggable("disable");
					_$tab.resizable("disable");
					_isBig=true;
					_resizeObj();
					if(self.settings.toolbar)
						self.toolbar.update(obj.index,"maximize");
				}else
					obj.restore();
			};
			
			obj.restore=function(){
				if(_isBig){
					_$tab.animate({
						top:_prevStatus.top,
						left:_prevStatus.left,
						height:_prevStatus.height,
						width:_prevStatus.width
					},function(){
						_resizeObj();
					});
					if(self.settings.bootstrap===2)
						_$header.find(".easyTabFullScreen").html('<i class="icon-fullscreen"></i>');
					else
						_$header.find(".easyTabFullScreen").html('<i class="icon-fullscreen"></i>');
					_$tab.draggable("enable");
					_$tab.resizable("enable");
					_$tab.trigger("drag");
					_isBig=false;
				}
				if(self.settings.toolbar)
					self.toolbar.update(obj.index,"restore");
			};
			
			obj.remove=function(){
				if(self.settings.debug)
					console.log("Removing tab: "+obj.index);
			};
			
			obj.getFocus=function(){
				_zIndex++;
				_$tab.css("z-index",_zIndex);
			};
			
			/************************************/
			/* 			Construct tab			*/
			/************************************/
			var _init=function(){
				if(self.settings.debug)
					console.log("Initializing tab: "+obj.index);
				var html=$.easyAjax({
					file	: obj.settings.file,
					data	: obj.settings.data,
					method	: "post",
					type	: "text",
					success	: function(html){
						if(self.settings.debug) console.log("---- Content ready to rock: "+obj.index);
						obj.html=html;
						_bindEvents();
					},
					error	: function(){},
					complete: function(payload){
						//console.log(payload.responseText);
					}
				});
			};
			
			var _resizeObj=function(){
				var fOffset=30,
					hOffset=50,
					h=_$tab.height()-_$header.height()-_$footer.height()-fOffset-hOffset;
				_$body.css("height",h);
			};
			
			var _bindEvents=function(){
				_$body.html(obj.html);
				$("body").append(_$tab);
				console.log(obj.index);
				_$header.find(".easyTabFullScreen").click(function(){obj.fullScreen();});
				_$header.find(".easyTabMinimize").click(function(){obj.hide();});
				_$header.find(".easyTabClose").click(function(){obj.close();});
				
				_$tab.draggable({
					handle:".modal-header",
					zIndex:self.tabs.length,
					containment:"#easyTabsContainer",
					start:function(){
						self.toolbar.update(obj.index,"focus");
						obj.getFocus();
					},
					stop:function(){
						obj.getFocus();
					}
				}).resizable({
					maxHeight:$("#easyTabsContainer").height(),
					maxWidth:$("#easyTabsContainer").width(),
					minHeight:250,
					minWidth:450,
					ghost:false,
					resize:function(){
						self.toolbar.update(obj.index,"focus");
						$(this).css("position","fixed");
						_resizeObj();
						_isBig=false;
					}
				}).click(function(){
					obj.getFocus();
					self.toolbar.update(obj.index,"focus");
				});
				
				_$tab.modal({backdrop:obj.settings.background});
				_$tab.focus(function(){
					obj.getFocus();
					self.toolbar.update(obj.index,"focus");
				});
				if(self.settings.toolbar)
					self.toolbar.update(obj.index,"new");
			};
			
			_init();
			return obj;
		};
		/***********************************/
		/*   		Toolbar Model		   */
		/***********************************/
		var easyToolbarObj=function(settings){
			var obj={};
			obj.settings=$.extend(self.settings, settings);
			obj.tabs=[];
			
			var easyToolbarTabObj=function(tabIndex){
				var obj=this;
				obj.index=tabIndex;
				
				obj.close=function(){
					obj.$html.remove();
					self.toolbar.tabs.splice(obj.index,1);
					self.tabs[obj.index].close();
				};
				
				obj.remove=function(){
					obj.$html.remove();
					self.toolbar.tabs.splice(obj.index,1);
				};
				
				obj.getFocus=function(){
					_zIndex++;
					obj.$html.css("z-index",_zIndex);
					obj.$html.addClass("easyTabActive");
				};
				
				obj.looseFocus=function(){
					obj.$html.css("z-index",obj.index);
					obj.$html.removeClass("easyTabActive");
				};
				
				obj.draw=function(active){
					obj.$html=$('<div class="easyTabs"></div>');
					if(active)
						obj.$html.addClass("easyTabActive");
					$close=$('<div class="easyTabsHeader"><button type="button" class="close easyTabToolbarClose">&times;</button></div>').css({width:175,paddingRight:10});
					$p=$('<p class="easyTabsContent">'+self.tabs[obj.index].settings.title+'</p>');
					$close.click(function(){obj.close();});
					obj.$html.click(function(){
						self.tabs[obj.index].open();
					});
					
					obj.$html.append($close).append($p);
					self.toolbar.$toolbar.append(obj.$html);
				};
				
				var _init=function(active){
					obj.draw(true);
				};
				
				_init();
				return obj;
			};
			
			var _init=function(){
				if(self.settings.debug) console.log("Initializing toolbar");
				obj.$toolbar=$('<div id="easyTabsToolbar"></div>');
				$("body").append(obj.$toolbar);
				
				if(self.tabs.length==0)
					obj.$toolbar.hide();
			};
			
			var _resetFocus=function(){
				var i=self.toolbar.tabs.length;
				while(i--)
					self.toolbar.tabs[i].looseFocus();
			};
			
			var _focusBackTab=function(tabIndex){
				var i=self.tabs.length,
					zIndex=0,
					found=false;
				while(i--){
					zIndex2=self.tabs[i].$tab.css("z-index");
					if(self.tabs[i].$tab.is(":visible") && zIndex2>zIndex && i!=tabIndex){
						zIndex=zIndex2;
						found=i;
					}
				}
				if(found!==false) self.toolbar.tabs[found].getFocus();
			};
			
			obj.update=function(tabIndex,action){
				if(self.settings.debug){
					console.log("-- Updating toolbar");
					console.log("----> Tab index: "+tabIndex+", action: "+action);
				}
				_resetFocus();
				switch(action){
					case 'new':
						obj.tabs.push(new easyToolbarTabObj(tabIndex));
						break;
					case 'open':
						self.toolbar.tabs[tabIndex].getFocus();
						break;
					case 'close':
						if(self.toolbar.tabs[tabIndex])
							self.toolbar.tabs[tabIndex].remove();
						_focusBackTab(tabIndex);
						break;
					case 'maximize':
						self.toolbar.tabs[tabIndex].getFocus();
						break;
					case 'restore':
						self.toolbar.tabs[tabIndex].getFocus();
						break;
					case 'minimize':
						self.toolbar.tabs[tabIndex].looseFocus();
						_focusBackTab(tabIndex);
						break;
					case 'focus':
						self.toolbar.tabs[tabIndex].getFocus();
						break;
				}
				if(self.toolbar.tabs.length>0)
					obj.$toolbar.show();
				else
					obj.$toolbar.hide();
			};
			
			_init();
			return obj;
		};
		
		/***********************************/
		/*   			Private			   */
		/***********************************/
		var _resetZIndex=function(){
			var i=self.tabs.length;
			while(i--)
				self.tabs[i].$tab.css("z-index",self.tabs[i].index);
			_zIndex=self.tabs.length;
		};
		var _initEasyTabs=function(){
			if(self.settings.toolbar)
				self.toolbar=new easyToolbarObj();
			$("body").prepend("<div id='easyTabsContainer'></div>");
			//Remove transitions for better performance
			$("#easyTabsContainer").css("height",$(window).height()-71);
		};
		/***********************************/
		/*   			Public			   */
		/***********************************/
		self.newTab=function(params){
			if(self.settings.debug)
				console.log("------------ Creating new tab ------------");
			params = typeof params === 'undefined' ? {} : params;
			self.tabs.push(new easyTabsObj($.extend(params,self.settings)));
			_zIndex++;
		};
		_initEasyTabs();
		return self;
	}; //End $.easyAjax()
	
}(jQuery));
