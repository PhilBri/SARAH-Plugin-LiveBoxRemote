var findUPNP = function ( findName, findModel,  callback ) {

    var timer       = null,
        dgram       = require ( "dgram" ),
        socket      = dgram.createSocket ( 'udp4' ),
        findFlag    = false;
    
    socket.bind ();

    socket.on ( 'listening', function () {

        socket.setBroadcast ( true );
        socket.setMulticastTTL (4);
        socket.addMembership ( '239.255.255.250', 'localhost' );

        var udpSend = new Buffer (
            "M-SEARCH * HTTP/1.1\r\n" +
            "HOST: 239.255.255.250:1900\r\n" +
            "MAN: \"ssdp:discover\"\r\n" +
            "MX: 5\r\n" +
            "ST: ssdp:all\r\n\r\n"
        );

        socket.send ( udpSend, 0, udpSend.length, 1900, '239.255.255.250', function () {
            
            timer = setTimeout ( function () {
                if ( findFlag == false ) { callback ('') }
                socket.close();
            }, 5000 );
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

                if ( chunk.search ( findModel ) != -1 && chunk.search ( findName ) != -1 && findFlag != true ) {
                    findFlag = true;
                    callback ( myRegIp[1] );
                 }
            });

            res.on ( 'error', function (err) { callback ( 'Request error : ' + err.message ) });
        });
    });

    socket.on ( 'error', function ( err ) { callback ( 'Socket error : ' + err.message ) });
};

module.exports = findUPNP;
