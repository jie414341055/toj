var mongodb = require('./db');

function Contest_Code(cont_code) {
	this.cid = cont_code.cid;
	this.run_ID = cont_code.run_ID;
	this.code = cont_code.code;
};

module.exports = Contest_Code;

Contest_Code.prototype.save = function save(callback) {
	var code = {
		cid:		this.cid,
		run_ID:		this.run_ID,
		code:		this.code,
	};
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Contest_Code', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex({"cide":-1, "run_ID":-1},{unique:true});
			collection.insert(cont_code, {safe:true}, function(err, cont_code) {
				mongodb.close();
				callback(err, cont_code);
			});
		});
	});
};


Contest_Code.get = function get(cid, runid, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Contest_Code', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}

			cid = parseInt(cid);
			runid = parseInt(runid);
			collection.findOne({cid: cid, run_ID:runid}, function(err, doc) {
				mongodb.close();
				if(doc) {
					var code = new Contest_Code(doc);
					callback(err, code);
				} else {
					callback(err, null);
				}
			});
		});
	});
};

