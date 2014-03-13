function SearchProb() {
	var aform = document.createElement('form');
	aform.method = 'post';
	aform.action='/ProblemSearch';
	var a=document.createElement('input');
	a.type='hidden';
	a.name='info';
	a.value = document.getElementById('pid_or_title').value;
	aform.appendChild(a);
	document.body.appendChild(aform);
	aform.submit();
}
/*
   (function(){
   var $backToTopEle = $('.toTop'), $backToTopFun = function() {
   alert('fuck');
   var st = $(document).scrollTop(), winh = $(window).height();
   (st > 200) ? $backToTopEle.fadeIn('slow') : $backToTopEle.fadeOut('slow');

   if (!window.XMLHttpRequest) {
   $backToTopEle.css("top", st + winh - 166);
   }
   };
   $('.toTop').click(function() {
   $("html, body").animate({ scrollTop: 0 }, 1200);
   })
   $backToTopEle.hide();
   $backToTopFun();
   $(window).bind("scroll", $backToTopFun);
   $('#catalogWord').click(function(){
   $("#catalog").slideToggle(600);
   })
   })();
 */
