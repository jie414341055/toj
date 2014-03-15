function getURLParameter(name) {
	  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}
function CheckArrange() {
	return false;
}


function Submit() {
	var aform = document.createElement('form');
	aform.method = 'post';
	aform.action='/ArrangeContest';
	var a=document.createElement('input');
	a.type='hidden';
	a.name='title';
	a.value = document.getElementById('inputTitle').value;
	if(a.value == "") {
		var msg = document.getElementById('errmsg')
		msg.className ="alert alert-danger alert dismissable";
		msg.innerHTML="Title can not be empty.";
		setTimeout(function() {
			$("#errmsg").slideUp();
		}, 2000);
		return; 
	}

	var b=document.createElement('input');
	b.type='hidden';
	b.name='desc';
	b.value = document.getElementById('inputDesc').value;

	var c=document.createElement('input');
	c.type='hidden';
	c.name='sttime';
	c.value = document.getElementById('inputSTtime').value;
	var d=document.createElement('input');
	d.type='hidden';
	d.name='edtime';
	d.value = document.getElementById('inputEDtime').value;

	var e=document.createElement('input');
	e.type='hidden';
	e.name='passwd';
	e.value = document.getElementById('inputPasswd').value;

	var f=document.createElement('input');
	f.type='hidden';
	f.name='type';
	f.value = getURLParameter('type');

	var prob=document.createElement('input');
	prob.type='hidden';
	prob.name='prob';

	var x = [];
	for(var id=1001;id<=1011;++id) {
			var tmp={};
			tmp.oj = document.getElementById("oj"+id).value;
			tmp.pid =document.getElementById("pid"+id).value;
			if(tmp.pid=="") break;
			x.push(tmp);
	}
	prob.value = JSON.stringify(x);
	aform.appendChild(a);
	aform.appendChild(b);
	aform.appendChild(c);
	aform.appendChild(d);
	aform.appendChild(e);
	aform.appendChild(f);
	aform.appendChild(prob);
	document.body.appendChild(aform);
	aform.submit();
}
