gcc -c entities.c -std=c99
g++ -o hdu hdu.cc entities.o -lcurl -w


#on mac os
g++ -o hdu hdu.cc entities.o -lcurl -w -liconv
