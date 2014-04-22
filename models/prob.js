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
	this.total_other = prob.total_other;
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
		total_other:	this.total_other,
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
		db.collection('Problem', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('uid', {unique: true});
			collection.insert(prob, {safe: true}, function(err, prob) {
				mongodb.close();
				callback(err, prob);
			});
		});
	});
};

Prob.get = function get(query, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Problem', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne(query, function(err, doc){
				mongodb.close();
				if(doc) {
					var prob = new Prob(doc);
					callback(err, prob);
				} else {
					callback(err, null);
				}
			});
		});
	});
};
Prob.page = function page(query, pageID, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Problem', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			pageID = parseInt(pageID);
			collection.find(query,{pid:1,title:1,oj:1,vid:1,vtotal_submit:1,vtotal_ac:1,total_submit:1,total_ac:1 }).sort({pid:1}).limit(100).skip((pageID - 1) * 100).toArray(function(err, docs) {
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

Prob.search = function search(query, info, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Problem', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var probs = [];
			var reg = '.*' + info + '.*';
			collection.find({$and:[query,{$or:[{pid:parseInt(info)},{vid:info}]}]}).toArray(function(err, docs) {
				docs.forEach(function(doc, index) {
					var pp = new Prob(doc);
					probs.push(pp);
				});
				collection.find({$and:[query,{$or:[{title:new RegExp(reg)},{source:new RegExp(reg)}]}]},{desc:0,input:0,output:0,sample_in:0,sample_out:0}).limit(100).sort({pid:1}).toArray(function(err, docs) {
					mongodb.close();
					if(err) {
						callback(err, null);
					}
				
					docs.forEach(function(doc, index) {
						var pp = new Prob(doc);
						probs.push(pp);
					});
					callback(null, probs);
				});
			});
		});
	});
};

Prob.getCount = function getCount(query, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Problem', function(err, collection) {
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

Prob.getContestProb = function getContestProb(query, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Problem', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.find({$or:query}).toArray(function(err, docs) {
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
}

Prob.update_submit = function update_submit(PID, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('Problem', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			PID = parseInt(PID);
			collection.update({pid:PID}, {$inc:{total_submit:1}});
			mongodb.close();
			callback(err);
		});
	});
}
