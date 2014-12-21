/*__________________________________________________
|               LiveBoxRemote v2.1                  |
|                                                   |
| Authors : Phil Bri ( 12/2014 )                    |
|    (See http://encausse.wordpress.com/s-a-r-a-h/) |
| Description :                                     |
|    Orange TV Decoder Plugin for SARAH project     |
|___________________________________________________|
*/

exports.init = function ( SARAH ) {
	var config = SARAH.ConfigManager.getConfig();

    if ( /^autodetect$/i.test( config.modules.liveboxremote.Livebox_IP ) == false ) return console.log('LiveBoxRemote => Autodetect [OFF]');

	// Configure ip autodetection : (Auto Detect Plugin)

    if ( !SARAH.context.liveboxremote ) {
        fsearch();

        SARAH.listen ( 'autodetect', function ( data ) {
            if ( data.from != 'LiveBoxRemote' ) fsearch();
            else {

                if ( SARAH.context.liveboxremote.ip ) console.log ( '\r\nLiveboxRemote => Autodetect [ON] : ip = ' + SARAH.context.liveboxremote.ip );
                else console.log ( '\r\nLiveboxRemote => Autodetect [ON] : ip non trouvée !' );
                SARAH.context.flag = false;
            }
        });
	}

	function fsearch () {

        if ( SARAH.context.flag != true ) {
            SARAH.context.flag = true;

            findBR = require ( './lib/findLB.js' ) ( 'livebox', 'UHD', function ( RetIP ) {
                SARAH.context.liveboxremote = { 'ip' : RetIP };
                SARAH.trigger ( 'autodetect', { 'from' : 'LiveBoxRemote' });
            });
        }
	}
}

exports.action = function ( data , callback , config , SARAH ) {

	var	cmdArray = data.LBCode.split (','),
		myReg = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/,
		LiveBoxIP;

    if ( typeof(SARAH.context.liveboxremote) != 'undefined' ) LiveBoxIP = SARAH.context.liveboxremote.ip
    else if ( myReg.test( config.modules.liveboxremote.Livebox_IP ) == true ) LiveBoxIP = config.modules.liveboxremote.Livebox_IP
    else return callback ({ 'tts' : 'Live box  non trouvée' })

	sendLiveBox ( cmdArray );

	function sendLiveBox ( cmdArray ) {

		// Configure the request : NOTE -> The {qs} option add { ?operation=01&key=[LBCmd[123]]&mode=[LBCmd[5]] } at the end of {url}
		var LBCmd 		= 	cmdArray.shift(),
			request 	= 	require ( 'request' ),
			options 	= 	{	url	: 'http://' + LiveBoxIP + ':8080/remoteControl/cmd',
								qs	: { 'operation' : '01', 'key' : LBCmd.substr (0,3) , 'mode' : LBCmd.substr (4,1) }
							}

		request( options , function ( error , response , body ) {

			if ( ! error && response.statusCode == 200 ) {

				if ( cmdArray.length ) sendLiveBox ( cmdArray );

    				console.log ( '\r\nLiveBoxRemote => Commande : "' + data.LBCode + '" = OK' );
    				callback ({ 'tts' : data.ttsAction });
 
    			} else callback ({ 'tts' : 'Erreur commande live box' });
    		});
	}
}
