var mongodb = require('./db');

function Status(stat) {
	this.runid = stat.runid;
	this.subtime = stat.subtime;
	this.result = stat.result;
	this.pid = stat.pid;
	this.runtime = stat.runtime;
	this.usetime = stat.usetime;
	this.usememory = stat.usememory;
	this.codelen = stat.codelen;
	this.lang = stat.lang;
	this.username = stat.username;
};

module.exports = Status;

Status.get = function get(RUNID, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Status', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}

			RUNID = parseInt(RUNID);
			collection.findOne({runid:RUNID}, function(err, doc) {
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
			collection.find().sort({RUNID:1}).limit(20).skip((pageID - 1) * 20).toArray(function(err, docs) {
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

