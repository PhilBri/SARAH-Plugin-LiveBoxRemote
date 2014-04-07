/*__________________________________________________
| LiveBoxRemote V 0.9								|
| Plugin pour S.A.R.A.H. 							|
| ( By Phil Bri 04/2014 )							|
|___________________________________________________|
*/

exports.action = function ( data , callback , config , SARAH ) {

	// Config & test IP
	config = config.modules.liveboxremote;

	if ( !config.LiveBoxIP ) {
		console.log ( 'Missing LiveBox IP in liveboxremote.prop !' );
		callback 	({ 'tts' : 'Adresse I P absente' });
		return;
	}

	var cmdArray = data.LBCode.split(',');

	sendLiveBox ( cmdArray );

	function sendLiveBox ( cmdArray ) {

		// Configure the request : NOTE -> The {qs} option add { ?operation=01&key=[LBCmd[123]]&mode=[LBCmd[5]] } at the end of {url}
		var LBCmd 	= cmdArray.shift();
		var request = require ( 'request' );
		var options = {	url     : 	'http://' + config.LiveBoxIP + ':8080/remoteControl/cmd',
    					qs      : { 'operation'	: '01', 'key' : LBCmd.substr(0,3) , 'mode' : LBCmd.substr(4,1) }
		}

		// Start the request
		request( options , function ( error , response , body ) {
    			if ( !error && response.statusCode == 200 ) {
    				if ( cmdArray.length ) { sendLiveBox(cmdArray) }
        			console.log ( 'LiveBox Cmd : ' + data.LBCode + ' = OK' );
				callback ({ 'tts': data.ttsAction });
    			} else {
				callback ({ 'tts': 'erreur commande box' });
    			}
		});
	}	
}
