var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Prob = require('../models/prob.js');

module.exports = function(app) {
	app.get('/', function(req, res) {
		Post.get(null, function(err, posts) {
			if (err) {
				posts = [];
			}
			res.render('index', {
				title: 'Home',
				fposts: posts,
			});
		});
	});
	app.get('/Problem', function(req, res) {
		
		Prob.getCount({}, function(err, total_prob_num) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			Prob.page(1, function(err, probs) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('Problem', {
					title:'Problem',
					ftotal_prob_num: total_prob_num,
					fprobs: probs,
				});
			});
		});
	});
	
	app.get('/problem/:vol', function(req, res) {

		var vol_num = req.params.vol;
		vol_num = parseInt(vol_num.substr(3, vol_num.length));

		Prob.getCount({}, function(err, total_prob_num) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			Prob.page(vol_num, function(err, probs) {
				if(err) {
					req.flash('error', err);
					return res.redirect('/Problem');
				}
				res.render('vol', {
					title:'Problem',
					fvol_num:vol_num,
					ftotal_prob_num:total_prob_num,
					fprobs: probs,
				});
			});
		});
	});
	app.get('/ShowProblems/:prob', function(req, res) {
		Prob.get(req.params.prob, function(err, prob) {
			if (!prob) {
				req.flash('error', 'No such problem!');
				return res.redirect('/Problem');
			}
			Prob.get(prob.pid, function(err, prob) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				//console.log(test);
				res.render('prob', {
					pid: 	prob.pid,
					oj: 	prob.oj,
					title: 	prob.title,
					rates: 	prob.rates,
					desc: 	prob.desc,
					input:	prob.input,
					output:	prob.output,
					sample_in:	prob.sample_in,
					sample_out:	prob.sample_out,
				});
			});
		});
	});


	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
		res.render('reg', {
			title: 'Register',
		});
	});

	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res) {
		//檢驗用戶兩次輸入的口令是否一致
		if (req.body['password-repeat'] != req.body['password']) {
			req.flash('error', 'The password isn\'t the same.');
			return res.redirect('/reg');
		}

		//生成口令的散列值
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');

		var newUser = new User({
			username: req.body.username,
		    password: password,
		});

		//檢查用戶名是否已經存在
		User.get(newUser.username, function(err, user) {
			if (user)
			err = 'Username already exists.';
		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}
		//if not exists, add a new user
		newUser.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash('success', 'Register succeed.');
			res.redirect('/');
		});
		});
	});

	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res) {
		res.render('login', {
			title: 'Sign in',
		});
	});

	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res) {
		//生成口令的散列值
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');

		User.get(req.body.username, function(err, user) {
			if (!user) {
				req.flash('error', 'User doesn\'t exists.');
				return res.redirect('/login');
			}
			if (user.password != password) {
				req.flash('error', 'Wrong password.');
				return res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success', 'Sign in success.');
			res.redirect('/');
		});
	});

	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res) {
		req.session.user = null;
		req.flash('success', 'Sign out success.');
		res.redirect('/');
	});

	app.get('/profile/:user', function(req, res) {
		User.get(req.params.user, function(err, user) {
			if(!user) {
				req.flash('error', 'user doesn\'t exists.');
				return res.redirect('/');
			}
			User.get(user.username, function(err, user) {
				if(err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('profile', {
					title: 'My profile',
					fuser: user,
				});
			});
		});
	});


	app.get('/u/:user', function(req, res) {
		User.get(req.params.user, function(err, user) {
			if (!user) {
				req.flash('error', 'User doesn\'t exists.');
				return res.redirect('/');
			}
			Post.get(user.username, function(err, posts) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('user', {
					title: user.username,
					posts: posts,
				});
			});
		});
	});

	app.post('/post', checkLogin);
	app.post('/post', function(req, res) {
		var currentUser = req.session.user;
		var post = new Post(currentUser.username, req.body.post);
		post.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', 'post success.');
			res.redirect('/u/' + currentUser.username);
		});
	});
};

function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', 'Please Sign in first.');
		return res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', 'Signed in.');
		return res.redirect('/');
	}
	next();
}
