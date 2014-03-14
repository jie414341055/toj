var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Prob = require('../models/prob.js');
var Rcont = require('../models/rcont.js');
var Status = require('../models/status.js');
var net = require('net');
var fs = require('fs');

var digit2result = new Array();
var corrlang = new Array();

digit2result[0] = "Accepted";
digit2result[1] = "Wrong Answer";
digit2result[2] = "Presentation Error";
digit2result[3] = "Compilation Error";
digit2result[4] = "Runtime Error";
digit2result[5] = "Time Limit Exceeded";
digit2result[6] = "Memory Limit Exceeded";
digit2result[7] = "Output Limit Exceeded";
digit2result[8] = "Judge Error";

corrlang[1] = "G++";
corrlang[2] = "GCC";
corrlang[3] = "Java";
corrlang[4] = "Pascal";
corrlang[12] = "C++";
corrlang[13] = "C";

Judger_server = {};
Judger_server['HDU'] = 6969;
Judger_server['POJ'] = 6971;


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
	//app.get(/\/Problem(\?Volume=(\d+)?)?/, function(req, res) {
	app.get('/Problems', function(req, res) {


		var vol_num = req.query.Volume;
		if(!vol_num || vol_num == "") vol_num = 1;
		else vol_num = parseInt(vol_num);

		var query = {};
		var oj = req.query.oj;
		if(oj) query.oj = oj;

		var url = "/Problems?oj=";
		if(oj) url += oj;
		url += "&Volume=";

		Prob.getCount(query, function(err, total_prob_num) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			Prob.page(query, vol_num, function(err, probs) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('Volume', {
					title:'Problems',
					fvol_num: vol_num,
					ftotal_vol: Math.ceil(total_prob_num/100),
					fprobs: probs,
					furl: url,
					foj: oj,
				});
			});
		});
	});
	//app.get(/\/ShowProblems(\?pid=(\d+)?)?/, function(req, res) {
	app.get('/ShowProblems', function(req, res) {
		var pid = req.query.pid;
		if(!pid || pid == "") pid = "1001";
		pid = parseInt(pid);
		Prob.get(pid, function(err, prob) {
			if (!prob) {
				req.flash('error', 'No such problem!');
				return res.redirect('/Problems');
			}
			
			res.render('ShowProblem', {
				title: prob.title,
				fprob: prob,
			});
		});
	});

	app.post('/ProblemSearch', function(req, res) {
		var info = req.body['info'];
		var oj = req.body['oj'];
		//res.send(req.body['info']);
		var query = {};
		if(oj) query.oj = oj;
		Prob.search(query, info, function(err, probs) {
			if(err) {
				req.flash('error', 'Something happened...');
				return res.redirect('/Problems');
			}
			res.render('SearchProblems', {
				title:'Search Result',
				fprobs: probs,
				foj: oj,
				fnum: probs.length,
			});
			
		});

	});

	app.get('/ProbSubmit', checkLogin);
	app.get('/ProbSubmit', function(req, res) {
		var currentUser = req.session.user;
		var pid = req.query.pid;
	
		Prob.get(pid, function(err, prob) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/ShowProblem?pid=' + pid);
			}
			if (!prob) {
				req.flash('error', 'No such problem!');
				return res.redirect('/Problems');
			}
			//console.log('/Showproblem/' + prob.pid);
			res.render('ProbSubmit', {
				title: 'Submit',
				fprob: prob,
			});
		});
	});
	app.post('/ProbSubmit', checkLogin);
	app.post('/ProbSubmit', function(req, res) {
		var pid = req.query.pid;
		var code = req.body['code'];
		var lang = req.body['lang'];
		var currentUser = req.session.user;
	//	if(!currentUser) {
	//		return res.redirect('/login');
	//	}
		Prob.get(pid, function(err, prob) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/ShowProblem?pid=' + pid);
			}
			if (!prob) {
				req.flash('error', 'No such problem!');
				return res.redirect('/Problems');
			}
			Status.getCount({}, function(err, runID) {
				if(err) {
					req.flash('error', 'Database error!');
					return res.redirect('/ShowProblems?pid='+pid);
				}

				var oj = prob.oj;
				var HOST = '127.0.0.1';
				var PORT = Judger_server[oj];
				var runid = parseInt(runID) + 1;


				var now_date = new Date();
				now_date.setHours(now_date.getHours()+8);
				var sub_time = now_date.toISOString().replace(/T/,' ').replace(/\..+/,'');

				var data = prob.oj + " 2  __SOURCE-CODE-BEGIN-LABLE__\n" + code + "\n__SOURCE-CODE-END-LABLE__\n" + runid + "\n" + sub_time + "\n" + pid + " " + lang + " " + currentUser.username + " " + prob.vid + " ss mm\n";

				/*
				var stat = new Status({
					run_ID:	runid,
					pid:	prob.pid,
					oj:	prob.oj,
					lang:	lang,
					username: currentUser.username,
					submit_time:	new Date().toISOString().replace(/T/,' ').replace(/\..+/,''),
					result:	"Received"
				});
				console.log(stat);
				stat.save(function(err) {
					if (err) {
						req.flash('error', err);
						return res.redirect('/ProbSubmit?pid='+prob.pid);
					}
				});
				*/
				SendCode(HOST, PORT, data);
				res.redirect('/Status?page=1');
			});
		});
	});
	function SendCode(HOST, PORT, data) {
		var client = new net.Socket();
		client.connect(PORT, HOST, function() {
			client.write(data);
		});
	};

	app.get('/Status', function(req, res) {
	//Status?pid=&username=&lang=&result=&page=
		var query = {};
		var url = "/Status?";
		var pid = req.query.pid;
		var username = req.query.username;
		var lang = req.query.lang;
		var result = req.query.result;
		var pageID = req.query.page;
		if(pid) {
			query.pid = pid;
			url += "pid="+pid;
		} else url += "pid=";
		if(username) {
			query.username = username;
			url += "&username=" + username;
		} else url += "&username=";
		if(lang) {
			query.lang = lang;
			url += "&lang=" + lang;
		} else url += "&lang=";
		if(result) {
			query.result = digit2result[result];
			url += "&result=" + result;
		} else url += "&result=";
		if(pageID) pageID = parseInt(pageID);
		else pageID = 1;
		
		Status.getCount(query, function(err, total_num) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			Status.page(query, pageID, function(err, stats) {
				if(err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('Status', {
					title:'Status',
					fstats: stats,
					fcorrlang: corrlang,
					fpageID: pageID,
					fselected:{
						"pid":pid,
						"username":username,
						"lang":lang,
						"result":digit2result[result],
					},
					furl: url,
					ftotal_page: Math.ceil(total_num/15),
				});
			});
		});
	});

	app.get('/Contests', function(req, res) {
		var type = req.query.type;
		res.render('Contests', {
			title: 'Contests',
			fconts: [],
		});
	});

	app.get('/Ranklist', function(req, res) {
		page = req.query.page;
		if(page) page = parseInt(page);
		else page = 1;
		User.getCount({}, function(err, total_num) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			User.page({}, page, function(err, users) {
				if(err) {
					req.flash('error', err);
					return res.redirect('/Ranklist');
				}
				res.render('Ranklist', {
					title: 'Ranklist',
					fusers: users,
					fpage: page,
					ftotal_page: Math.ceil(total_num/50),
				});
			});
		});
	});

	app.get('/showceerror', function(req, res) {
		var runid = req.query.runid;
		Status.get(runid, function(err, stat) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('ShowCEError', {
				title: 'Error',
				fce_info: stat.ce_info,
			});
		});
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
		    	total_submit: 0,
		    	total_ac: 0,
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
			if(req.query.pid) res.redirect("/ProbSubmit?pid="+req.query.pid);
			else res.redirect('/');
		});
	});

	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res) {
		req.session.user = null;
		req.flash('success', 'Sign out success.');
		res.redirect('/');
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
	var url = "/login";
	var pid = req.query.pid;
	if(pid) url += "?pid="+pid;
	if (!req.session.user) {
		req.flash('error', 'Please Sign in first.');
		return res.redirect(url);
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
