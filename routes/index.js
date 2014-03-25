var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Prob = require('../models/prob.js');
var Rcont = require('../models/rcont.js');
var Status = require('../models/status.js');
var Code = require('../models/code.js');
var Contest_Code = require('../models/contest_code.js');
var Contest = require('../models/contest.js');
var Contest_User = require('../models/contest_user.js');
var Contest_Status = require('../models/contest_status.js');
var net = require('net');
var fs = require('fs');
var querystring = require('querystring');

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

Contest_Judger_server = {};
Contest_Judger_server['HDU'] = 7070;
Contest_Judger_server['POJ'] = 7072;

module.exports = function(app) {
	app.get('/test', function(req, res) {
		res.render('test', {
			title: "test",
		});
	});
	app.post('/posttest', function(req, res) {
		var pid = req.body['pid'];
		//....
		res.send({error:0});

	});

	app.get('/', function(req, res) {
		Rcont.get(function(err, rconts) {
			if (err) {
				rconts = [];
			}
			res.render('index', {
				title: 'Home',
				fcontests: rconts,
			});
		});
	});
	app.get('/Problems', function(req, res) {


		var vol_num = req.query.Volume;
		if(!vol_num || vol_num == "") vol_num = 1;
		else vol_num = parseInt(vol_num);

		var query = {};
		var oj = req.query.oj;
		if(oj && oj != 'All') query.oj = oj;

		var url = "/Problems?oj=";
		if(oj && oj != 'All') url += oj;
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
		Prob.get({pid:pid}, function(err, prob) {
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
	
		pid = parseInt(pid);
		Prob.get({pid:pid}, function(err, prob) {
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
		pid = parseInt(pid);
		Prob.get({pid:pid}, function(err, prob) {
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

	//GET_STATUS
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
			query.pid = parseInt(pid);
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


		var loginUser = "";
		if(req.session.user)  loginUser = req.session.user.username;
		
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
				var total_page = Math.ceil(total_num / 15);
				if(total_page == 0) total_page = 1;
				res.render('Status', {
					title:'Status',
					floginUser: loginUser,
					fstats: stats,
					fcorrlang: corrlang,
					fpageID: pageID,
					fselected:{
						"lang":lang,
					},
					furl: url,
					ftotal_page: total_page,
				});
			});
		});
	});

	//GET_STATISTICS
	app.get('/Statistics', function(req, res) {
	//Status?pid=&username=&lang=&result=&page=
		var query = {};
		var pid = req.query.pid;
		var lang = req.query.lang;
		var pageID = req.query.page;

		if(pid) {
			query.pid = parseInt(pid);
		} else {
			query.pid = 0;
		}
		if(lang) {
			query.lang = lang;
		} 
		if(pageID) pageID = parseInt(pageID);
		else pageID = 1;


		var loginUser = "";
		if(req.session.user)  loginUser = req.session.user.username;
		
		Status.getCount(query, function(err, total_num) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			Status.GetStatistics(query, pageID, function(err, statistics) {
				console.log(statistics);
				/*
				if(err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				var total_page = Math.ceil(total_num / 15);
				if(total_page == 0) total_page = 1;
				res.render('Statistics', {
					title:'Statistics',
					floginUser: loginUser,
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
					ftotal_page: total_page,
				});
				*/
			});
		});
	});

	//GET_SHOWCODE
	app.get('/ShowCode', function(req, res) {
		var runid = req.query.runid;
		Status.get(runid, function(err, stat) {
			if(err || !stat) {
				req.flash('error', 'The code does not exists!');
				return res.redirect('/Status');
			}
			var currentUser = req.session.user;
			if(!currentUser || currentUser.username != stat.username) {
					req.flash('error', 'You don\' have the permission!');
					return res.redirect('/Status');
			}
			Code.get(runid, function(err, code) {
				if(err || !code) {
					req.flash('error', 'The code does not exists!');
					return res.redirect('/Status');
				}
				res.render('ShowCode', {
					title: 'View Code',
					fstat: stat,
					fcode: code,
					fcorrlang: corrlang,
				});

			});
		});
	});

	//GET_CONTEST
	app.get('/Contest/Contests', function(req, res) {
		var type = req.query.type;
		if(!type) type = 0;
		var pageID = req.query.page;
		if(pageID) pageID = parseInt(pageID);
		else pageID = 1;
		Contest.page({type:parseInt(type)}, pageID, function(err, conts) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/Contests?type'+type);
			}
			res.render('Contests', {
				title: 'Contests',
				fconts: conts,
				ftm: new Date(),
			});
		});
	});

	//GET_ARRANGE
	app.get('/Contest/ArrangeContest', checkLogin);
	app.get('/Contest/ArrangeContest', function(req, res) {
		var currentUser = req.session.user;
		var type = req.query.type;

		res.render('Arrange', {
			title: 'Arrange a Contest',
			fuser: currentUser,
			ftype: type,
		});
	});
	/*
	var now_date = new Date();
	now_date.setHours(now_date.getHours()+8);
	now_date = now_date.toISOString().replace(/T/,' ').replace(/\..+/,'');
	*/

	//POST_CHECK
	app.post('/Contest/CheckPid', function(req, res) {
		var oj = req.body['oj'];
		var vid = req.body['pid'];
		vid = parseInt(vid);
		Prob.get({vid:vid, oj:oj}, function(err, prob) {
			if(err || !prob) {
				res.send({error:1, title:''});
			} else {
				res.send({error:0, title:prob.title});
			}
		});

	});

	//POST_ARRANGE
	app.post('/Contest/ArrangeContest', function(req, res) {
		var currentUser = req.session.user;
		var type = req.query.type;
		var title = req.body['ctitle'];
		var desc = req.body['cdesc'];
		var st_time = req.body['csttime'];
		var ed_time = req.body['cedtime'];
		var passwd = req.body['cpasswd'];
		var prob = [];

		for(var i = 1001;i <= 1011; ++i) {
			if(req.body['pid'+i] == "") break;
			prob.push({"oj":req.body['oj'+i], "vid":req.body['pid'+i], "id":""+i});
		}
		Contest.getCount({}, function(err, cnt) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			var cont = {
				"cid": cnt + 1,
				"type": parseInt(type),
				"title": title,
				"desc": desc,
				"start_time": new Date(st_time),
				"end_time": new Date(ed_time),
				"author": currentUser.username,
				"access": passwd=="",
				"passwd": passwd,
				"problem": prob,
			};
			var Cont = new Contest(cont);
			Cont.save(function(err) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.redirect('/Contest/Contests?type='+type);
			});
		});

	});
	app.get('/Contest/Enter', function(req, res) {
		var CID = req.query.cid;
		res.render('Contest_Enter', {
			title: 'Enter Contest',
			fcid: CID,
		});
	});
	app.post('/Contest/Enter', function(req, res) {
		var CID = req.body['cid'];
		var passwd = req.body['passwd'];
		Contest.get(CID, function(err, cont) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/Contest/Contests');
			} else if(cont.passwd != passwd) {
				res.send({error:"1"});
			} else {
				cuser = {
					'username': req.session.user.username,
					'cid': parseInt(CID),
				};
				var Cuser = new Contest_User(cuser);
				Cuser.save(function(err) {
					if(err) {
						req.flash('error', err);
						return res.redirect('/Contest/Contests');
					}
					res.send({error:"0"});
				});
			}
		});
	});
	app.get('/Contest/ShowContests', checkLogin);
	app.get('/Contest/ShowContests', checkAccess);
	app.get('/Contest/ShowContests', function(req, res) {
		var CID = req.query.cid;
		Contest.get(CID, function(err, cont) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/Contest/Contests');
			}
			res.render('ShowContest', {
				title: cont.title,
				fcont: cont,
			});
		});
	});
	app.post('/Contest/GetProblems', function(req, res) {
		//query multi times
		var CID = req.body['cid'];
		var index = req.body['index'];
		var nid = parseInt(index) + 1001;
		Contest.get(CID, function(err, cont) {
			Prob.get({oj: cont.problem[index].oj, vid:parseInt(cont.problem[index].vid)}, function(err, prob) {
				Contest_Status.getCount({cid:parseInt(CID), nid:""+nid}, function(err, all) {
					Contest_Status.getCount({cid:parseInt(CID), nid:""+nid, result:"Accepted"}, function(err, ac) {
						res.send({title:prob.title, all:all, ac: ac});
					});
				});
			});
		});

	});


	//GET_CONTEST_PROB
	app.get('/Contest/Problems', checkAccess);
	app.get('/Contest/Problems', function(req, res) {
		var CID = req.query.cid;
		Contest.get(CID, function(err, cont) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/Contest/Contests?cid='+CID);
			}
			res.render('Contest_Problem', {
				title: 'Problems',
				fcont: cont,
			});
		});
	});


	//GET_CONTEST_SHOWPROB
	app.get('/Contest/ShowProblems', checkAccess);
	app.get('/Contest/ShowProblems', function(req, res) {
		var CID = req.query.cid;
		var index = parseInt(req.query.pid) - 1001;
		Contest.get(CID, function(err, cont) {
			if(err || !cont) {
				req.flash('error', err);
				return res.redirect('/Contest/Contests');
			} else if(index < 0 || index >= cont.problem.length) {
				return res.redirect('/Contest/Contests');
			}
			Prob.get({oj:cont.problem[index].oj, vid:parseInt(cont.problem[index].vid)}, function(err, prob) {
				if(err || !prob) {
					req.flash('error', err);
					return res.redirect('/Contest/Contests');
				}
				res.render('Contest_ShowProblem', {
					title: req.query.pid + '-' + prob.title,
					fcont: cont,
					findex: index,
					fprob: prob,
				});

			});
		});
	});


	//GET_CONTEST_SUBMIT
	app.get('/Contest/ProbSubmit', checkLogin);
	app.get('/Contest/ProbSubmit', checkAccess);
	app.get('/Contest/ProbSubmit', function(req, res) {
		var CID = req.query.cid;
		var index = parseInt(req.query.pid) - 1001;
		Contest.get(CID, function(err, cont) {
			if(err || !cont) {
				req.flash('error', err);
				return res.redirect('/Contest/Contests');
			} else if(index < 0 || index >= cont.problem.length) {
				return res.redirect('/Contest/Contests');
			}
			Prob.get({oj:cont.problem[index].oj, vid:parseInt(cont.problem[index].vid)}, function(err, prob) {
				if(err || !prob) {
					req.flash('error', err);
					return res.redirect('/Contest/Contests');
				}
				res.render('Contest_ProbSubmit', {
					title: 'Submit',
					fcid: CID,
					findex: index,
					fprob: prob,
					fedtime: cont.end_time,

				});
			});
		});
	});


	//POST_CONTEST_SUBMIT
	app.post('/Contest/ProbSubmit', function(req, res) {
		var CID = req.query.cid;
		var index = parseInt(req.query.pid) - 1001;
		var code = req.body['code'];
		var lang = req.body['lang'];
		var currentUser = req.session.user;
		Contest.get(CID, function(err, cont) {
			if(err || !cont) {
				req.flash('error', err);
				return res.redirect('/Contest/ShowContests?cid='+CID);
			}
			Prob.get({oj:cont.problem[index].oj, vid:parseInt(cont.problem[index].vid)}, function(err, prob) {
				if(err || !prob) {
					req.flash('error', err);
					return res.redirect('/Contest/ShowContests?cid='+CID);
				}
				Contest_Status.getCount({cid:parseInt(CID)}, function(err, runID) {
					if(err) {
						req.flash('error', 'Database error!');
						return res.redirect('/Contest/ShowContests?cid='+CID);
					}

					var oj = prob.oj;
					var HOST = '127.0.0.1';
					var PORT = Contest_Judger_server[oj];
					var runid = parseInt(runID) + 1;

					var now_date = new Date();

					now_date.setHours(now_date.getHours()+8);
					var sub_time = now_date.toISOString().replace(/T/,' ').replace(/\..+/,'');

					var data = prob.oj + " 2  __SOURCE-CODE-BEGIN-LABLE__\n" + code + "\n__SOURCE-CODE-END-LABLE__\n" + runid + "\n" + sub_time + "\n" + prob.pid + " " + lang + " " + currentUser.username + " " + prob.vid + " " + CID + " " + req.query.pid + " ss mm\n";

					SendCode(HOST, PORT, data);
					res.redirect('/Contest/Status?cid='+CID+'&page=1');
				});
			});
		});
	});

	//GET_CONTEST_STATUS
	app.get('/Contest/Status', checkAccess);
	app.get('/Contest/Status', function(req, res) {
		//Status?cid=&pid=&username=&lang=&result=&page=
		var query = {};
		var url = "/Contest/Status?";
		var cid = req.query.cid;
		var pid = req.query.pid;
		var username = req.query.username;
		var lang = req.query.lang;
		var result = req.query.result;
		var pageID = req.query.page;

		var loginUser = "";
		if(req.session.user)  loginUser = req.session.user.username;


		if(!cid) res.redirect('/Contest/Contests');

		url += "cid="+cid;
		query.cid = parseInt(cid);
		if(pid) {
			query.nid = pid;
			url += "&pid="+pid;
		} else url += "&pid=";
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

		Contest.get(cid, function(err, cont) {
			if(err || !cont) {
				req.flash('error', err);
				return res.redirect('/Contest/ShowContests?cid='+cid);
			}
			Contest_Status.getCount(query, function(err, total_num) {
				if(err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				Contest_Status.page(query, pageID, function(err, stats) {
					if(err) {
						req.flash('error', err);
						return res.redirect('/');
					}
					var total_page = Math.ceil(total_num/15);
					if(total_page == 0) total_page = 1;
					res.render('Contest_Status', {
						title:'Status',
						floginUser: loginUser,
						fcont: cont,
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
						ftotal_page: total_page,
					});
				});
			});
		});
	});

	//GET_CONTEST_SHOWCODE
	app.get('/Contest/ShowCode', checkLogin);
	app.get('/Contest/ShowCode', checkAccess);
	app.get('/Contest/ShowCode', function(req, res) {
		var cid = req.query.cid;
		var runid = req.query.runid;

		Contest_Status.get({cid:parseInt(cid),run_ID:parseInt(runid)}, function(err, stat) {
			if(err || !stat) {
				req.flash('error', 'You don\' have the permission!');
				return res.redirect('/Status');
			}
			var currentUser = req.session.user;
			if(!currentUser || currentUser.username != stat.username) {
					req.flash('error', 'You don\' have the permission!');
					return res.redirect('/Status');
			}
			Contest_Code.get(cid, runid, function(err, code) {
				if(err || !code) {
					req.flash('error', 'You don\' have the permission!');
					return res.redirect('/Status');
				}
				res.render('Contest_ShowCode', {
					title: 'View Code',
					fstat: stat,
					fcode: code,
					fcorrlang: corrlang,
				});

			});
		});
	});

	//GET_CONTEST_STANDING
	app.get('/Contest/Standing', checkAccess);
	app.get('/Contest/Standing', function(req, res) {
		var CID = req.query.cid;
		Contest.get(CID, function(err, cont) {
			if(err || !cont) {
				req.flash('error', err);
				return res.redirect('/Contest/ShowContests?cid='+cid);
			}
			Contest_Status.getMulti({cid:parseInt(CID)}, function(err, stats) {
				res.render('Contest_Standing', {
					title:'Standing',
					fcont: cont,
					fstats: stats,
				});
			});
		});
	});


	//GET_RANKING
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

	//GET_CE
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

	//GET_CONTEST_CE
	app.get('/Contest/showceerror', checkLogin);
	app.get('/Contest/showceerror', checkAccess);
	app.get('/Contest/showceerror', function(req, res) {
		var cid = req.query.cid;
		var runid = req.query.runid;
		Contest_Status.get(cid, runid, function(err, stat) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('Contest_ShowCEError', {
				title: 'Error',
				fce_info: stat.ce_info,
			});
		});
	});


	//GET_PROFILE
	app.get('/profile/:user', function(req, res) {
		var currentUser = req.session.user;
		var username = "";
		if(currentUser) username = currentUser.username;
		User.get(req.params.user, function(err, user) {
			if(!user) {
				req.flash('error', 'user doesn\'t exists.');
				return res.redirect('/');
			}
			Status.getMulti({username:req.params.user}, function(err, pids) {
				res.render('profile', {
					title: 'Profile',
					fuser: user,
					fusername: username,
					fpids: pids,
				});
			});
		});
	});
	app.post('/SaveProfile', function(req, res) {
		var currentUser = req.session.user;
		var info = {
			'nickname': req.body['nickname'],
			'email':	req.body['email'],
			'school':	req.body['univer'],
			'country':	req.body['country'],
			'decl':	req.body['decl'],
		};
		User.update(currentUser.username, info, function(err) {
			res.redirect('/profile/'+currentUser.username);

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


	//POST_CHECK
	app.post('/CheckUsernameExists', function(req, res) {
		User.get(req.body['username'], function(err, user) {
			if(user) {
				res.send({exists:1});
			} else {
				res.send({exists:0});
			}
		});
	});

	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res) {
		//check the password entered are the same
		if (req.body['password-repeat'] != req.body['password']) {
			req.flash('error', 'The password isn\'t the same.');
			return res.redirect('/reg');
		}

		//md5
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');

		var newUser = new User({
			username: req.body.username,
		    	password: password,
		    	total_submit: 0,
		    	total_ac: 0,
		    	vtotal_submit: 0,
		    	vtotal_ac: 0,
		});

		//check if the username already exists
		User.get(newUser.username, function(err, user) {
			if (user) {
				err = 'Username already exists.';
			}
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
			if(req.query.type) res.redirect("/Contest/Contests?type="+req.query.type);
			else res.redirect('/');
		});
	});

	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res) {
		req.session.user = null;
		req.flash('success', 'Sign out success.');
		res.redirect('/');
	});


	//GET_CHANGE
	app.get('/accounts/ChangePasswd', checkLogin);
	app.get('/accounts/ChangePasswd', function(req, res) {
		var username = req.query.u;
		res.render('ChangePasswd', {
			title: 'Change Password',
			fusername: username,
		});
	});
	//POST_CHANGE
	app.post('/accounts/ChangePasswd', checkLogin);
	app.post('/accounts/ChangePasswd', function(req, res) {
		var username = req.session.user.username;
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body['password']).digest('base64');
		User.update(username, {password:password}, function(err) {
			if(err) {
				req.flash('error', 'Change password failed.');
				return res.redirect('/');
			}
			req.flash('success', 'Change password succeed.');
			res.redirect('/');
		});
	});
	app.post('/CheckPasswd', function(req, res) {
		var md5 = crypto.createHash('md5');
		var username = req.body['username'];
		var passwd = req.body['passwd'];
		var password = md5.update(passwd).digest('base64');
		User.get(username, function(err, user) {
			if (!user) {
				req.flash('error', 'User doesn\'t exists.');
				return res.redirect('/');
			}
			if(user.password != password) {
				res.send({match:0});
			} else res.send({match:1});
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
	function SendCode(HOST, PORT, data) {
		var client = new net.Socket();
		client.connect(PORT, HOST, function() {
			client.write(data);
		});
	};

	function checkAccess(req, res, next) {
		var CID = req.query.cid;
		var USERNAME = "";
		if(req.session.user) USERNAME = req.session.user.username;
		Contest.get(CID, function(err, cont) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/Contest/Contests');
			}
			if(cont.passwd != "") {
				Contest_User.get(CID, USERNAME, function(err, cnt) {
					if(err) {
						req.flash('error', err);
						return res.redirect('/Contest/Contests');
					}
					if(cnt == 0) {
						return res.redirect('/Contest/Enter?cid='+CID);
					}
					next();
				});
			} else next();
		});
	}
	function checkLogin(req, res, next) {
		var url = "/login";
		var pid = req.query.pid;
		var type = req.query.type;
		if(pid) url += "?pid="+pid;
		if(type) url += "?type="+type;
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
