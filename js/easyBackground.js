(function($) {
	var $window = $(window);

	$.fn.easyBackground = function(settings){
		
		var defaults = {
				width	: 100,	//Container X size in %
				height	: 100	//Container Y size in %
			},
			settings = $.extend(defaults, settings),
			$this = $(this);
		
		function getAspectRatio(width, height){
			var ratio = width / height;
			return ( Math.abs( ratio - 4 / 3 ) < Math.abs( ratio - 16 / 9 ) ) ? '4:3' : '16:9';
		}

		function update(){
			
			var ww = $window.width(),
				wh = $window.height(),
				nw = ww * settings.width / 100,
				nh = wh * settings.height / 100;
			
			$this.width( nw );
			$this.height( nh );
			$this.css("overflow-x", "hidden");
			
			if( getAspectRatio(ww, wh)!="16:9" )
				$this.css("background-size", "auto 125%");
			else
				$this.css("background-size", "125% auto");
		}


		$window.resize(update);
		update();
		
		return $this;
	};
})(jQuery);
