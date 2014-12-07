/*__________________________________________________
|               LiveBoxRemote v2.1                  |
|                                                   |
| Authors : Phil Bri ( 12/2014 )                    |
|    (See http://encausse.wordpress.com/s-a-r-a-h/) |
| Description :                                     |
|    Orange TV Decoder Plugin for SARAH project     |
|___________________________________________________|
*/

var LiveBoxIP;

exports.init = function ( SARAH ) {
	var 	config = SARAH.ConfigManager.getConfig();

	if (( /^autodetect$/i ).test( config.modules.liveboxremote.livebox_IP ) == false ) {
		return LiveBoxIP = config.modules.liveboxremote.livebox_IP;
	}

	// Configure ip autodetection : (Auto Detect Plugin)
	if ( ! SARAH.context.liveboxremote ) {
		fsearch();

		SARAH.listen ( 'autodetect', function ( data ) {

			if ( data.from != 'LiveBoxRemote' ) fsearch();
			else
			{
				if ( LiveBoxIP ) console.log ( '\r\nLiveBoxRemote => Livebox IP = ' + LiveBoxIP + ' (Auto Detect Plugin)');
				else console.log ( '\r\nLiveBoxRemote => LiveBox non trouvée (Auto Detect Plugin)' );
				SARAH.context.flag = false;
			}
		});
	}

	function fsearch () {
		if ( SARAH.context.flag != true ) {
			SARAH.context.flag = true;

			findLB = require( './lib/findLB.js') ( 'livebox', 'UHD', function ( RetIP ) {
				SARAH.context.liveboxremote = { 'ip' : RetIP };
				LiveBoxIP = SARAH.context.liveboxremote.ip;
				SARAH.trigger ( 'autodetect', { 'from' : 'LiveBoxRemote' });
			});
		}
	}
}

exports.action = function ( data , callback , config , SARAH ) {

	var 	cmdArray = data.LBCode.split (',');
	var 	myReg = ( /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/ );
	
	if ( ! myReg.test(LiveBoxIP) && ! myReg.test( config.modules.liveboxremote.livebox_IP )) { 
		return callback ({ 'tts' : 'Live box non trouvée' }) }

	sendLiveBox ( cmdArray );

	function sendLiveBox ( cmdArray ) {

		// Configure the request : NOTE -> The {qs} option add { ?operation=01&key=[LBCmd[123]]&mode=[LBCmd[5]] } at the end of {url}
		var 	LBCmd 	= cmdArray.shift(),
			request 	= require ( 'request' ),
			options 	= 	{	url	: 'http://' + LiveBoxIP + ':8080/remoteControl/cmd',
							qs	: { 'operation' : '01', 'key' : LBCmd.substr (0,3) , 'mode' : LBCmd.substr (4,1) }
						}

		request( options , function ( error , response , body ) {

			if ( ! error && response.statusCode == 200 ) {

				if ( cmdArray.length ) sendLiveBox ( cmdArray );

    				console.log ( '\r\nLiveBoxRemote => Commande : ' + data.LBCode + ' = OK' );
    				callback ({ 'tts' : data.ttsAction });
 
    			} else callback ({ 'tts' : 'Erreur commande live box' });
    		});
	}
}
