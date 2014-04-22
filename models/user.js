var mongodb = require('./db');

function User(user) {
	this.username = user.username;
	this.nickname = user.username;
	this.password = user.password;
	this.school = user.school;
	this.country = user.country;
	this.decl = user.decl;
	this.email = user.email;
	this.total_submit = user.total_submit;
	this.total_ac = user.total_ac;
	this.solved_contest = user.solved_contest;
	this.register_time = new Date();
	this.last_login = new Date();
	this.ipaddr = user.ipaddr;
	this.oj = user.oj;
};
module.exports = User;

User.prototype.save = function save(callback) {

	var user = {
		username: this.username,
		nickname: this.nickname,
		password: this.password,
		school:	this.school,
		country: this.country,
		decl:	this.decl,
		email:	this.email,
		total_submit:	this.total_submit,
		total_ac:	this.total_ac,
		solved_contest:	this.solved_contest,
		register_time:	this.register_time,
		last_login:	this.last_login,
		ipaddr:	this.ipaddr,
		oj:	this.oj,
	};
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// users collections
		db.collection('User', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// add index for username
			collection.ensureIndex('username', {unique: true});
			// insert
			collection.insert(user, {safe: true}, function(err, user) {
				mongodb.close();
				callback(err, user);
			});
		});
	});
};

User.get = function get(Username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('User', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({username: Username}, function(err, doc) {
				mongodb.close();
				if (doc) {
					var user = new User(doc);
					callback(err, user);
				} else {
					callback(err, null);
				}
			});
		});
	});
};
User.page = function page(query, pageID, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('User', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			pageID = parseInt(pageID);
			collection.find(query).sort({total_ac:-1}).limit(50).skip((pageID - 1) * 50).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}
				var users = [];
				docs.forEach(function(doc, index) {
					var pp = new User(doc);
					users.push(pp);
				});
				callback(null, users);
			});
		});
	});
};

User.getCount = function getCount(query, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('User', function(err, collection) {
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
User.update= function getCount(username, info, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('User', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.update({username:username}, {$set:info});
			mongodb.close();
			callback(err);
		});
	});
};

User.update_submit = function getCount(username, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('User', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.update({username:username}, {$inc:{total_submit:1}});
			mongodb.close();
			callback(err);
		});
	});
};
