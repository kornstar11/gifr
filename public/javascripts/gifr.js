jQuery(document).ready(function(){
	
	var example  = $('.example'),
		moar     = $('.moar'),
		open     = $('.icon-caret-right'),
		close    = $('.icon-remove')
		icon     = $('.moar i');
	
	example.fadeIn(300);
	
	moar.mouseover(function(){
		moar.stop(true, false).animate({left:'0px'}, function(){
			icon.removeClass('icon-caret-right').addClass('icon-github');
		});
	});
	
	moar.mouseout(function(){
		moar.stop(true, false).animate({left:'-195px'}, function(){
			icon.removeClass('icon-github').addClass('icon-caret-right');
		});
	});
		
});