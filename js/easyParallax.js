(function( $ ){
	var $window = $(window);
	var windowHeight = $window.height();

	$window.resize(function () {
		windowHeight = $window.height();
	});

	$.fn.easyParallax = function(settings) {
		
		var defaults = {
			offsetX: "50%",
			offsetY: 0,
			speedFactor: 0.12,
			maxHeight : false
       };
       
       var settings = $.extend(defaults, settings);
       
       var $this = $(this);
		

		//get the starting position of each element to have parallax applied to it		
		$this.each(function(){
		    firstTop = $this.offset().top;
		});
		

		// function to be called whenever the window is scrolled or resized
		function update(){
			var pos = $window.scrollTop();				

			$this.each(function(){
				var $element = $(this);
				var top = $element.offset().top;
				var height = $element.height();
				var maxScroll = null;
				
				var scroll =  Math.round((top - pos - (windowHeight/2)) * settings.speedFactor + settings.offsetY);
				
				//Only check if totally avove the image if maxHeight===false
				if( settings.maxHeight!==false ){
				
					//Check if totally above or totally below viewport
					if (top + height < pos || top > pos + windowHeight) {
						return;
					}
					
					//Above the image
					if( scroll>0 )
						scroll=0;
					
					/*
					console.log( settings.maxHeight )
					console.log( height )
					console.log( -(scroll + (scroll - settings.offsetY)) > settings.maxHeight )
					console.log( scroll + (scroll - settings.offsetY) )
					console.log( "--------" )
					*/
					
					//Below the image
					if( -(scroll + (scroll - settings.offsetY)) > settings.maxHeight ){
						
						if( maxScroll===null )
							maxScroll = height;
						
						scroll = maxScroll;
						
					}
					
				}

				$this.css('backgroundPosition', settings.offsetX + " " + scroll + "px");
			});
		}		

		$window.bind('scroll', update).resize(update);
		update();
		
		return $this;
	};
})(jQuery);