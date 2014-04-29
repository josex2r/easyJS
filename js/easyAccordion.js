(function($) {
	var $window = $(window);

	$.fn.easyAccordion = function(settings){
		
		var defaults = {
				opened		: 0,//No section opened
				maxOpened	: 1,	//Max section opened at same time
			},
			settings = $.extend(defaults, settings),
			$ac = $(this),
			$titles = $ac.children(":even"),
			$sections = $ac.children(":odd"),
			_openedQueue = [];
		
		//Hide sections
		$sections.hide();
		
		//Initialize with section opened
		if( settings.opened!==false ){
			toggleSection( settings.opened );
		}
		
		function toggleSection(index){
			//Show section
			$( $sections.get( index ) ).slideToggle();
			//Put section to array
			_openedQueue.push( settings.opened );
		}
		
		//Bind titles click
		$titles.click(function(){
			var $this = $(this),
				index = $titles.index( this );
			
			toggleSection( index );

		});
		
		return $this;
	};
})(jQuery);
