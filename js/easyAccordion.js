(function($) {
	var $window = $(window);

	$.fn.easyAccordion = function(settings){
		
		var defaults = {
				opened		: false,//No section opened [int || array]
				maxOpened	: 1,	//Max section opened at same time
				chevronUp	: "DEFAULT",
				chevronDown	: "DEFAULT"
			},
			settings = $.extend(defaults, settings),
			$ac = $(this),
			$titles = $ac.children(":even"),
			$sections = $ac.children(":odd"),
			_openedQueue = [],
			defaultChevronUp = "-",
			defaultChevronDown = "+",
			_linkedAccordions = [];
		console.log($titles)
		//Link another accordion to work together
		$ac.linkAccordion = function($newAccordion, newMaxOpened){
			_linkedAccordions.push( $newAccordion );
			
			//Link this accorthion to the new accordion
			if( newMaxOpened===undefined ){
				
				$newAccordion.linkAccordion($ac, settings.maxOpened);
				
				resetLinkedAccordions();
				
			}else{
				
				settings.maxOpened = newMaxOpened;
				
			}
			
		};
		
		//Close opened sections in other accordions if exceed settings.maxOpened
		function resetLinkedAccordions(){
			//Hide if reached max opened at once(linked accordion)
			for(var i=0; i<_linkedAccordions.length; i++){
				
				//Get other accordions vars
				var $otherAc = _linkedAccordions[i],
					otherOpened = $otherAc.getOpened(),
					newMax = otherOpened.length + _openedQueue.length;
				
				//Check if have to close some section
				while( newMax>settings.maxOpened ){
					
					//Close first section of the queue
					$otherAc.close( otherOpened[0] );
					
					//Update other accordion vars
					otherOpened = $otherAc.getOpened();
					newMax = otherOpened.length + _openedQueue.length;
					
				}
			}
		}
		
		//Return if section is opened
		$ac.isOpened = function(sectionIndex){
			return $( $sections.get( sectionIndex ) ).is(":visible");
		};
		
		//Get opened sections index
		$ac.getOpened = function(){
			return _openedQueue;
		};
		
		//Open section
		$ac.open = function(sectionIndex){
			if( !$ac.isOpened(sectionIndex) ){
				var $section = $( $sections.get( sectionIndex ) );
				
				$section.slideDown();
					
				//Hide if reached max opened at once(this accordion)
				if( _openedQueue.length>=settings.maxOpened ){
					//Close section
					$ac.close( _openedQueue[0] );
				}
				
				//Put index section to array
				_openedQueue.push( sectionIndex );
				
				resetLinkedAccordions();
				
			}
			
			//Return accordion to concat methods
			return $ac;
		};
		
		//Close section
		$ac.close = function(sectionIndex){
			//console.log("#"+sectionIndex+" - "+$ac.isOpened(sectionIndex))
			if( $ac.isOpened(sectionIndex) ){
				var $section = $( $sections.get( sectionIndex ) );
				
				$section.slideUp();
				
				//Remove index from queue
				_openedQueue.splice( _openedQueue.indexOf(sectionIndex), 1 );
			}
			
			//Return accordion to concat methods
			return $ac;
		};
		
		//Close all opened sections
		$ac.closeAll = function(){
			
			for(var i=_openedQueue.length-1; i>=0; i--){
				$ac.close( _openedQueue[i] );
			}
			
			//Return accordion to concat methods
			return $ac;
		}
		
		//Toggle section
		$ac.toggle = function(sectionIndex){			
			var $section = $( $sections.get( sectionIndex ) );
			//Is opened, then close
			if( $ac.isOpened(sectionIndex) ){
				
				$ac.close(sectionIndex);
				
			//Is closed, then open
			}else{
				
				$ac.open(sectionIndex);
				
			}
			
			//Return accordion to concat methods
			return $ac;
		};
		
		//Bind titles click
		$titles.click(function(){
			var $this = $(this),
				index = $titles.index( this );
			
			$ac.toggle( index );

		});
		
		//Hide sections
		$sections.hide();
		
		//Initialize with section opened
		if( settings.opened!==false ){
			//If param is not an Array
			if( settings.opened.constructor !== Array ){
				settings.opened = [settings.opened];
			}
			//Open settings sections
			for(var i=0; i<settings.opened.length && i<settings.maxOpened; i++){
				$ac.open( settings.opened[i] );
			}
		}
		
		//Return accordion to concat methods
		return $ac;
	};
})(jQuery);
