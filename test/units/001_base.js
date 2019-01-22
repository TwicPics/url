"use strict";

const url = require( `../..` );

const tests = {};

const rAuth = /auth:/;
const rHost = /^([^:]+:\/\/)?/;
const rQuery = /^([^?]*)(\?.*)?$/;

const addTest = ( method, _expected, ...args ) => {
    const testName = method ? `url.${ method }(${ JSON.stringify( args ).slice( 1, -1 ) })` : _expected;
    if ( _expected === Error ) {
        tests[ `${ testName } => Error` ] = assert => {
            assert.expect( 1 );
            assert.throws( () => {
                url[ method ]( ...args );
            } );
            assert.done();
        };
    } else {
        const [ , expected, query = `` ] = rQuery.exec( _expected );
        const host =
            ( ( method === `host` ) ? args[ 0 ] : `i.twic.pics` ).replace( rHost, ( _, p ) => p || `https://` );
        const expectedClassic = `${ host }/v1/${ expected ? `${ expected }/` : `` }http://URL${ query }`;
        tests[ `${ testName } - classic API => "${ expectedClassic }"` ] = assert => {
            assert.expect( 2 );
            const newUrl = method ? url[ method ]( ...args ) : url.src( `<tmp>` );
            assert.notStrictEqual( url, newUrl, `call creates a new object` );
            assert.strictEqual( newUrl.src( `http://URL${ query }` ).url(), expectedClassic, expectedClassic );
            assert.done();
        };
        if ( !rAuth.test( expected ) ) {
            const expectedCatchAll = `${ host }/PATH${ expected ? `?v1/${ expected }` : `` }${ query }`;
            tests[ `${ testName } - catch-all API => "${ expectedCatchAll }"` ] = assert => {
                assert.expect( 2 );
                const newUrl = method ? url[ method ]( ...args ) : url.src( `<tmp>` );
                assert.notStrictEqual( url, newUrl, `call creates a new object` );
                assert.strictEqual( newUrl.src( `PATH${ query }` ).url(), expectedCatchAll, expectedCatchAll );
                assert.done();
            };
            if ( query ) {
                const expectedCatchAllNP = `${ host }/${ expected ? `?v1/${ expected }` : `` }${ query }`;
                tests[ `${ testName } - catch-all API => "${ expectedCatchAllNP }"` ] = assert => {
                    assert.expect( 2 );
                    const newUrl = method ? url[ method ]( ...args ) : url.src( `<tmp>` );
                    assert.notStrictEqual( url, newUrl, `call creates a new object` );
                    assert.strictEqual( newUrl.src( query ).url(), expectedCatchAllNP, expectedCatchAllNP );
                    assert.done();
                };
            }
        }
    }
};

addTest( false, `?y=10` );

addTest( `auth`, `auth:aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`, `aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa` );
addTest( `auth`, Error, `not-a-valid-token` );
addTest( `auth`, Error );

addTest( `background`, Error, false );
addTest( `background`, Error, true );
addTest( `background`, Error, 0 );
addTest( `background`, Error, `` );
addTest( `background`, ``, null );

addTest( `format`, Error );
addTest( `format`, Error, true );
addTest( `format`, Error, false );
addTest( `format`, Error, `unknown` );
addTest( `format`, ``, null );
addTest( `format`, ``, undefined );

for ( const format of [ `jpeg`, `png`, `webp` ] ) {
    addTest( `format`, `format=${ format }`, format );
    addTest( format, `format=${ format }` );
}

const rUnCamel = /[A-Z]/g;

for ( const qualityMethod of [ `quality`, `qualityMax`, `qualityMin` ] ) {
    const nameInUrl = qualityMethod.replace( rUnCamel, letter => `-${ letter.toLowerCase() }` );
    addTest( qualityMethod, `${ nameInUrl }=25`, 25 );
    addTest( qualityMethod, `${ nameInUrl }=30`, `30` );
    addTest( qualityMethod, Error );
    addTest( qualityMethod, Error, false );
    addTest( qualityMethod, Error, 0 );
    addTest( qualityMethod, Error, `0` );
    addTest( qualityMethod, Error, 20.3 );
    addTest( qualityMethod, Error, `20.3` );
    addTest( qualityMethod, Error, 101 );
    addTest( qualityMethod, Error, `101` );
}

for ( const resizer of [
    `contain`,
    `containMax`,
    `containMin`,
    `cover`,
    `coverMax`,
    `coverMin`,
    `crop`,
    `max`,
    `min`,
    `resize`,
    `resizeMax`,
    `resizeMin`,
    `step`,
] ) {
    const nameInUrl = resizer.replace( rUnCamel, letter => `-${ letter.toLowerCase() }` );
    addTest( resizer, `${ nameInUrl }=W`, `W` );
    addTest( resizer, `${ nameInUrl }=W`, {
        "width": `W`,
    } );
    addTest( resizer, `${ nameInUrl }=WxH`, `W`, `H` );
    addTest( resizer, `${ nameInUrl }=WxH`, {
        "width": `W`,
        "height": `H`,
    } );
    addTest( resizer, `${ nameInUrl }=-xH`, null, `H` );
    addTest( resizer, `${ nameInUrl }=-xH`, {
        "height": `H`,
    } );
    addTest( resizer, Error );
    addTest( resizer, Error, {} );
}

addTest( `crop`, `crop=WxH@XxY`, `W`, `H`, `X`, `Y` );
addTest( `crop`, `crop=WxH@XxY`, {
    "width": `W`,
    "height": `H`,
    "x": `X`,
    "y": `Y`,
} );
addTest( `crop`, `crop=W@XxY`, `W`, null, `X`, `Y` );
addTest( `crop`, `crop=W@XxY`, {
    "width": `W`,
    "x": `X`,
    "y": `Y`,
} );
addTest( `crop`, `crop=-xH@XxY`, null, `H`, `X`, `Y` );
addTest( `crop`, `crop=-xH@XxY`, {
    "height": `H`,
    "x": `X`,
    "y": `Y`,
} );
addTest( `crop`, `crop=WxH@X`, `W`, `H`, `X` );
addTest( `crop`, `crop=WxH@X`, {
    "width": `W`,
    "height": `H`,
    "x": `X`,
} );
addTest( `crop`, `crop=W@X`, `W`, null, `X` );
addTest( `crop`, `crop=W@X`, {
    "width": `W`,
    "x": `X`,
} );
addTest( `crop`, `crop=-xH@X`, null, `H`, `X` );
addTest( `crop`, `crop=-xH@X`, {
    "height": `H`,
    "x": `X`,
} );
addTest( `crop`, `crop=WxH@-xY`, `W`, `H`, null, `Y` );
addTest( `crop`, `crop=WxH@-xY`, {
    "width": `W`,
    "height": `H`,
    "y": `Y`,
} );
addTest( `crop`, `crop=W@-xY`, `W`, null, null, `Y` );
addTest( `crop`, `crop=W@-xY`, {
    "width": `W`,
    "y": `Y`,
} );
addTest( `crop`, `crop=-xH@-xY`, null, `H`, null, `Y` );
addTest( `crop`, `crop=-xH@-xY`, {
    "height": `H`,
    "y": `Y`,
} );

addTest( `focus`, `focus=X`, `X` );
addTest( `focus`, `focus=X`, {
    "x": `X`,
} );
addTest( `focus`, `focus=-xY`, null, `Y` );
addTest( `focus`, `focus=-xY`, {
    "y": `Y`,
} );
addTest( `focus`, `focus=XxY`, `X`, `Y` );
addTest( `focus`, `focus=XxY`, {
    "x": `X`,
    "y": `Y`,
} );
addTest( `focus`, Error );
addTest( `focus`, Error, {} );

const str = len => ( new Array( len + 1 ).join( `a` ) );

addTest( `host`, Error );
addTest( `host`, Error, 25 );
addTest( `host`, Error, `à` );
addTest( `host`, Error, `http://à` );
addTest( `host`, Error, `ftp://localhost` );
addTest( `host`, Error, str( 64 ) );
const max = str( 63 );
addTest( `host`, Error, [ max, max, max, str( 62 ) ].join( `.` ) );
addTest( `host`, Error, `a:65536` );
addTest( `host`, ``, `sub.twic.pics` );
addTest( `host`, ``, `http://sub.twic.pics` );
addTest( `host`, ``, `localhost:666` );

addTest( `src`, Error );
addTest( `src`, Error, 15 );

addTest( `url`, Error );

module.exports = tests;
