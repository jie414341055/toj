var mongodb = require('./db');

function Rcont(rcont) {
	this.id = rcont.id;
	this.oj = rcont.oj;
	this.link = rcont.link;
	this.name = rcont.name;
	this.start_time = rcont.start_time;
	this.week = rcont.week;
	this.access = rcont.access;
};
module.exports = Rcont;

Rcont.prototype.save = function save(callback) {

	var rcont = {
		id:	this.id,
		oj:	this.id,
		link:	this.link,
		name:	this.name,
		start_time:	this.start_time,
		week:	this.week,
		access:	this.access,
	};
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Recent_contests', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.insert(rcont, {safe: true}, function(err, rcont) {
				mongodb.close();
				callback(err, rcont);
			});
		});
	});
};

Rcont.get = function get(callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Recent_contests', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			var now_tm = new Date().toISOString().replace(/T/,' ').replace(/\..+/,'');
			collection.find({"start_time":{"$gte":now_tm}}).sort({start_time:1}).limit(15).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}
				var rconts = [];
				if(docs) {
					docs.forEach(function(doc, index) {
						var rr = new Rcont(doc);
						rconts.push(rr);
					});
				}
				callback(null, rconts);
			});
		});
	});
};


