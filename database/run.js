/*
conn = new Mongo();
db = conn.getDB("microblog");
db.problem.find();
cursor = db.problem.find();
while ( cursor.hasNext() ) {
	   printjson( cursor.next() );
}
db.problem.find({uid:1002}).forEach(printjson);
*/

//--------------------------
//collection.problem
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
	javaclass	,		//java类名，默认Main

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
	language:	,		//使用语言
	ce_info:	,		//ce的话，报错信息
});
