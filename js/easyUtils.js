function checkAll(containerId){
	$("#"+containerId).find("input[type=checkbox]").prop('checked', true);
	$('#checkAll').show();
	$('#uncheckAll').hide();
}
function uncheckAll(containerId){
	$("#"+containerId).find("input[type=checkbox]").prop('checked', false);
	$('#checkAll').hide();
	$('#uncheckAll').show();	
}

/* ************************************ */
/*	Resize bootstrap pagination lists	*/
/* ************************************ */
function resizePagination(max){
	//Resize and sort the pagination bar
	var $pageButtons=$("ul.pagination li").not(":first, :last"),
		maxResults=max,
		middlePos=$pageButtons.index("li.disabled a[href=#]");
	if($pageButtons.length>maxResults+1){
		$pageButtons.each(function(index){
			if(this.className=="disabled")
				middlePos=index;
		});
		//Remove left elems
		var extraPos=middlePos==$pageButtons.length-1 ? 1 : 0,
			i=middlePos-1;
		while(i>=0){
			if(i<middlePos-(maxResults/2)-1-extraPos)
				$($pageButtons[i]).remove();
			i--;
		}
		//Remove right elems
		var extraPos=middlePos==0 ? middlePos+1 : 0, 
			i=middlePos+1;
		while(i<=$pageButtons.length){
			if(i>((maxResults/2)+1)+middlePos+extraPos)
				$($pageButtons[i]).remove();
			i++;
		}
		//Update buttons
		$pageButtons=$("ul.pagination li").not(":first, :last");
		//Add extra fields
		if(middlePos>maxResults/2)
			$($pageButtons[0]).find("a").html("...");
		if(middlePos<$pageButtons.length-(maxResults/2))
			$($pageButtons[$pageButtons.length-1]).find("a").html("...");
	}
}

/* ************************************ */
/*	Cut text and adds '...' to the end	*/
/* ************************************ */
(function($) {
	$.fn.cutText=function(maxChars){
		//console.log(parseInt(maxChars))
		var extraChars=0,
			text=$(this).html(),
			length=i=text.length,
			adding=false,
			maxChars=parseInt(maxChars) || 100;
		//console.log(maxChars)
		while(i--){
			if(!adding && text[i]==">"){
				adding=true;
				extraChars++;
			}else if(adding && text[i]=="<"){
				adding=false;
				extraChars++;
			}else if(adding) extraChars++;
		}
		//console.log(extraChars)
		while(text[maxChars+extraChars]!=" " && (maxChars+extraChars)<length && extraChars>0){
			extraChars++;
		}
		if(length>maxChars) $(this).html($(this).html().substr(0,maxChars+(extraChars!=length?extraChars:0))+"...");
	};
}(jQuery));

function openSuccessWindow(){
	if(typeof cachedModal.modal!="undefined") cachedModal.modal.modal("hide");
	$(document).ready(function(){$("#launchSuccessWindow").click();});
}
function openErrorWindow(msg){
	if(msg!=''){
		$('#errorMSG').html(msg);
	}else{
		$('#errorMSG').html('No se pudo realizar la operación. Por favor, vuelva a intentarlo pasado unos minutos');
	}
	if(typeof cachedModal.modal!="undefined") cachedModal.modal.modal("hide");
	setTimeout(function(){
		$(document).ready(function(){$("#launchErrorWindow").click();});
	},600);
}

function toggleSons(id){
	if($("#"+id).children().length>0)
		$("#"+id).slideToggle();
}
function toggleFather(id,level){
	level--;
	var handler=$("#"+id).parent();
	if(level==1) handler.toggle();
	if(level==2) {
		handler.show();
		handler.parent().toggle();
	}
}

function resizeDataTables(){
	$("#data-content table").find(".cutText").each(function(){
		var maxWidth=$(this).data("width")||100;
		//console.log($(this).data())
		$(this).css("max-width",maxWidth+"px").addClass("cutText");
		var $parent=$(this).parent();
		while($parent[0].nodeName!=="TD")
			$parent=$parent.parent();
		$parent.css("width",maxWidth+"px");
		if(isOverflowed(this))
			$(this).tooltipster({content:this.innerHTML});
	});
}

function isOverflowed(el){
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
}

/* ************************************ */
/*	Open page inside bootstrap modal	*/
/* ************************************ */
var cachedModal={functions:[]};
function openIframeWindow(page,loadScritps){
	if(page!=cachedModal.page){
		$("#iframeWindow").remove();
		var $modal=$('<div class="modal fade" id="iframeWindow"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" style="border-bottom:none"><button type="button" class="close" data-dismiss="modal" aria-hidden="true"><span class="glyphicon glyphicon-remove pull-right"></span></button></div><div class="modal-body"><iframe src="" style="background:white"></iframe></div></div></div></div>');
		$("body").append($modal);
		var $iframe=$modal.find("div.modal-dialog div.modal-content div.modal-body iframe").attr("src",base_url+page+"&action=noHeader"),
			$window=$modal.find("div.modal-dialog");
		$iframe.load(function() {
			cachedModal.page=page;
			cachedModal.modal=$modal;
		    var height=$iframe.contents().height(),
		    	width=$iframe.contents().width(),
		    	$content=$modal.find("div.modal-dialog div.modal-content div.modal-body");
		    $window.css({
		    	height:50,
		    	width:900
		    });
			$content.html($iframe.contents().find("body").html()).css("padding","10px 30px").find("a#close").remove();
			$iframe.remove();
			$modal.modal();
		});	
	}else
		cachedModal.modal.modal("toggle");
}


/* **************************************** */
/*	Reload page sending get or post data	*/
/* **************************************** */
function reloadGet(jsonParams){
	var url=window.location.href,
		params="";
	url=url.replace(/&.+$/,"");
	for(var key in jsonParams){
		params+="&"+key+"="+jsonParams[key];
	}
	window.location.href=url+params;
}
function reloadPost(jsonParams){
	var $form=$("<form action='' method='POST'></form>");
	for(var key in jsonParams){
		$form.append("<input type='hidden' name='"+key+"' id='"+key+"' value='"+jsonParams[key]+"' />");
	}
	console.log($form.html());
	$("body").append($form);
	$form.submit();
}
