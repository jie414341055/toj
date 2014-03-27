#ifndef HDUHANDLER_H_INCLUDED
#define HDUHANDLER_H_INCLUDED

#include "mongo/client/dbclient.h"
#include <unistd.h>
#include <stdio.h>
#include <string>
#include <string.h>
#include <time.h>
#include <stdlib.h>
#include <iostream>
#include <map>
#include <vector>


using namespace std;
using namespace mongo;

DBClientConnection db_client;

void init() {

    //open database
    db_client.connect("localhost"); //127.0.0.1
}

#endif // HDUHANDLER_H_INCLUDED
