var mongodb = require('./db');

//function Contest(xx, cont, cid, type, title, st_time, ed_time, author, access, passwd, prob) {
function Contest(cont) {
	this.cid = cont.cid;
	this.type = cont.type;
	this.title = cont.title;
	this.start_time = cont.start_time;
	this.end_time = cont.end_time;
	this.author = cont.author;
	this.access = cont.access;
	this.passwd = cont.passwd;
	this.problem = cont.problem;
};
module.exports = Contest;

Contest.prototype.save = function save(callback) {
	var cont = {
		cid:		this.cid,
		type:		this.type,
		title:		this.title,
		start_time:	this.start_time,
		end_time:	this.end_time,
		author:		this.author,
		access:		this.access,
		passwd:		this.passwd,
		problem:	this.problem,
	};
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Contest', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('cid', {unique: true});
			collection.insert(cont, {safe: true}, function(err, cont) {
				mongodb.close();
				callback(err, cont);
			});
		});
	});
};

Contest.get = function get(CID, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Contest', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			CID = parseInt(CID);
			collection.findOne({cid: CID}, function(err, doc){
				mongodb.close();
				if(doc) {
					var cont = new Contest(doc);
					callback(err, cont);
				} else {
					callback(err, null);
				}
			});
		});
	});
};
Contest.page = function page(query, pageID, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// read Contest collection
		db.collection('Contest', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			pageID = parseInt(pageID);
			collection.find(query).sort({cid:-1}).limit(10).skip((pageID - 1) * 10).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}

				var conts = [];
				docs.forEach(function(doc, index) {
					var cc = new Contest(doc);
					conts.push(cc);
				});
				callback(null, conts);
			});
		});
	});
};

Contest.search = function search(query, info, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Contest', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var conts = [];
			var reg = '.*' + info + '.*';
			collection.find({$and:[query,{$or:[{title:new RegExp(reg)},{author:new RegExp(reg)}]}]}).limit(10).sort({cid:-1}).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}

				docs.forEach(function(doc, index) {
					var cc = new Contest(doc);
					conts.push(cc);
				});
				callback(null, conts);
			});
		});
	});
};

Contest.getCount = function getCount(query, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Contest', function(err, collection) {
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
