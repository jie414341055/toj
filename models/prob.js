var mongodb = require('./db');

function Prob(prob) {
	this.uid = prob.uid;
	this.title = prob.title;
	this.oj = prob.oj;
	this.rates = prob.rates;
	this.desc = prob.desc;
};
module.exports = Prob;

Prob.prototype.save = function save(callback) {
  // 存入 Mongodb 的文档
  var prob = {
	  uid: this.uid,
	  title: this.title,
	  oj: this.oj,
	  rates: this.rates,
	  desc: this.desc,
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
      // 为 uid 属性添加索引
      collection.ensureIndex('uid', {unique: true});
      // 写入 problem 文档
      collection.insert(prob, {safe: true}, function(err, prob) {
        mongodb.close();
        callback(err, prob);
      });
    });
  });
};

Prob.get = function get(id, callback) {
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
      // 查找 uid 属性为 uid 的文档，如果 uid 是 null 则匹配全部
      id = parseInt(id);
      collection.findOne({uid: id}, function(err, doc){
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
