(function($) {
	var $window = $(window);

	$.fn.easySlider = function(settings){
		
		var defaults = {
				active	: 0, //First slide to show
				auto	: true,	//Autoslide
				delay	: 2000, //Transition timeout
				touch	: true,
				timeout : 400 //Animation time
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
			_switching = false, //True if animating slide
			_currentAnimation;
		
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
			console.log(_index)
		}
		_setPosition();
		
		function _onAnimationComplete(){
			//Relocate slides
			_setPosition();
		
			_unblockSlider();
			
			if( settings.auto ){
				_timer.reset();
			}
		};
		
		//Makes slides moves
		function _performAnimation(action, speed){
			
			var activeLeft	= "+=0px",
				prevLeft	= "+=0px",
				nextLeft	= "+=0px";
			
			_blockSlider();
			
			switch( action ){
				case 'prev':
					
					//Update index
					_updateIndex('prev');
					
					prevLeft = "0%";
					
					activeLeft = "100%";
					
					break;
				case 'next':
					
					//Update index
					_updateIndex('next');
					
					activeLeft = "-100%";
					
					nextLeft = "0%";
					
					break;
				case 'restore':
					
					prevLeft = "-100%";
					
					activeLeft =  "0%";
					
					nextLeft = "100%";
					
					break;
			}
			
			switch( speed ){
				case 'slow':
					speed = settings.timeout * 2;
					break;
				case 'fast':
					speed = settings.timeout / 4;
					break;
				default:
					speed = settings.timeout;
			}
			
			$slides.prev.animate({
				left : prevLeft
			}, speed);
			
			$slides.active.animate({
				left : activeLeft
			}, speed);
			
			$slides.next.animate({
				left : nextLeft
			}, speed);
			
			_currentAnimation = new Timer(_onAnimationComplete, settings.timeout+1);
			
			//Switch class
			_acivateSlide();
			
			
		}
		function _cancelAnimation(){
			if( _currentAnimation!==undefined ){
				_currentAnimation.cancel();
			}
			//Stop animation
			$slides.active.add( $slides.prev ).add( $slides.next ).stop();
			//Block slide
			_unblockSlider();
			//Switch class
			_acivateSlide();
		}
		
		//Next slide
		//Triggered by internal events
		function _next(){
			if( _switching===false ){
				
				//Perform animation
				_performAnimation("next");
				
			}
		}
		
		//Previous slide
		//Triggered by internal events
		function _prev(){
			if( _switching===false ){
				
				//Perform animation
				_performAnimation("prev");
				
			}
		}
		
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
		    	this.resume();
		    };
		    
		    this.resume();
		}
		
		//Creates slider timer to switch slides
		function _setTimer(running){
			if( _timer===null || running ){
				
				//Initialize timeout
				_timer = new Timer(function(){
					//Go to next slide
					_next();
					//Reset this timeout
					_timer.reset();
					
				}, settings.delay);
				
				//Force stop slide
				_timer.onpause = _cancelAnimation;
				
				//Force continue slide
				_timer.onresume = function(){
					
					_unblockSlider();
					
					//Coninue animation
					_next();
				}
			}
		}
		//Initialize on start if settings.auto === true
		if( settings.auto ){
			_setTimer();
		}
		
		//Slider touch controls
		if( settings.touch ){
			
			var _touch = null;
			
			//Start drag
			$slider.on('touchstart mousedown', function(e){
				e.preventDefault();
				if( _touch===null && _switching===false ){
					
					//Enable touch event
					_touch = {
						touching : true,
						coords	 : [],
						startX	 : null,
						startY	 : null
					};
					
					switch( e.type ){
						case 'mousedown':
							_touch.startX = e.clientX;
							_touch.startY = e.clientY;
							break;
						case 'touchstart':
						console.log(e.originalEvent)
							_touch.startX = e.originalEvent.targetTouches[0].clientX;
							_touch.startY = e.originalEvent.targetTouches[0].clientY;
							break;
					}
					
					_touch.coords[0] = {
						x : _touch.startX,
						y : _touch.startY
					}
					
					//Disable auto slide
					$slider.stop();
					
				}
			});
			
			//User dragging
			$slider.on('touchmove mousemove', function(e){
				e.preventDefault();
				if( _touch!==null ){
					
					switch( e.type ){
						case 'mousemove':
							_touch.coords.push({
								x : e.clientX,
								y : e.clientY
							});
							break;
						case 'touchmove':
							_touch.coords.push({
								x : e.originalEvent.targetTouches[0].clientX,
								y : e.originalEvent.targetTouches[0].clientY
							});
							break;
					}
					
					//Gest displacement relative to the last known position
					var distX = _touch.coords[_touch.coords.length-2].x - _touch.coords[_touch.coords.length-1].x;
					//var distY = _touch.coords[_touch.coords.length-2].y - _touch.coords[_touch.coords.length-1].y;
					
					/*
					console.log("startX: "+_touch.coords[0].x+", thisX: "+_touch.coords[_touch.coords.length-1].x);
					console.log("displacementX: "+distX+", displacementY: "+distY);
					console.log("startY: "+_touch.coords[0].y+", thisY: "+_touch.coords[_touch.coords.length-1].y);
					console.log("-------------------------");
					*/
					
					$slider.stop();
					
					$slides.active.add( $slides.prev ).add( $slides.next ).animate({
						left : "-="+distX+"px"
					}, 1);
					
				}
				
			});
			
			//End drag
			$slider.on('touchend mouseup', function(e){
				e.preventDefault();
				if( _touch!==null ){
					
					//Gest displacement relative to the last known position
					var distX	= _touch.startX - _touch.coords[_touch.coords.length-1].x,
						sliderW	= $slider.width();
					//var distY	= _touch.startY - _touch.coords[_touch.coords.length-1].y;
						
					
					//If displacement is bigger than 1/4 of the slider width
					if( Math.abs(distX) > sliderW/4 ){
						
						//Perform animation
						if( distX<0 ){
							_performAnimation("prev", "fast");
						}else{
							_performAnimation("next", "fast");
						}
						
					}else{
						//Restore position and continue sliding if auto
						_performAnimation("restore");
					}
					
					
					
					//Disable touch event
					_touch = null;
					
				}
			});
			
			$slider.on("mouseleave", function(e){
				e.preventDefault();
				if( _touch!==null ){
					//Check if exist touch events
					if( 'ontouchstart' in window || navigator.msMaxTouchPoints ){
						$slider.trigger('touchend');
					}else{
						$slider.trigger('mouseup');
					}
					
				}
			});
			
		}
		
		
		//Responsive handlers
		function _update(){
			
		}
		$window.resize(_update);
		_update();
		
		
		//Public methods
		//Go to next
		$slider.next = _next;
		//Go to prev
		$slider.prev = _prev;
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
		
		return $slider;
	};
})(jQuery);
