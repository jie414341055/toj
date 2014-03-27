#include "test.h"

int main() {
	init();
	bson::bo obj = db_client.findOne("toj.Status",
		BSON("username" << "minjie" << "result" << "Accepted")
		);
	if(obj.isEmpty()) puts("Yes");
	else puts("No");
	int time_used = atoi(obj.getStringField("time_used")) ;
	int mem_used = atoi(obj.getStringField("mem_used")) ;
	cout << time_used <<  " " << mem_used << endl;

	
}
