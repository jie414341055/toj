var net = require('net');

var HOST = '127.0.0.1';
var PORT = 6969;
var code = "hdu 2\n__SOURCE-CODE-BEGIN-LABLE__\n#include<cstring>\n#include<cstdio>\nusing namespace std;\nint main() { int a, b;\n int c = a + b;\n return 0; }\n__SOURCE-CODE-END-LABLE__\nx 1 x 12 x 1002 x 0 x 1000 x 1000 x 65536 x 0 1002 1002 1002 1002\n";

net.createServer(function(sock) {

	console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

	sock.on('data', function(data) {
		console.log('DATA ' + sock.remoteAddress + ': ' + data);
		sock.write(code);
		//sock.write('hdu 2 ' + data + '"');
	});

	sock.on('close', function(data) {
		console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
	});

}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);
