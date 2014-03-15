var mongodb = require('./db');

function Contest_status(cont) {
	this.cid = cont.cid;
	this.runid = cont.runid;
	this.username = cont.username;
	this.problem = cont.problem;
	this.submit_time = cont.submit_time;
	this.lang = cont.lang;
	this.result = cont.result;
	this.time_used = cont.time_used;
	this.mem_used = cont.mem_used;
	this.code_len = cont.code_len;
};
module.exports = Contest_status;

Contest_status.prototype.save = function save(callback) {
	var cont_status = {
		cid:		this.cid,
		runid:		this.runid,
		username:	this.username,
		problem:	this.problem,
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
		db.collection('Contest_status', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex({cid:-1, runid:-1}, {unique: true});
			collection.insert(cont_status, {safe: true}, function(err, cont_status) {
				mongodb.close();
				callback(err, cont_status);
			});
		});
	});
};

Contest_status.get = function get(CID, RUNID, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Contest_status', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			CID = parseInt(CID);
			RUNID = parseInt(RUNID);
			collection.findOne({cid: CID, runid: RUNID}, function(err, doc){
				mongodb.close();
				if(doc) {
					var cont_status = new Contest_status(doc);
					callback(err, cont_status);
				} else {
					callback(err, null);
				}
			});
		});
	});
};
Contest_status.page = function page(query, pageID, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// read Contest_status collection
		db.collection('Contest_status', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			pageID = parseInt(pageID);
			collection.find(query).sort({cid:-1}).limit(15).skip((pageID - 1) * 15).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}

				var cont_status = [];
				docs.forEach(function(doc, index) {
					var cc = new Contest_status(doc);
					cont_status.push(cc);
				});
				callback(null, cont_status);
			});
		});
	});
};

Contest_status.getCount = function getCount(query, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Contest_status', function(err, collection) {
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
