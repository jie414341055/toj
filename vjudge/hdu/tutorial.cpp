//tutorial.cpp

/*    Copyright 2009 10gen Inc.
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

#include <iostream>
#include "mongo/client/dbclient.h"

// g++ src/mongo/client/examples/tutorial.cpp -pthread -Isrc -Isrc/mongo -lmongoclient -lboost_thread-mt -lboost_system -lboost_filesystem -L[path to libmongoclient.a] -o tutorial
//g++ tutorial.cpp -L[mongo directory] -L/opt/local/lib -lmongoclient -lboost_thread-mt -lboost_filesystem -lboost_system -I/opt/local/include  -o tutorial

using namespace mongo;

void run() {
	DBClientConnection c;
	c.connect("localhost"); //"192.168.58.1");

	auto_ptr<DBClientCursor> cursor = c.query("toj.Status",
			mongo::Query().sort("Run ID",-1),1,0);
	std::cout << cursor->next().getIntField("Run ID") << std::endl;
}

int main() {
	try {
		run();
	}
	catch( DBException &e ) {
		cout << "caught " << e.what() << endl;
	}
	return 0;
}
