/*__________________________________________________
| LiveBoxRemote V 2.0 								|
| Plugin pour S.A.R.A.H.							|
| ( By Phil Bri 04/2014 )							|
|___________________________________________________|
*/

var LiveBoxIP;

exports.init = function ( SARAH ) {

	var findAdrs = require ( './lib/findUPNP.js' );

	findAdrs( 'livebox', 'UHD', function ( BoxIP ) {
		if ( !BoxIP ) { return console.log ( '\r\nLiveBoxRemote => LiveBox non trouvée\r\n' ) }
		LiveBoxIP = BoxIP;
		console.log ( '\r\nLiveBoxRemote => Livebox IP = ' + LiveBoxIP + ' (Auto Détection)\r\n');
	});
}

exports.action = function ( data , callback , config , SARAH ) {
	
	if ( LiveBoxIP == undefined ) { return callback ({ 'tts' : 'Live box non trouvée' }) }

	var cmdArray = data.LBCode.split (',');

	sendLiveBox ( cmdArray );

	function sendLiveBox ( cmdArray ) {

		// Configure the request : NOTE -> The {qs} option add { ?operation=01&key=[LBCmd[123]]&mode=[LBCmd[5]] } at the end of {url}
		var LBCmd 	= cmdArray.shift();
		var request = require ( 'request' );
		var options = 	{	url	: 	'http://' + LiveBoxIP + ':8080/remoteControl/cmd',
							qs	: { 'operation'	: '01', 'key' : LBCmd.substr (0,3) , 'mode' : LBCmd.substr (4,1) }
						}

		request( options , function ( error , response , body ) {

			if ( !error && response.statusCode == 200 ) {

				if ( cmdArray.length ) {
					sendLiveBox ( cmdArray );
    			}

    			console.log ( '\r\nLiveBoxRemote => Cmd : ' + data.LBCode + ' = OK\r\n' );
    			callback ({ 'tts': data.ttsAction });

    		} else {
    			callback ({ 'tts': 'Erreur commande live box' });
    		}
    	});
	}	
}
