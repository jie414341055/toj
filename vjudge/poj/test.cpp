#include "test.h"

CURL *curl;
CURLcode res;
char tmps[1000000];

struct Judger_data {
	char src[MAX_DATA_SIZE];
	int runid;
	int pid;
	int lang;
	char vid[300];
	char submit_time[50];
	char user[50];
	//int time_limit;
	//int case_limit;
	//int number_of_cases;
	//int memory_limit;
	//int special_judge_status;
	//char vname[300];
};
Judger_data temp;

string getAllFromFile(char *filename) {
	string res="";
	FILE * fp=fopen(filename,"r");
	while (fgets(tmps,1000000,fp)) res+=tmps;
	fclose(fp);
	return res;
}

string getLineFromFile(char *filename,int line) {
	string res="";
	FILE * fp=fopen(filename,"r");
	int cnt=0;
	while (fgets(tmps,1000000,fp)) {
		cnt++;
		if (cnt==line) {
			res=tmps;
			break;
		}
	}
	fclose(fp);
	return res;
}

bool login() {
	FILE * fp=fopen(tfilename,"w+");
	curl = curl_easy_init();
	if(curl) {
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, fp);
		curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, NULL);
		curl_easy_setopt(curl, CURLOPT_COOKIEJAR, "pku.cookie");
		curl_easy_setopt(curl, CURLOPT_URL, "http://poj.org/login");
		string post=(string)"user_id1="+username+"&password1="+password+"&B1=login";
		curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post.c_str());
		res = curl_easy_perform(curl);
		curl_easy_cleanup(curl);
	}
	fclose(fp);
	if (res) return false;
	string ts=getAllFromFile(tfilename);
	//cout<<ts;
	if (ts.find("alert(\"Login failed!)")!=string::npos) return false;
	return true;
}

string covert(int x) {
	char tt[100];
	sprintf(tt,"%d",x);
	string t=tt;
	return t;
}

bool submit(string pid,string lang,string source) {
	FILE * fp=fopen(tfilename,"w+");
	curl = curl_easy_init();
	if(curl) {
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, fp);
		curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, NULL);
		curl_easy_setopt(curl, CURLOPT_COOKIEFILE, "pku.cookie");
		curl_easy_setopt(curl, CURLOPT_URL, "http://poj.org/submit");
		/*
		   problem_id=1000&language=4&
		   source=%23include+%22curl.h%22%0D%0A%23include+%3Cstdio.h%3E%0D%0A%0D%0Aint+main%28%29%0D%0A%7B%0D%0A++++CURL+*curl%3B%0D%0A++++CURLcode+res%3B%0D%0A++++FILE+*+fp%3Dfopen%28%22a.txt%22%2C%22w%2B%22%29%3B%0D%0A++++curl+%3D+curl_easy_init%28%29%3B%0D%0A++++if%28curl%29%0D%0A++++%7B%0D%0A++++++++curl_easy_setopt%28curl%2C+CURLOPT_WRITEDATA%2C+fp%29%3B%0D%0A++++++++curl_easy_setopt%28curl%2C+CURLOPT_WRITEFUNCTION%2C+NULL%29%3B%0D%0A++++++++curl_easy_setopt%28curl%2C+CURLOPT_URL%2C+%22http%3A%2F%2Facm.pku.edu.cn%22%29%3B%0D%0A++++++++res+%3D+curl_easy_perform%28curl%29%3B%0D%0A++++++++curl_easy_cleanup%28curl%29%3B%0D%0A++++%7D%0D%0A++++fclose%28fp%29%3B%0D%0A++++return+0%3B%0D%0A%7D%0D%0A
		   &submit=Submit
		 */

		string post=(string)"problem_id="+pid+"&language="+lang+"&source="+escapeURL(source);
		//cout<<post;
		curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post.c_str());
		res = curl_easy_perform(curl);
		curl_easy_cleanup(curl);
	}
	fclose(fp);
	if (res) return false;
	string ts=getAllFromFile(tfilename);
	cout<<ts;
	if (ts.find("Error Occurred")!=string::npos||ts.find("The page is temporarily unavailable")!=string::npos) return false;
	return true;
}


string getResult(string s) {
	int pos=s.find("<font color=");
	while (s[pos]!='>') pos++;
	pos++;
	int st=pos;
	while (s[pos]!='<') pos++;
	return s.substr(st,pos-st);
}

string getRunid(string s) {
	int pos=s.find("<td>");
	while (s[pos]!='>') pos++;
	pos++;
	int st=pos;
	while (s[pos]!='<') pos++;
	return s.substr(st,pos-st);
}

char tempce[MAX_DATA_SIZE];

string getCEinfo(string runid) {
	FILE * fp=fopen(tfilename,"w+");
	curl = curl_easy_init();
	if(curl) {
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, fp);
		curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, NULL);
		curl_easy_setopt(curl, CURLOPT_COOKIEJAR, "pku.cookie");
		string url=(string)"http://poj.org/showcompileinfo?solution_id="+runid;
		//cout<<url;
		curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
		res = curl_easy_perform(curl);
		curl_easy_cleanup(curl);
	}
	fclose(fp);
	string ts=getAllFromFile(tfilename);

	int pos=ts.find("<pre>");
	while (ts[pos]!='>') pos++;
	pos++;
	int st=pos;
	while (ts[pos]!='<') pos++;
	string info=ts.substr(st,pos-st);
	strcpy(tempce,info.c_str());
	decode_html_entities_utf8(tempce, 0);
	info=tempce;
	int position = info.find( "\\" );
	while ( position != string::npos ) {
		info.replace( position, 1, "\\\\" );
		position = info.find( "\\", position + 2 );
	} 
	return info;
}

string getUsedTime(string s) {
	int pos=s.find("MS</td>");
	int st=pos;
	while (s[pos]!='>') pos--;
	pos++;
	return s.substr(pos,st-pos);
}

string getUsedMem(string s) {
	int pos=s.find("K</td>");
	int st=pos;
	while (s[pos]!='>') pos--;
	pos++;
	return s.substr(pos,st-pos);
}

//http://poj.org/status?problem_id=1000&user_id=51isoft&result=&language=
bool getStatus(string pid,string lang,string & result,string& ce_info,string &tu,string &mu) {
	int begin=time(NULL);
	string runid;
	tu=mu="0";
	string ts;
	while (true) {
		FILE * fp=fopen(tfilename,"w+");
		curl = curl_easy_init();
		if(curl) {
			curl_easy_setopt(curl, CURLOPT_WRITEDATA, fp);
			curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, NULL);
			curl_easy_setopt(curl, CURLOPT_COOKIEJAR, "pku.cookie");
			string url=(string)"http://poj.org/status?problem_id="+pid+"&user_id="+username+"&language="+lang;
			//cout<<url;
			curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
			res = curl_easy_perform(curl);
			curl_easy_cleanup(curl);
		}
		fclose(fp);
		if (res) return false;
		ts=getLineFromFile(tfilename,3);
		//cout<<ts;
		/*if (ts.find("alert(\"Login failed!)")!=string::npos) return false;
		 */
		if (ts.find("Error Occurred")!=string::npos||ts.find("The page is temporarily unavailable")!=string::npos) return false;
		runid=getRunid(ts);
		result=getResult(ts);
		/* minjie */
		if(result == "Compile Error") result = "Compilation Error";
		db_client.update("toj.Status",
				BSON("run_ID" << temp.runid),
				BSON("$set" << BSON("result"<<result)),
				true, false);
				//upsert, multi
		cout << result << endl << runid << endl;
		if (result.find("Waiting")==string::npos
				&&result.find("Running")==string::npos
				&&result.find("Judging")==string::npos
				&&result.find("Queuing")==string::npos
				&&result.find("Compiling")==string::npos
				&&result!=""&&result[0]!='\n'&&result[0]!='\t'&&result[0]!='\r'&&result[0]!=' ') {
			break;
		}
		if (time(NULL)-begin>MAX_WAIT_TIME) break;
	}
	if (!(result.find("Waiting")==string::npos
				&&result.find("Running")==string::npos
				&&result.find("Judging")==string::npos
				&&result.find("Queuing")==string::npos
				&&result.find("Compiling")==string::npos
				&&result!=""&&result[0]!='\n'&&result[0]!='\t'&&result[0]!='\r'&&result[0]!=' ')) return false;

	if (result=="Compilation Error") {
		ce_info=getCEinfo(runid);
	}
	else ce_info="";
	if (result=="Accepted") {
		tu=getUsedTime(ts);
		mu=getUsedMem(ts);
	} else {
		tu = "";
		mu = "";
	}

	/* minjie update Status */
	db_client.update("toj.Status",
			BSON("run_ID" << temp.runid),
			BSON("$set" << BSON("vrun_ID" << runid << "oj" << "POJ" << "result"<<result<<"time_used"<<tu<<"mem_used"<<mu<<"ce_info"<<ce_info)),
			true, false);

	/* minjie update User */
	db_client.update("toj.User",
			BSON("username" << temp.user),
			BSON("$inc"<<BSON("total_submit"<<1)),
			false,true);
			//upsert,multi

	if(result == "Accepted") {
		db_client.update("toj.User",
				BSON("username" << temp.user),
				BSON("$inc"<<BSON("total_ac"<<1)),
				false,true);

		/* update speed */
		bson::bo obj = db_client.findOne("toj.Status",
				BSON("username" << temp.user << "pid" << temp.pid << "speed" << 51));
		bool fast = false;
		if(obj.isEmpty()) fast = true;
		else {
			int time_used = boost::lexical_cast<int>(obj.getStringField("time_used"));
			int mem_used = boost::lexical_cast<int>(obj.getStringField("mem_used"));
			int now_tu = boost::lexical_cast<int>(tu);
			int now_mu = boost::lexical_cast<int>(mu);
			if(now_tu < time_used || (now_tu == time_used && now_mu < mem_used))
				fast = true;
		}
		if(fast) {
			db_client.update("toj.Status",
					BSON("username" << temp.user << "pid" << temp.pid),
					BSON("$set" << BSON("speed" << 50)),
					true, false);
			db_client.update("toj.Status",
					BSON("run_ID" << temp.runid),
					BSON("$set" << BSON("speed" << 51)),
					true, false);
		}
	}

	/* minjie update Problem */
	db_client.update("toj.Problem",
			BSON("pid" << temp.pid),
			BSON("$inc"<<BSON("total_submit"<<1)),
			false,true);
			//upsert,multi
	string dbresult;
	switch(result[0]) {
		case 'A': 	dbresult = "total_ac";
			  	break;
		case 'W': 	dbresult = "total_wa";
			  	break;
		case 'P': 	dbresult = "total_pe";
			  	break;
		case 'C': 	dbresult = "total_ce";
			  	break;
		case 'R': 	dbresult = "total_re";
			  	break;
		case 'T': 	dbresult = "total_tle";
			  	break;
		case 'M': 	dbresult = "total_mle";
			  	break;
		case 'O': 	dbresult = "total_ole";
			  	break;
		default:  	dbresult = "total_other";
			  	break;
	}

	db_client.update("toj.Problem",
			BSON("pid" << temp.pid),
			BSON("$inc"<<BSON(dbresult<<1)),
			false,true);
			//upsert,multi

	return true;
}

/*
   <type> 3
   <runid> 35533
   <memory_used> 0
   <time_used> 0
   <result> Wrong Answer
   __COMPILE-INFO-BEGIN-LABLE__

   __COMPILE-INFO-END-LABLE__
 */

void toBottFile(string runid,string tu,string mu,string result,string ce_info){
	/* minjie */
	db_client.update("toj.Status",
			BSON("run_ID" << temp.runid),
			BSON("$set" << BSON("result"<<result<<"time_used"<<tu<<"mem_used"<<mu<<"ce_info"<<ce_info)),
			true, false);

	FILE * fp=fopen(tfilename,"w+");
	fputs("<type> 3\n",fp);
	fprintf(fp,"<runid> %s\n",runid.c_str());
	fprintf(fp,"<memory_used> %s\n",mu.c_str());
	fprintf(fp,"<time_used> %s\n",tu.c_str());
	fprintf(fp,"<result> %s\n",result.c_str());
	fputs("__COMPILE-INFO-BEGIN-LABLE__\n",fp);
	fputs(ce_info.c_str(),fp);
	fputs("\n__COMPILE-INFO-END-LABLE__\n",fp);
	fclose(fp);
}

void judge(string pid,string lang,string runid,string src) {
	/* minjie*/
	db_client.insert("toj.Status",
			BSON("run_ID" << temp.runid << "result" << "Queuing" << "speed" << 50 << "submit_time" << temp.submit_time
				<< "pid"<<temp.pid<<"lang"<<lang<<"username"<<temp.user<<"code_len"<< covert(src.length())));

	db_client.insert("toj.Code", BSON("run_ID" << temp.runid << "code" << src));

	if (src.length()<15) {
		toBottFile(runid,"0","0","Compile Error","");
		return;
	}
	if (!login()) {
		writelog("Login error!\n");
		toBottFile(runid,"0","0","Judge Error","");
		return;
	}
	writelog("Logged in.\n");
	lang=corrlang[lang];
	if (!submit(pid,lang,src)) {
		writelog("Submit error!\n");
		toBottFile(runid,"0","0","Judge Error","");
		return;
	}
	writelog("Submitted.\n");
	string result,ce_info,tu,mu;
	if (!getStatus(pid,lang,result,ce_info,tu,mu)) {
		writelog("Get Error!\n");
		toBottFile(runid,"0","0","Judge Error","");
		return;
	};
	toBottFile(runid,tu,mu,result,ce_info);
}


int num;
int target;
char buffer[MAX_DATA_SIZE];
bool got_things;
int sockfd;
struct sockaddr_in server;

void send_register_info()
{
	write(sockfd,judger_string,sizeof(judger_string));
	//puts(judger_string);
	//sleep(1);
}

void writelog(char* log)
{
	FILE * fp=fopen(logfile,"a");
	if (fp!=NULL) {
		fprintf(fp,"%s",log);
		fclose(fp);
	}
}

void reconnect()
{
	//printf("REcon\n");
	writelog("ERROR in network connection!\n");
	writelog("Reconnecting...\n");
	close(sockfd);
	sockfd=socket(AF_INET,SOCK_STREAM,0);
	while (connect(sockfd,(struct sockaddr*)&server,sizeof(server))==-1) sleep(1);
	send_register_info();
	writelog("Successfully reconnected.\n");
	sleep(1);
}

void convert()
{
	/*	buffer format
	 *	poj 2 __SOURCE-CODE-BEGIN-LABLE__
	 *		source code here...
	 *	__SOSURCE-CODE-END-LABLE__
	 *	runid 
	 *	submit_time
	 *	pid lang user vid ss mm
	 */
	FILE *server_offer=fopen("temp.bott","r");
	int offer_type;
	char type_str[50];
	fscanf(server_offer,"%s %d\n",type_str,&offer_type);
	if (offer_type==NEED_JUDGE) {
		writelog("Received a judge request, ");
		fgets(buffer,MAX_DATA_SIZE,server_offer);
		memset(temp.src,0,sizeof(temp.src));
		while (fgets(buffer,MAX_DATA_SIZE,server_offer)&&strcmp(buffer,"__SOURCE-CODE-END-LABLE__\n")!=0)
			strcat(temp.src,buffer);
		char ts[20][50];
		/* minjie */
		fscanf(server_offer, "%d\n", &temp.runid);
		fgets(temp.submit_time, 50, server_offer);
		if(temp.submit_time[strlen(temp.submit_time)-1] == '\n')
			temp.submit_time[strlen(temp.submit_time)-1] = '\0';
		fscanf(server_offer, "%d%d%s%s%s%s", &temp.pid, &temp.lang, temp.user, temp.vid,ts[0],ts[1]);
		cout << temp.runid << endl << temp.submit_time << endl << temp.pid << endl << temp.lang<< endl << temp.user << endl << temp.vid << endl;

		//fscanf(server_offer,"%s%d%s%d%s%d%s%d%s%d%s%d%s%d%s%d%*s%s%*s%s",ts[0],&temp.runid,ts[1],&temp.lang,ts[2],
		//	&temp.pid,ts[3],&temp.number_of_cases,ts[4],&temp.time_limit,ts[5],&temp.case_limit,ts[6],
		//		&temp.memory_limit,ts[7],&temp.special_judge_status,temp.vname,temp.vid);
		fclose(server_offer);
		char templog[1000]={0};
		sprintf(templog,"runid:%d\n",temp.runid);
		writelog(templog);
		return;
	}
}

int main(int argc, char *argv[])
{
	int port_number;
	if (argc!=3) {
		printf("Illegal call!\nPlease follow the format below!\n%s <IP address> <port>\n",argv[0]);
		exit(1);
	}

	init();
	curl_global_init(CURL_GLOBAL_ALL);

	if ((sockfd=socket(AF_INET,SOCK_STREAM,0))==-1) {
		writelog("socket() error!\n");
		exit(1);
	}
	bzero(&server,sizeof(server));
	port_number=atoi(argv[2]);
	//port_number=5566;
	server.sin_family=AF_INET;
	server.sin_port=htons(port_number);
	server.sin_addr.s_addr=inet_addr(argv[1]);
	//server.sin_addr.s_addr=inet_addr("127.0.0.1");
	if (connect(sockfd,(struct sockaddr*)&server,sizeof(server))==-1)
	{
		writelog("connect() error!\n");
		exit(1);
	}
	writelog("Connected!\n");
	send_register_info();
	//return 0;
	/*getchar();
	  printf("After\n");*/
	char templog[3000]={0};
	FILE *target_file;
	while (1)
	{
		target_file=fopen("temp.bott","w");
		usleep(5000);
		got_things=false;
		while ((num=recv(sockfd,buffer,MAX_DATA_SIZE,MSG_DONTWAIT))>0)
		{
			got_things=true;
			fputs(buffer,target_file);
			/* minjie */
			printf("buffer = %s\n", buffer);
		}
		fclose(target_file);
		if (num==0) reconnect();
		//printf("%d\n",num);
		//writelog("test");
		if (got_things) {
			writelog("Received a command.\n\n");
			convert();
			//void judge(string pid,string lang,string runid)
			judge(temp.vid,covert(temp.lang),covert(temp.runid),temp.src);
			sprintf(templog,"Sending result of runid:%d\n",temp.runid);
			writelog(templog);
			int source=open(tfilename,O_RDONLY);
			memset(buffer,0,sizeof(buffer));
			while((num=read(source,buffer,sizeof(buffer)))>0) {
				write(sockfd,buffer,num);
				//printf("%s\n",buffer);
			}
			close(source);
			// write(sockfd,"__BOTT_FILE_OVER_LABLE__",24);
			writelog("Sent.\n\n");
		}
	}

	return 0;
}
