(function( $ ){
	var $window = $(window);
	var windowHeight = $window.height();

	$window.resize(function () {
		windowHeight = $window.height();
	});

	$.fn.easyParallax = function(settings) {
		
		var defaults = {
			offsetX: "50%",
			speedFactor: 0.12,
			outerHeight: true,
			offsetY: 0,
			imageHeight : 0
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
				if(settings.outerHeight){
					var height = $element.outerHeight(true);
				}else{
					var height = $element.height();
				}
				
				//console.log(top + height < pos || top > pos + windowHeight)
				
				//Check if totally above or totally below viewport
				if (top + height < pos || top > pos + windowHeight) {
					return;
				}
				
				var scroll =  Math.round((top - pos - (windowHeight/2)) * settings.speedFactor + settings.offsetY);
				
				if( scroll>0 )
					scroll=0;
				
				console.log( scroll )
				
				if( scroll < -( settings.imageHeight % height )  )
					scroll = -( settings.imageHeight % height ) ;
				

				//$this.css('background-position', xpos + " " + Math.round((firstTop - pos) * speedFactor) + "px");
				$this.css('backgroundPosition', settings.offsetX + " " + scroll + "px");
			});
		}		

		$window.bind('scroll', update).resize(update);
		update();
		
		return $this;
	};
})(jQuery);