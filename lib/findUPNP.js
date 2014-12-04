var EventEmitter = require ( 'events' ).EventEmitter;

var findLB = function ( findName, findModel,  callback ) {

    var dgram       = require ( "dgram" ),
        socket      = dgram.createSocket ( 'udp4' ),
        findFlag    = false;
    
    socket.bind ();

    socket.on ( 'listening', function () {

        socket.setBroadcast ( true );
        socket.setMulticastTTL ( 16 );
        socket.addMembership ( '239.255.255.250', 'localhost' );

        var udpSend = new Buffer (  "M-SEARCH * HTTP/1.1\r\n" +
                                    "HOST: 239.255.255.250:1900\r\n" +
                                    "MAN: \"ssdp:discover\"\r\n" +
                                    "MX: 5\r\n" +
                                    "ST: ssdp:all\r\n\r\n" );

        socket.send ( udpSend, 0, udpSend.length, 1900, '239.255.255.250', function () {

            setTimeout ( function () { socket.emit ( 'notfind', 'Livebox') }, 6000 );
        });
    });

    socket.on ( 'message', function ( msg, rinfo ) {

        var http        = require ( 'http' ),
            myRegIp     = new RegExp ( '\/\/(.*?):' ).exec( msg ),
            myRegHttp   = new RegExp ( 'LOCATION:(.*$)', 'mi' ).exec( msg );

        if ( !myRegHttp ) { return }

        var req = http.get ( myRegHttp[1], function ( res ) {
            res.setEncoding ( 'utf-8' );
            res.on ( 'data', function ( chunk ) {

                if ( chunk.search ( findModel ) != -1 && chunk.search ( findName ) != -1 ) {

                    socket.emit ( 'autodetect', myRegIp[1] );
                }             
            });

            res.on ( 'error', function ( err ) { callback ( 'Request error : ' + err.message ) });
        });
    });

    socket.once ( 'autodetect', function ( retIP ) {
        socket.close();
        findFlag = true;
        callback ( retIP );
    });

    socket.on ( 'notfind', function () { if ( !findFlag ) { callback ('') }});

    socket.on ( 'error', function ( err ) { callback ( 'Socket error : ' + err.message ) });

};

module.exports = findLB;
