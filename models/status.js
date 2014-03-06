var mongodb = require('./db');

function Status(stat) {
	this.Run_ID = stat.Run_ID;
	this.vRun_ID = stat.vRun_ID;
	this.OJ = stat.OJ;
	this.subtime = stat.subtime;
	this.Result = stat.Result;
	this.pid = stat.pid;
	this.use_time = stat.use_time;
	this.use_mem = stat.use_mem;
	this.codelen = stat.codelen;
	this.lang = stat.lang;
	this.username = stat.username;
};

module.exports = Status;

Status.get = function get(runid, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Status', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}

			runid = parseInt(runid);
			collection.findOne({Run_ID:runid}, function(err, doc) {
				mongodb.close();
				if(doc) {
					var stat = new Status(doc);
					callback(err, stat);
				} else {
					callback(err, null);
				}
			});
		});
	});
};

Status.page = function page(pageID, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Status', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			pageID = parseInt(pageID);
			collection.find().sort({runid:-1}).limit(20).skip((pageID - 1) * 20).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}

				var stats = [];
				docs.forEach(function(doc, index) {
					var pp = new Status(doc);
					stats.push(pp);
				});
				callback(null, stats);
			});
		});
	});
};

