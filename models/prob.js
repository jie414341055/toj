var mongodb = require('./db');

function Prob(prob) {
	this.pid = prob.pid;
	this.vid = prob.vid;
	this.oj = prob.oj;
	this.title = prob.title;
	this.desc = prob.desc;
	this.input = prob.input;
	this.output = prob.output;
	this.sample_in = prob.sample_in;
	this.sample_out = prob.sample_out;
	this.num_of_testcases = prob.num_of_testcases;
	this.total_submit = prob.total_submit;
	this.total_ac = prob.total_ac;
	this.total_wa = prob.total_wa;
	this.total_re = prob.total_re;
	this.total_ce = prob.total_ce;
	this.total_tle = prob.total_tle;
	this.total_mle = prob.total_mle;
	this.total_ole = prob.total_ole;
	this.total_pe = prob.total_pe;
	this.total_rf = prob.total_rf;
	this.vtotal_ac = prob.vtotal_ac;
	this.vtotal_submit = prob.vtotal_submit;
	this.special_status = prob.special_status;
	this.time_limit = prob.time_limit;
	this.mem_limit = prob.mem_limit;
	this.hint = prob.hint;
	this.source = prob.source;
	this.author = prob.author;
	this.tag = prob.tag;
};
module.exports = Prob;

Prob.prototype.save = function save(callback) {
  // 存入 Mongodb 的文档
	var prob = {
		pid:	this.pid,
		vid:	this.vid,
		oj: 	this.oj,
		title: 	this.title,
		desc: 	this.desc,
		input: 	this.input,
		output:	this.output,
		sample_in:	this.sample_in,
		sample_out:	this.sample_out,
		num_of_testcases:this.num_of_testcases,
		total_submit:	this.total_submit,
		total_ac:	this.total_ac,
		total_wa:	this.total_wa,
		total_re:	this.total_re,
		total_ce:	this.total_ce,
		total_tle:	this.total_tle,
		total_mle:	this.total_mle,
		total_pe:	this.total_pe,
		total_ole:	this.total_ole,
		total_rf:	this.total_rf,
		vtotal_ac:	this.vtotal_ac,
		vtotal_submit:	this.vtotal_submit,
		special_status:	this.special_status,
		time_limit:	this.time_limit,
		mem_limit:	this.mem_limit,
		hint:		this.hint,
		source:		this.source,
		author:		this.author,
		tag:		this.tag,
	};
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 problem 集合
		db.collection('problem', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 为 pid 属性添加索引
			collection.ensureIndex('uid', {unique: true});
			// 写入 problem 文档
			collection.insert(prob, {safe: true}, function(err, prob) {
				mongodb.close();
				callback(err, prob);
			});
		});
	});
};

Prob.get = function get(PID, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 problem 集合
		db.collection('problem', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 查找 pid 属性为 PID 的文档，如果 PID 是 null 则匹配全部
			PID = parseInt(PID);
			collection.findOne({pid: PID}, function(err, doc){
				mongodb.close();
				if(doc) {
					var prob = new Prob(doc);
					//console.log(prob);
					callback(err, prob);
				} else {
					callback(err, null);
				}
			});
		});
	});
};
Prob.page = function page(pageID, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 problem 集合
		db.collection('problem', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			pageID = parseInt(pageID);
			collection.find().sort({pid:1}).limit(100).skip((pageID - 1) * 100).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}

				var probs = [];
				docs.forEach(function(doc, index) {
					var pp = new Prob(doc);
					probs.push(pp);
				});
				callback(null, probs);
			});
		});
	});
};

Prob.getCount = function getCount(query, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('problem', function(err, collection) {
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
