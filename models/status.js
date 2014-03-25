var mongodb = require('./db');

function Status(stat) {
	this.run_ID = stat.run_ID;
	this.vrun_ID = stat.vrun_ID;
	this.oj = stat.oj;
	this.submit_time = stat.submit_time;
	this.result = stat.result;
	this.pid = stat.pid;
	this.username = stat.username;
	this.lang = stat.lang;
	this.time_used = stat.time_used;
	this.mem_used = stat.mem_used;
	this.code_len = stat.code_len;
	this.ce_info = stat.ce_info;
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
		ce_info:	this.ce_info,
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

Status.getRunID = function getRunID(callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Status', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			db.insert({_id:getNext("runid"), result:"Queuing"}, {safe:true}, function(err, doc) {
				if(err) {
					mongodb.close();
					return callback(err);
				}
				callback(err, doc._id);
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
			collection.find(query).sort({run_ID:-1}).limit(15).skip((pageID - 1) * 15).toArray(function(err, docs) {
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

Status.getCount = function getCount(query, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Status', function(err, collection) {
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
Status.getMulti = function page(query, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Status', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//collection.distinct('pid', query).sort({pid:1}).toArray(function(err, docs) {
			collection.distinct('pid', query, function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}
				docs.sort();
				callback(null, docs);
			});
		});
	});
};

Status.GetStatistics = function GetStatistics(query, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Status', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.aggregate({$match:query}, {$group:{_id:"$result", cnt:{$sum:1}}}, function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}
				callback(null, docs);
			});
		});
	});
};

Status.GetLeader = function GetLeader(query, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Status', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.find(query).sort({time_used:1, mem_used:1}).limit(15).skip((pageID - 1) * 15).toArray(function(err, docs) {
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
