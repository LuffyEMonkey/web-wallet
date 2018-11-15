const config = require( 'config.json' );

let _regenerator = require( 'babel-runtime/regenerator' );

let _regenerator2 = _interopRequireDefault( _regenerator );

let _asyncToGenerator2 = require( 'babel-runtime/helpers/asyncToGenerator' );

let _asyncToGenerator3 = _interopRequireDefault( _asyncToGenerator2 );

let generateTestPair = function () {
	let _ref2 = (0, _asyncToGenerator3.default)( _regenerator2.default.mark( function _callee() {
		let pair;
		return _regenerator2.default.wrap( function _callee$( _context ) {
			while ( 1 ) {
				switch ( _context.prev = _context.next ) {
					case 0:
						pair = Stellar.Keypair.random();
						_context.prev = 1;
						_context.next = 4;
						return fetch( config.api_url + '/friendbot?addr=' + pair.publicKey() );

					case 4:
						return _context.abrupt( 'return', pair );

					case 7:
						_context.prev = 7;
						_context.t0 = _context[ 'catch' ]( 1 );
						throw _context.t0;

					case 10:
					case 'end':
						return _context.stop();
					default:
				}
			}
		}, _callee, this, [ [ 1, 7 ] ] );
	} ) );

	return function generateTestPair() {
		return _ref2.apply( this, arguments );
	};
}();

function _interopRequireDefault( obj ) {
	return obj && obj.__esModule ? obj : { default: obj };
}

let Stellar = require( 'libs/stellar-sdk' );
let fetch = require( 'isomorphic-fetch' );

let _require = require( './StellarTools' ),
	augmentAccount = _require.augmentAccount;

let Server = void 0;

let getServerInstance = function getServerInstance() {
	return Server;
};

let getAccount = function getAccount( accountId ) {

  return fetch(`http://conall.co.kr:12345/api/v1/accounts/${accountId}`, {
    method: 'GET',
    timeout: 3000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
};

let switchNetwork = function switchNetwork( network ) {
	switch ( network ) {
		case 'public':
			Server = new Stellar.Server( config.api_url );
			Stellar.Network.usePublicNetwork();
			break;
		default:
		case 'test':
			Server = new Stellar.Server( config.api_url );
			Stellar.Network.useTestNetwork();
			break;
	}
};

function setServer( _ref ) {
	let url = _ref.url,
		_ref$type = _ref.type,
		type = _ref$type === undefined ? 'test' : _ref$type,
		_ref$options = _ref.options,
		options = _ref$options === undefined ? {} : _ref$options;

	Server = new Stellar.Server( url, options );
	if ( type === 'public' ) {
		Stellar.Network.usePublicNetwork();
	} else {
		Stellar.Network.useTestNetwork();
	}
}

switchNetwork();

module.exports = {
	switchNetwork: switchNetwork,
	setServer: setServer,
	getServerInstance: getServerInstance,
	getAccount: getAccount,
	generateTestPair: generateTestPair
};