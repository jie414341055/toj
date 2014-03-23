var mongodb = require('./db');

function Contest_Status(cont) {
	this.cid = cont.cid;
	this.run_ID = cont.run_ID;
	this.username = cont.username;
	this.pid = cont.pid;
	this.nid = cont.nid;
	this.submit_time = cont.submit_time;
	this.lang = cont.lang;
	this.result = cont.result;
	this.time_used = cont.time_used;
	this.mem_used = cont.mem_used;
	this.code_len = cont.code_len;
};
module.exports = Contest_Status;

Contest_Status.prototype.save = function save(callback) {
	var cont_status = {
		cid:		this.cid,
		run_ID:		this.run_ID,
		username:	this.username,
		pid: 		this.pid,
		nid:		this.nid,
		submit_time:	this.submit_time,
		lang:		this.lang,
		result:		this.result,
		time_used:	this.time_used,
		mem_used:	this.mem_used,
		code_len:	this.code_len,
	};
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Contest_Status', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex({cid:-1, run_ID:-1}, {unique: true});
			collection.insert(cont_status, {safe: true}, function(err, cont_status) {
				mongodb.close();
				callback(err, cont_status);
			});
		});
	});
};

Contest_Status.get = function get(query, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Contest_Status', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne(query, function(err, doc){
				mongodb.close();
				if(doc) {
					var cont_status = new Contest_Status(doc);
					callback(err, cont_status);
				} else {
					callback(err, null);
				}
			});
		});
	});
};
Contest_Status.page = function page(query, pageID, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// read Contest_Status collection
		db.collection('Contest_Status', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			pageID = parseInt(pageID);
			collection.find(query).sort({run_ID:-1}).limit(15).skip((pageID - 1) * 15).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}

				var cont_status = [];
				docs.forEach(function(doc, index) {
					var cc = new Contest_Status(doc);
					cont_status.push(cc);
				});
				callback(null, cont_status);
			});
		});
	});
};

Contest_Status.getCount = function getCount(query, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Contest_Status', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.find(query).count(function(err, count) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}
				callback(null, count);
			});
		});
	});
};

Contest_Status.getMulti= function getMulti(query, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Contest_Status', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.find(query).sort({username:1,run_ID:1}).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}

				var cont_status = [];
				docs.forEach(function(doc, index) {
					var cc = new Contest_Status(doc);
					cont_status.push(cc);
				});
				callback(null, cont_status);
			});
		});
	});
};

