var net = require('net');

var HOST = '127.0.0.1';
var PORT = 6971;

var server1 = net.createServer();
var server2 = net.createServer();

server1.listen(PORT, HOST);
server2.listen(PORT + 1, HOST);

server2.on('connection', function(sock2) {
	server1.on('connection', function(sock1) {
		sock1.on('data', function(data1) {
			sock2.write(data1);
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
