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
			_switching = false, //True is animating slide
			_extraDelay = 0; //Add extra time to the next _timer execution
		
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
		//Delay prevents switching fast if user toggles next or prev action
		$slider.next = function(delay){
			if( _switching===false ){
				_blockSlider();
				
				//Add extra delay to timeout function
				_extraDelay = delay || settings.delay;
				
				//Update index
				_updateIndex('next');
				
				//Switch class
				_acivateSlide();
				
				//Perform animation
				$slides.active.add( $slides.next ).animate({
					left : "-=100%"
				}, function(){
					
					//Relocate slides
					_setPosition();
				
					_unblockSlider();
					
				});
				
			}
		};
		
		//Previous slide
		//Delay prevents switching fast if user toggles next or prev action
		$slider.prev = function(delay){
			if( _switching===false ){
				_blockSlider();
				
				//Add extra delay to timeout function
				_extraDelay = delay || settings.delay;
				
				//Update index
				_updateIndex('prev');
				
				//Switch class
				_acivateSlide();
				
				//Perform animation
				$slides.active.add( $slides.prev ).animate({
					left : "+=100%"
				}, function(){
					
					//Relocate slides
					_setPosition();
				
					_unblockSlider();
					
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
			var complete = false,
				running = true,
				startTime = new Date().getTime(),
				timerId = setTimeout(fn, delay),
				_fn = fn,
				_delay = delay;
			
		    function _timeDiff(date1, date2) {
		        return date2 ? date2 - date1 : new Date().getTime() - date1;
		    }
		
		    this.cancel = function(){
		    	running = false;
		    	complete = false;
		        clearTimeout(timerId);
		    }
		
		    this.pause = function(){
		    	if( !complete && running ){
			    	this.cancel();
			    	totalTimeRun = _timeDiff(startTime);
			        complete = totalTimeRun >= delay;
			    }
		    }
		
		    this.resume = function(){
		    	if( !complete && !running ){
		    		running = true;
		    		ident = complete ? -1 : setTimeout(fn, delay - totalTimeRun);
		    	}
		    }
		    
		    this.reset = function(){
		    	this.cancel();
	    		complete = false;
	    		running = true;
	    		startTime = new Date().getTime();
	    		timerId = setTimeout(_fn, _delay);
		    }
		}//var a = new Timer(function(){console.log("complete");}, 2000);
		
		function _setTimer(running){
			if( _timer===null || running ){
				console.log(_timer)
				_timer = setTimeout(function(){
					
					$slider.next(1);
					
					var delay = _extraDelay;
					
					_extraDelay = 0;
					
					return setTimeout(function(){
						_setTimer( true );
					}, settings.delay + delay);
					
				}, settings.delay + _extraDelay);
			}
		}
		if( settings.auto ){
			_setTimer();
		}
		
		//Play slide
		$slider.play = function(){
			if( _timer===null ){
				_setTimer();
			}
		}
		
		//Stop auto slide
		$slider.stop = function(){
			console.log(_timer)
			if( _timer!==null ){
				clearTimeout(_timer);
				_timer = null;
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
					
					console.log( _touch );
					
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
