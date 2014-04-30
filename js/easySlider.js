(function($) {
	var $window = $(window);

	$.fn.easySlider = function(settings){
		
		var defaults = {
				active	: 0,
				auto	: true	//Autoslide
			},
			settings = $.extend(defaults, settings),
			$slider = $(this),
			$slides = $slider.children(),
			_index = {
				prev	: settings.active==0 ? $slides.length-1 : settings.active-1,
				active	: settings.active,
				next	: settings.active==$slides.length-1 ? 0 : settings.active+1
			};
		
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
		
		//Set active
		$( $slides.get( _index.active ) ).addClass("active");
		
		//Next slide
		$slider.next = function(){
			
			_updateIndex();
		};
		
		//Previous slide
		$slider.prev = function(){
			
			_updateIndex();
		};
		
		function _updateIndex(action){
			switch(action){
				case 'prev':
					break;
				case 'next':
					break;
			}
		}

		function update(){
			
		}


		$window.resize(update);
		update();
		
		return $slider;
	};
})(jQuery);
