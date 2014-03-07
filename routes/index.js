var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Prob = require('../models/prob.js');
var Rcont = require('../models/rcont.js');
var Status = require('../models/status.js');
var net = require('net');
var fs = require('fs');

module.exports = function(app) {
	app.get('/', function(req, res) {
		Rcont.get(function(err, rconts) {
			if (err) {
				rconts = [];
			}
			/*
			var contests = fs.readFileSync('/home/minjie/project/toj/server/contests.json', "utf-8");
			contests = JSON.parse(contests);
			*/
			res.render('index', {
				title: 'Home',
				fcontests: rconts,
			});
		});
	});
	//app.get(/\/test(\?lang=(\d?)\&pid=((\d{4,6})?))?/, function(req, res) {
	/*
	 *  /\/Problem(\?Volumn=(\d+)?)?/
	 */
	app.get(/\/Problem(\?Volume=(\d+)?)?/, function(req, res) {
		var vol_num = req.query.Volume;
		if(vol_num == "") vol_num = 1;
		else vol_num = parseInt(vol_num);
		Prob.getCount({}, function(err, total_prob_num) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			Prob.page(vol_num, function(err, probs) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('Volume', {
					title:'Problem',
					fvol_num: vol_num,
					ftotal_vol: Math.ceil(total_prob_num/50),
					fprobs: probs,
				});
			});
		});
	});
	app.get(/\/test(\?xx=(\d+)?)?/, function(req, res) {
		console.log(req.query.xx);
	});
	app.get(/\/ShowProblems(\?pid=(\d+)?)?/, function(req, res) {
	//app.get('/ShowProblems/:prob', function(req, res) {
		if(pid == "") pid = "1";
		var pid = parseInt(req.query.pid);
		Prob.get(pid, function(err, prob) {
			if (!prob) {
				req.flash('error', 'No such problem!');
				return res.redirect('/Problem');
			}
			
			res.render('ShowProblem', {
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
			
			/*	
			Prob.get(prob.pid, function(err, prob) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				//console.log(test);
				res.render('ShowProblem', {
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
			*/	
		});
	});

	app.get('/ProbSubmit/:prob', function(req, res) {
		var currentUser = req.session.user;
		if(!currentUser) {
			return res.redirect('/login');
		}
		Prob.get(req.params.prob, function(err, prob) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/ShowProblem/' + prob.pid);
			}
			//console.log('/Showproblem/' + prob.pid);
			res.render('ProbSubmit', {
				title: 'Submit',
				fprob: prob,
			});
		});
	});
	app.get('/Status', function(req, res) {
		Status.page(1, function(err, stats) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('Status', {
				title:'Status',
				fstats: stats,
			});
		});
	});
	app.post('/Status', function(req, res) {
		var HOST = '127.0.0.1';
		var PORT = 6969;
		console.log(req.body['code']);
		SendCode(HOST, PORT, req.body['code']);
		Status.page(1, function(err, stats) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('Status', {
				title:'Status',
				fstats: stats,
			});
		});
		res.redirect('/Status');
	});

	function SendCode(HOST, PORT, SourceCode) {
		var client = new net.Socket();
		client.connect(PORT, HOST, function() {
			client.write(SourceCode);
		});
	};

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


	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
		res.render('reg', {
			title: 'Register',
		});
	});

	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res) {
		//check the password entered are the same
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

		//check if the username already exists
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
					fposts: posts,
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
