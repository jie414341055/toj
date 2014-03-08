var mongodb = require('./db');

function Status(stat) {
	this.run_ID = stat.run_ID;
	this.vrun_ID = stat.vrun_ID;
	this.oj = stat.oj;
	this.submit_time = stat.submit_time;
	this.result = stat.result;
	this.pid = stat.pid;
	this.time_used = stat.time_used;
	this.mem_used = stat.mem_used;
	this.code_len = stat.code_len;
	this.lang = stat.lang;
	this.username = stat.username;
};

module.exports = Status;

Status.prototype.save = function save(callback) {
	var stat = {
		run_ID:		this.run_ID,
		vrun_ID:	this.vrun_ID,
		oj:		this.oj,
		submit_time:	this.submit_time,
		result:		this.result,
		pid:		this.pid,
	 	time_used:	this.time_used,
		mem_used:	this.mem_used,
		code_len:	this.code_len,
		lang:		this.lang,
		username:	this.username,
	};
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Status', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex({"run_ID":-1},{unique:true});
			collection.insert(stat, {safe:true}, function(err, stat) {
				mongodb.close();
				callback(err, stat);
			});
		});
	});
};



Status.getMaxID = function getMaxID(callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Status', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.find().sort({run_ID:-1}).limit(1).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}
				//now good, fix latter
				docs.forEach(function(doc, index) {
					var pp = new Status(doc);
					if(pp) {
						callback(err, pp.run_ID);
					} else {
						callback(err, 0);
					}
				});
			});
		});
	});
};
				

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
			collection.findOne({run_ID:runid}, function(err, doc) {
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

Status.page = function page(query, pageID, callback) {
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
			collection.find(query).sort({run_ID:-1}).limit(20).skip((pageID - 1) * 20).toArray(function(err, docs) {
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

