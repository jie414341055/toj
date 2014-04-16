var mongodb = require('./db');

function Contest_Prob(prob) {
	this.cid = prob.cid;
	this.nid = prob.nid;
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
};
module.exports = Contest_Prob;

Contest_Prob.prototype.save = function save(callback) {
  // 存入 Mongodb 的文档
	var prob = {
		cid:	this.cid,
		nid:	this.nid,
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
	};
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Contest_Problem', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex({'cid':-1,'nid':1}, {unique: true});
			collection.insert(prob, {safe: true}, function(err, prob) {
				mongodb.close();
				callback(err, prob);
			});
		});
	});
};

Contest_Prob.get = function get(CID, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('Contest_Problem', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			CID = parseInt(CID);
			collection.find({cid:CID}).sort({nid:1}).toArray(function(err, docs){
				mongodb.close();
				if(err) {
					callback(err, null);
				}
				var probs = [];
				docs.forEach(function(doc, index) {
					var pp = new Contest_Prob(doc);
					probs.push(pp);
				});
				callback(null, probs);
			});
		});
	});
};
