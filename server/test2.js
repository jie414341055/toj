var http = require('http');

var url = require('url').parse('http://contests.acmicpc.info/contests.json');
var iconv = require('iconv-lite');

var BufferHelper = require('bufferhelper');
var select = require('soupselect');

var htmlparser = require('htmlparser');

http.get(url, function(res) {
	var bufferHelper = new BufferHelper();
	res.on('data', function(chunk) {
		bufferHelper.concat(chunk);
	});
	res.on('end', function() {
		var tex=iconv.decode(bufferHelper.toBuffer(),'GBK');
		var handler = new htmlparser.DefaultHandler(function(err, dom) {
			if (err) {

			} else {
				console.log(dom);
				//var titles = select(dom, '');
				console.log(JSON.stringify(dom));
			}
		});
		var parser = new htmlparser.Parser(handler);
		parser.parseComplete(tex);
	});
});
