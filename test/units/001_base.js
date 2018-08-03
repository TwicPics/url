"use strict";

const url = require( `../..` );

const tests = {};

const addTest = ( method, expected, ...args ) => {
    const testName = `${ method }(${ JSON.stringify( args ).slice( 1, -1 ) })`;
    if ( expected === Error ) {
        tests[ testName ] = assert => {
            assert.expect( 1 );
            assert.throws( () => {
                url[ method ]( ...args );
            } );
            assert.done();
        };
    } else {
        // eslint-disable-next-line no-param-reassign
        expected = `https://i.twic.pics/v1/${ expected }/<END>`;
        tests[ testName ] = assert => {
            assert.expect( 2 );
            const newUrl = url[ method ]( ...args );
            assert.notStrictEqual( url, newUrl, `call creates a new object` );
            assert.strictEqual( newUrl.src( `<END>` ).url(), expected, expected );
            assert.done();
        };
    }
};

addTest( `auth`, `auth:aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`, `aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa` );
addTest( `auth`, Error, `not-a-valid-token` );
addTest( `auth`, Error );

addTest( `format`, `format=jpeg`, `jpeg` );
addTest( `format`, `format=jpeg`, {
    "type": `jpeg`,
} );
addTest( `format`, `format=jpeg-80`, `jpeg`, 80 );
addTest( `format`, `format=jpeg-80`, {
    "quality": 80,
    "type": `jpeg`,
} );
addTest( `format`, `format=png`, `png` );
addTest( `format`, `format=png`, {
    "type": `png`,
} );
addTest( `format`, Error, `png`, 80 );
addTest( `format`, Error, {
    "quality": 80,
    "type": `png`,
} );
addTest( `format`, `format=webp`, `webp` );
addTest( `format`, `format=webp`, {
    "type": `webp`,
} );
addTest( `format`, `format=webp-80`, `webp`, 80 );
addTest( `format`, `format=webp-80`, {
    "quality": 80,
    "type": `webp`,
} );
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

addTest( `jpeg`, `format=jpeg` );
addTest( `jpeg`, `format=jpeg-80`, 80 );
addTest( `png`, `format=png` );
addTest( `png`, `format=png`, 80 );
addTest( `webp`, `format=webp` );
addTest( `webp`, `format=webp-80`, 80 );

const rUnCamel = /[A-Z]/g;

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

addTest( `url`, Error );

module.exports = tests;
