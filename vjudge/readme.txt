gcc -c entities.c -std=c99
g++ -o hdu hdu.cc entities.o -lcurl -w


#on mac os
g++ -o hdu hdu.cc entities.o -lcurl -w -liconv

#new in ubuntu with mongo
sudo g++ -o hdu hdu.cc entities.o -lcurl -I /usr/local/mongo_cxx/src -L /usr/local/mongo_cxx -L /usr/local/lib -pthread -lmongoclient -lboost_thread -lboost_filesystem -lboost_program_options -lboost_system -w

