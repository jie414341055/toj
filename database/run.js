
conn = new Mongo();
db = conn.getDB("microblog");
db.problem.find();
cursor = db.problem.find();

var prob = {
	pid: 	1010,			//题目pid，作为'主键'
	vid:	1001,			//题目在原oj的id
	oj:	'toj',			//原oj名称
	title: 	'Alice and Bob',			//题目title
	desc:	'More than 200 companies in more than 50 countries all over the world contribute towards the success of the Merck Group. You can imagine that every day Merck Group Headquarters at Darmstadt gets loads of mail from all over the world, the layout of all the letters following the customary style of their origin. In particular, the representation of a date is often ambiguous if you do not know in what order day, month, and year are given.For example, if you read 01-02-03, you do not know if that represents the first of February 1903, or 2003, or if it is the third of February 1901, or 2001. It might even be the second of March 2001, or some other permutation of the three numbers. Instead of the hyphens, there could also be slashes, backslashes, dots, commas, or no delimiters at all.\n You are hired to write a program that converts dates given in an unknown format to the format of the Adjusted Calender of Merck (ACM). The latter specifies the number of days relative to November 4, 2001, an important day in Merck\'s history.',			//题目描述
	input:	'The first line contains the number of scenarios.Every scenario contains a single date on a line by itself. A date consists of three parts: A day, a month, and a year given in any order, separated either by exactly two identical delimiters, or not separated by delimiters at all. Delimiters can be slashes "/", backslashes "\", hyphens "-", dots ".", or commas ",". The day and month are represented by a single digit, or by two digits, the first of which can be a leading zero. Valid years are in the range 1700 ... 2299; either all four digits are given, or just the last two that specify the year relative to the century. In the latter case, a leading zero may be omitted.Dates are considered illegal if no valid interpretation exists. More precisely, a date is illegal if no classification of the digits as day, month, and year results in a valid date in the range January 1, 1700, to December 31, 2299. However, you can be sure that all dates given contain 3 to 8 digits, and no other characters except for maybe the two delimiters.Remember that February 29 is a valid date for leap-years only. A year is a leap-year if and only if either its number is divisible by four, but not by one hundred, or if its number is divisible by four hundred. So, in particular, 2000 is a leap-year, while 1700, 1800, 1900, 2100, or 2200 are not.',			//题目描述输入
	output:	'The output for every scenario begins with a line containing "Scenario #i:", where i is the number of the scenario starting at 1.For every scenario, print all possible interpretations of the given date in the format of the Adjusted Calender of Merck (ACM), each interpretation in a single line, in ascending order and with duplicates removed. If no valid interpretation exists, print a line containing "Illegal date" instead.Terminate the output for each scenario with a single blank line.',			//题目描述输出
	sample_in:	'3\n 1631/02/29 \n 2001-11-03 \n 010203',		//题目描述sample input	
	sample_out:	'1 \n 2 \n 3 \n',		//题目描述sample output
	num_of_testcases:	0,	//数据组数，大部分情况未知
	total_submit:	1000,		//总计提交数
	total_ac:	250,		//总计ac数
	total_wa:	300,		//总计wa数
	total_re:	100,		//总计re数
	total_ce:	5,		//总计ce数
	total_tle:	20,		//总计tle数
	total_mle:	11,		//总计mle数
	total_pe:	7,		//总计pe数
	total_ole:	0,		//总计ole数
	total_rf:	1,		//总计rf数
	vtotal_ac:	20,		//原oj总计ac数
	vtotal_submit:	100,		//原oj总计提交数
	special_status:	0,		//是否special judge
	time_limit:	1000,		//时限
	mem_limit:	65536,		//空间限制
	hint:	'',			//hint
	source:	'',			//题目来源
	author:	'',			//题目作者
	tag:	[],			//题目标签，可以使用数组
};
db.problem.insert(prob);

//--------------------------
//collection.problem
/*
db.problem.insert({
	pid: 	,			//题目pid，作为'主键'
	vid:	,			//题目在原oj的id
	oj:	,			//原oj名称
	title: 	,			//题目title
	desc:	,			//题目描述
	input:	,			//题目描述输入
	output:	,			//题目描述输出
	sample_in:	,		//题目描述sample input	
	sample_out:	,		//题目描述sample output
	num_of_testcases:	,	//数据组数，大部分情况未知
	total_submit:	,		//总计提交数
	total_ac:	,		//总计ac数
	total_wa:	,		//总计wa数
	total_re:	,		//总计re数
	total_ce:	,		//总计ce数
	total_tle:	,		//总计tle数
	total_mle:	,		//总计mle数
	total_pe:	,		//总计pe数
	total_ole:	,		//总计ole数
	total_rf:	,		//总计rf数
	vtotal_ac:	,		//原oj总计ac数
	vtotal_submit:	,		//原oj总计提交数
	special_status:	,		//是否special judge
	time_limit:	,		//时限
	mem_limit:	,		//空间限制
	hint:	,			//hint
	source:	,			//题目来源
	author:	,			//题目作者
	tag:	,			//题目标签，可以使用数组
});

db.ranklist.insert({
	username:	,		//用户username，'主键'
	nickname:	,		//用户昵称
	total_ac:	,		//该用户总计ac数
	total_submit:	,		//该用户总计提交数
	//rates:	,		//用户rating
});

db.oj.insert({
	vname:		,		//oj名称，'主键'
	int64io:	,		//64位int输出格式,两种%lld、%I64d
	javaclass:	,		//java类名，默认Main
	prob_num:	,		//oj题目个数
});

db.user.insret({
	username:	,		//用户名，'主键'
	nickname:	,		//昵称，默认和username相同
	password:	,		//用户密码
	school:		,		//用户学校
	email:		,		//email
	total_submit:	,		//
	total_ac:	,		//
	register_time:	,		//
	last_login_time:	,	//
	ipaddr:		,		//ip
	hdu: {				//关联oj
		username:	,
		password:	,
	},				//hdu的账号密码
	//...
});

db.Status.insert({
	username:	,		//提交用户
	runid:		,		//runid
	pid:		,		//题目的pid
	result:		,		//评测结果
	memory_used:	,		//使用内存
	time_used:	,		//运行时间
	time_submit:	,		//提交时间
	code_len:	,		//代码长度
	language:	,		//使用语言
	ce_info:	,		//ce的话，报错信息
});

db.contest.insert({
	cid:		,		//contest id,主键
	title:		,		//title
	desc:		,		//description
	start_time:	,		
	end_time:	,		
	ispublic:	,		//是否公开
	passport:	,

});

*/
