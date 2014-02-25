var mongodb = require('./db');

function User(user) {
  this.username = user.username;
  this.nickname = user.nickname;
  this.password = user.password;
  this.school = user.school;
  this.email = user.email;
  this.total_submit = user.submit;
  this.total_ac = user.total_ac;
  this.register_time = new Date();
  this.ipaddr = user.ipaddr;
};
module.exports = User;

User.prototype.save = function save(callback) {
	// 存入 Mongodb 的文檔
	var user = {
		username: this.username,
		nickname: this.nickname,
		password: this.password,
		school:	this.school,
		email:	this.email,
		total_submit:	this.total_submit,
		total_ac:	this.total_ac,
		register_time:	this.register_time,
		ipaddr:	this.ipaddr,
	};
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// users collections
		db.collection('users', function(err, collection) {
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
		db.collection('users', function(err, collection) {
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
