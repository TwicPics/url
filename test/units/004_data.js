"use strict";

const url = require( `../..` );

const tests = {};

const addTests = ( method, group ) => group.forEach( data => {
    const [ title, pre, expected, ...args ] = data;
    const testName = `${ method } - ${ title }`;
    if ( expected === Error ) {
        tests[ `${ testName } => Error` ] = assert => {
            assert.expect( 1 );
            assert.throws( () => {
                pre()[ method ]( ...args );
            } );
            assert.done();
        };
    } else {
        tests[ `${ testName } => ${ JSON.stringify( expected ) }` ] = assert => {
            assert.expect( 1 );
            const result = pre()[ method ]( ...args );
            if ( typeof expected === `object` ) {
                assert.deepEqual( result, expected );
            } else {
                assert.strictEqual( result, expected );
            }
            assert.done();
        };
    }
} );

addTests( `dataFocus`, [
    [ `no focus`, () => url, `` ],
    [ `focus first`, () => url.focus( 30, 40 ), `30x40` ],
    [ `focus after resize`, () => url.resize( 50 ).focus( 30, 40 ), `` ],
    [ `focus after format`, () => url.webp().focus( 30, 40 ), `30x40` ],
] );

addTests( `dataSrc`, [
    [ `no src`, () => url, Error ],
    [ `no protocol`, () => url.src( `path/to/image` ), `image:path/to/image` ],
    [ `with protocol`, () => url.src( `proto:path/to/image` ), `proto:path/to/image` ],
    [
        `no protocol + authent`,
        () => url.auth( `aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa` ).src( `path/to/image` ),
        `image:path/to/image`,
    ],
    [
        `with protocol + authent`,
        () => url.auth( `aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa` ).src( `proto:path/to/image` ),
        `auth:aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/proto:path/to/image`,
    ],
] );

addTests( `dataTransform`, [
    [ `nothing`, () => url, `` ],
    [ `resize`, () => url.resize( 300 ), `resize=300` ],
    [ `background`, () => url.background( `<color>` ), `background=<color>` ],
    [ `format`, () => url.png(), `format=png` ],
    [ `background & resize`, () => url.background( `<color>` ).resize( 300 ), `resize=300/background=<color>` ],
    [ `format & resize`, () => url.png().resize( 300 ), `resize=300/format=png` ],
    [
        `background, format & resize`,
        () =>
            url
                .background( `<color>` )
                .png()
                .resize( 300 ),
        `resize=300/background=<color>/format=png`,
    ],
    [
        `format, background & resize`,
        () =>
            url
                .png()
                .background( `<color>` )
                .resize( 300 ),
        `resize=300/background=<color>/format=png`,
    ],
    [ `focus first (-)`, () => url.focus( 30, 40 ), `` ],
    [ `focus first (true)`, () => url.focus( 30, 40 ), `focus=30x40`, true ],
    [ `focus second (-)`, () => url.resize( 300 ).focus( 30, 40 ), `resize=300/focus=30x40` ],
    [ `focus second (asked)`, () => url.resize( 300 ).focus( 30, 40 ), `resize=300/focus=30x40`, true ],
] );

addTests( `dataAttributes`, [
    [ `wrong type`, () => url.src( `something` ), Error, `unknown` ],
    [
        `src`,
        () => url
            .focus( 30, 40 )
            .resize( 55 )
            .src( `dir/my-image.png` ),
        {
            "data-src": `image:dir/my-image.png`,
            "data-src-focus": `30x40`,
            "data-src-transform": `resize=55`,
        },
    ],
    [
        `background`,
        () => url
            .focus( 30, 40 )
            .resize( 55 )
            .src( `dir/my-image.png` ),
        {
            "data-background": `url("image:dir/my-image.png")`,
            "data-background-focus": `30x40`,
            "data-background-transform": `resize=55`,
        },
        `background`,
    ],
] );

module.exports = tests;
