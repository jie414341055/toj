
function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function Submit() {
	var aform = document.createElement('form');
	aform.method = 'post';
	aform.action='/ArrangeContest';
	var a=document.createElement('input');
	a.type='hidden';
	a.name='title';
	a.value = document.getElementById('ctitle').value;

	var b=document.createElement('input');
	b.type='hidden';
	b.name='desc';
	b.value = document.getElementById('cdesc').value;

	var c=document.createElement('input');
	c.type='hidden';
	c.name='sttime';
	c.value = document.getElementById('csttime').value;
	var d=document.createElement('input');
	d.type='hidden';
	d.name='edtime';
	d.value = document.getElementById('cedtime').value;

	var e=document.createElement('input');
	e.type='hidden';
	e.name='passwd';
	e.value = document.getElementById('cpasswd').value;

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
