
conn = new Mongo();
db = conn.getDB("microblog");
db.problem.find();
cursor = db.problem.find();

var prob = {
	pid: 	1010,			//题目pid，作为'主键'
	vid:	1001,			//题目在原oj的id
	oj:	'toj',			//原oj名称
	title: 	'Alice and Bob',			//题目title
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
