var net = require('net');

var HOST = '127.0.0.1';
var PORT = 6969;
//var code = "hdu 2\n__SOURCE-CODE-BEGIN-LABLE__\n#include<cstring>\n#include<cstdio>\nusing namespace std;\nint main() { int a, b;\n int c = a + b;\n return 0; }\n__SOURCE-CODE-END-LABLE__\nx 1 x 12 x 1002 x 0 x 1000 x 1000 x 65536 x 0 1002 1002 1002 1002\n";
var prefix = "hdu 2\n__SOURCE-CODE-BEGIN-LABLE__\n";
var suffix = "\n__SOURCE-CODE-END-LABLE__\nX 1 X 12 X 1002 X 0 X 1000 X 1000 X 65536 X 0 1002 1002 1002 1002\n";

var server1 = net.createServer();
var server2 = net.createServer();

server1.listen(PORT, HOST);
server2.listen(PORT + 1, HOST);

server2.on('connection', function(sock2) {
	server1.on('connection', function(sock1) {
		sock1.on('data', function(data1) {
			sock2.write(prefix + data1 + suffix);
		});
		sock2.on('data', function(data2) {
			console.log(data2.toString());
		});
	});
});

/*
server1.on('connection', function(sock1) {
	sock1.on('data', function(data1) {
		console.log('received from 6969: ' + data1);
		server2.on('connection', function(sock2) {
			sock2.write(prefix + data1 + suffix);
		});
	});
});


net.createServer(function(sock) {
	
	console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

	sock.on('data', function(data) {
		net.createServer(function(sock2) {
			console.log('CONNECTED: ' + sock2.remoteAddress + ':' + sock2.remotePort);
			sock2.on('data2', function(data2) {
				sock2.write(data + suffix);
			});
		}).listen(PORT + 1, HOST);

		console.log('DATA ' + sock.remoteAddress + ': ' + data);
	});

	sock.on('close', function(data) {
		console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
	});

}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);
*/
