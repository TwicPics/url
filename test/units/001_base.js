"use strict";

const url = require( `../..` );

const tests = {};

const rAuth = /auth:/;

const addTest = ( method, expected, ...args ) => {
    const testName = `url.${ method }(${ JSON.stringify( args ).slice( 1, -1 ) })`;
    if ( expected === Error ) {
        tests[ `${ testName } => Error` ] = assert => {
            assert.expect( 1 );
            assert.throws( () => {
                url[ method ]( ...args );
            } );
            assert.done();
        };
    } else {
        const expectedClassic = `https://i.twic.pics/v1/${ expected ? `${ expected }/` : `` }http://<END>`;
        tests[ `${ testName } - classic API => "${ expected }"` ] = assert => {
            assert.expect( 2 );
            const newUrl = url[ method ]( ...args );
            assert.notStrictEqual( url, newUrl, `call creates a new object` );
            assert.strictEqual( newUrl.src( `http://<END>` ).url(), expectedClassic, expectedClassic );
            assert.done();
        };
        if ( !rAuth.test( expected ) ) {
            const expectedCatchAll = `https://i.twic.pics/<END>${ expected ? `?v1/${ expected }` : `` }`;
            tests[ `${ testName } - catch-all API => "${ expected }"` ] = assert => {
                assert.expect( 2 );
                const newUrl = url[ method ]( ...args );
                assert.notStrictEqual( url, newUrl, `call creates a new object` );
                assert.strictEqual( newUrl.src( `<END>` ).url(), expectedCatchAll, expectedCatchAll );
                assert.done();
            };
        }
    }
};

addTest( `auth`, `auth:aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`, `aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa` );
addTest( `auth`, Error, `not-a-valid-token` );
addTest( `auth`, Error );

for ( const format of [ `jpeg`, `png`, `webp` ] ) {
    addTest( `format`, `format=${ format }`, format );
    addTest( `format`, `format=${ format }`, {
        "type": format,
    } );
    addTest( `format`, `quality=80/format=${ format }`, format, 80 );
    addTest( `format`, `quality=80/format=${ format }`, {
        "quality": 80,
        "type": format,
    } );
    addTest( format, `format=${ format }` );
    addTest( format, `quality=80/format=${ format }`, 80 );
    addTest( `format`, Error, format, 0 );
    addTest( `format`, Error, format, 101 );
    addTest( format, Error, 0 );
    addTest( format, Error, 101 );
}

addTest( `format`, Error, `unknown` );
addTest( `format`, Error, {
    "type": `unknown`,
} );
addTest( `format`, Error );
addTest( `format`, Error, {} );
addTest( `format`, Error, null, 80 );
addTest( `format`, Error, {
    "quality": 80,
} );

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
addTest( `host`, ``, `i.twic.pics` );
addTest( `host`, ``, `https://i.twic.pics` );

addTest( `src`, Error );
addTest( `src`, Error, 15 );

addTest( `url`, Error );

module.exports = tests;
