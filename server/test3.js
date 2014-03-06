var http = require('http');
var iconv = require('iconv-lite');
var url=require('url');

var html = "";
var getURL = url.parse('http://contests.acmicpc.info/contests.json');
var req =http.get(getURL, function (res) {
	res.setEncoding('binary');//or hex
	res.on('data',function (data) {//加载数据,一般会执行多次
		html += data;
	}).on('end', function () {
		var buf=new Buffer(html,'binary');//这一步不可省略
		var str=iconv.decode(buf, 'GBK');//将GBK编码的字符转换成utf8的
		console.log(str);
	})
}).on('error', function(err) {
	console.log("http get error:",err);
});
