(function($) {
	var $window = $(window);

	$.fn.easySlider = function(settings){
		
		var defaults = {
				active	: 0, //First slide to show
				auto	: true,	//Autoslide
				delay	: 2000, //Transition timeout
				touch	: true
			},
			settings = $.extend(defaults, settings),
			$slider = $(this),
			$slides = $slider.children(),
			_index = {
				prev	: settings.active==0 ? $slides.length-1 : settings.active-1,
				active	: settings.active,
				next	: settings.active==$slides.length-1 ? 0 : settings.active+1
			},
			_timer = null, //Timeout function
			_switching = false; //True is animating slide
		
		//Set slider css
		$slider.css({
			overflow	: "hidden",
			maxHeight	: $slider.height()
		});
		
		//Set slide css
		$slides.css({
			"float"	: "left",
			position: "relative",
			width	: "100%",
			height	: "100%"
		});
		
		$slider.getActive = function(){
			return _index.active;
		}
		
		//Set active slide
		function _acivateSlide(){
			$slides.removeClass("active");
			$( $slides.get( _index.active ) ).addClass("active");
		}
		_acivateSlide();
		
		function _unblockSlider(){
			_switching = false;
		}
		
		function _blockSlider(){
			_switching = true;
		}
		
		//Slides transition
		function _setPosition(){
			//Update slides
			$slides.prev	= $( $slides.get( _index.prev ) );
			$slides.active	= $( $slides.get( _index.active ) );
			$slides.next	= $( $slides.get( _index.next ) );
			
			//Relocate prev slide
			$slides.prev.css({
				top	: - _index.prev * 100 + "%",
				left: "-100%"
			});
			
			//Relocate active slide
			$slides.active.css({
				top	: - _index.active * 100 + "%",
				left: "0%"
			});
			
			//Relocate next slide
			$slides.next.css({
				top	: - _index.next * 100 + "%",
				left: "100%"
			});
		}
		_setPosition();
		
		//Next slide
		$slider.next = function(){
			
			if( _switching===false ){
				
				if( settings.auto ){
					_timer.add(400); //Add extra time to slide animation
				}
				
				_blockSlider();
				
				//Update index
				_updateIndex('next');
				
				//Switch class
				_acivateSlide();
				
				var oncomplete = function(){
					//Relocate slides
					_setPosition();
				
					_unblockSlider();
				};
				
				//Perform animation
				$slides.active.animate({
					left : "-100%"
				}, oncomplete);
				
				$slides.next.animate({
					left : "0%"
				});
				
				
			}
		};
		
		//Previous slide
		$slider.prev = function(){
			if( _switching===false ){
				
				if( settings.auto ){
					_timer.add(400); //Add extra time to slide animation
				}
				
				_blockSlider();
				
				//Update index
				_updateIndex('prev');
				
				//Switch class
				_acivateSlide();
				
				var oncomplete = function(){
					//Relocate slides
					_setPosition();
				
					_unblockSlider();
				};
				
				//Perform animation
				$slides.prev.animate({
					left : "0%"
				}, oncomplete);
				
				$slides.active.animate({
					left : "100%"
				});
				
			}
			
		};
		
		//Update prev, active and next slide index
		function _updateIndex(action){
			switch(action){
				case 'prev':
					_index.active	= _index.active==0 ? $slides.length-1 : _index.active-1;
					_index.prev		= _index.active==0 ? $slides.length-1 : _index.active-1;
					_index.next		= _index.active==$slides.length-1 ? 0 : _index.active+1;
					break;
				case 'next':
					_index.active	= _index.active==$slides.length-1 ? 0 : _index.active+1;
					_index.prev		= _index.active==0 ? $slides.length-1 : _index.active-1;
					_index.next		= _index.active==$slides.length-1 ? 0 : _index.active+1;
					break;
			}
		}
		
		//Slider time controls
		function Timer(fn, delay){
			var startTime,
				self = this,
				timer,
				_fn = fn,
				_args = arguments,
				_delay = delay;
			
			this.running = false;
			
			this.onpause	= function(){};
			this.onresume	= function(){};
			
			this.cancel = function(){
				this.running = false;
		        clearTimeout(timer);
		    }
		
		    this.pause = function(){
		    	if( this.running ){
		    		delay -= new Date().getTime() - startTime;
		    		console.log(delay)
			    	this.cancel();
			    	
			    	this.onpause();
			    }
		    }
		
		    this.resume = function(){
		    	if( !this.running ){
		    		this.running = true;
		    		startTime = new Date().getTime();
		    		
		    		timer = setTimeout(function(){
		    			_fn.apply(self, Array.prototype.slice.call(_args, 2, _args.length)); //Execute function with initial arguments, removing (fn & delay)
		    		}, delay);
		    		
		    		this.onresume();
		    	}
		    }
		    
		    this.reset = function(){
		    	this.cancel();
	    		this.running = true;
	    		delay = _delay;
	    		timer = setTimeout(function(){
	    			_fn.apply(self, Array.prototype.slice.call(_args, 2, _args.length)); //Execute function with initial arguments, removing (fn & delay)
	    		}, _delay);
		    }
		    
		    this.add = function(extraDelay){
		    	this.pause();
		    	delay += extraDelay;
		    	console.log("a")
		    	//this.resume();
		    };
		    
		    this.resume();
		}
		
		//Creates slider timer to switch slides
		function _setTimer(running){
			if( _timer===null || running ){
				
				//Initialize timeout
				_timer = new Timer(function(){
					//Go to next slide
					$slider.next();
					//Reset this timeout
					_timer.reset();
					
				}, settings.delay);
				
				//Force stop slide
				_timer.onpause = function(){
					//Stop animation
					$slides.active.add( $slides.prev ).add( $slides.next ).stop();
					//Block slide
					_unblockSlider();
					//Reset indexs
					_updateIndex('prev');
				}
				
				//Force continue slide
				_timer.onresume = function(){
					//Coninue animation with reseted values
					$slider.next();
				}
			}
		}
		//Initialize on start if settings.auto === true
		if( settings.auto ){
			_setTimer();
		}
		
		//Play slide
		$slider.play = function(){
			if( _timer===null ){
				_setTimer();
			}else{
				_timer.resume();
			}
		}
		
		//Stop auto slide
		$slider.stop = function(){
			if( _timer!==null ){
				_timer.pause();
			}
		}
		
		//Slider touch controls
		if( settings.touch ){
			
			var _touch = null;
			
			//Start drag
			$slider.on('touchstart mousedown', function(e){
				e.preventDefault();
				if( _touch===null ){
					
					//Enable touch event
					_touch = {
						touching : true,
						startX	 : null,
						startY	 : null
					};
					
					switch( e.type ){
						case 'mousedown':
							_touch.startX = e.clientX;
							_touch.startY = e.clientY;
							break;
						case 'touchstart':
							_touch.startX = e.touches[0].clientX;
							_touch.startY = e.touches[0].clientY;
							break;
					}
					
					//Disable auto slide
					$slider.stop();
					
				}
			});
			
			//End drag
			$slider.on('touchend mouseup', function(e){
				e.preventDefault();
				if( _touch!==null ){
					
					//Disable touch event
					_touch = null;
					
					//Enable auto slide
					if( settings.auto ){
						$slider.play();
					}
					
				}
			});
			
		}
		
		
		//Responsive handlers
		function _update(){
			
		}
		$window.resize(_update);
		_update();
		
		return $slider;
	};
})(jQuery);
