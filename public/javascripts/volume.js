function getURLParameter(name) {
	  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function SearchProb() {
	var aform = document.createElement('form');
	aform.method = 'post';
	aform.action='/ProblemSearch';
	var a=document.createElement('input');
	a.type='hidden';
	a.name='info';
	a.value = document.getElementById('pid_or_title').value;
	if(!a.value) return ;
	var b=document.createElement('input');
	b.type='hidden';
	b.name='oj';
	b.value = getURLParameter('oj');
	aform.appendChild(a);
	aform.appendChild(b);
	document.body.appendChild(aform);
	aform.submit();
}
$(document).ready(function(){
	$('#ojs').change(function() {
		var val = $("#ojs option:selected").text();
		//alert(val);
		window.location.replace("/Problems?oj="+val);

	});
});
