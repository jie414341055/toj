var mongodb = require('./db');

function Code(code) {
	this.run_ID = code.run_ID;
	this.code = code.code;
};

module.exports = Code;

Code.prototype.save = function save(callback) {
	var code = {
		run_ID:		this.run_ID,
		code:		this.code,
	};
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Code', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex({"run_ID":-1},{unique:true});
			collection.insert(code, {safe:true}, function(err, code) {
				mongodb.close();
				callback(err, code);
			});
		});
	});
};


Code.get = function get(runid, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Code', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}

			runid = parseInt(runid);
			collection.findOne({run_ID:runid}, function(err, doc) {
				mongodb.close();
				if(doc) {
					var code = new Code(doc);
					callback(err, code);
				} else {
					callback(err, null);
				}
			});
		});
	});
};

