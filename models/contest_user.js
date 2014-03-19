var mongodb = require('./db');

function Contest_User(cont_user) {
	this.cid = cont_user.cid;
	this.username = cont_user.username;
};
module.exports = Contest_User;

Contest_User.prototype.save = function save(callback) {
	var cont_user = {
		cid:		this.cid,
		username:	this.username,
	};
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Contest_User', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('cid');
			collection.insert(cont_user, {safe: true}, function(err, cont_user) {
				mongodb.close();
				callback(err, cont_user);
			});
		});
	});
};

Contest_User.get = function get(CID, USERNAME, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Contest_User', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			CID = parseInt(CID);
			collection.find({cid: CID, username: USERNAME}).count(function(err, count){
				mongodb.close();
				if(err) {
					callback(err, null);
				} 
				callback(null, count);
			});
		});
	});
};
