/* eslint-disable max-lines */
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

addTest( `dpr`, Error );
addTest( `dpr`, Error, false );
addTest( `dpr`, Error, true );
addTest( `dpr`, Error, 0 );
addTest( `dpr`, Error, `` );
addTest( `dpr`, Error, null );
addTest( `dpr`, Error, NaN );
addTest( `dpr`, Error, Number.NEGATIVE_INFINITY );
addTest( `dpr`, Error, Number.POSITIVE_INFINITY );
addTest( `dpr`, `dpr=2`, 2 );

addTest( `flip`, Error );
addTest( `flip`, Error, false );
addTest( `flip`, Error, true );
addTest( `flip`, Error, 0 );
addTest( `flip`, Error, `` );
addTest( `flip`, Error, null );
addTest( `flip`, `flip=both`, `both` );
addTest( `flip`, `flip=x`, `x` );
addTest( `flip`, `flip=y`, `y` );

addTest( `truecolor`, Error );
addTest( `truecolor`, ``, 0 );
addTest( `truecolor`, ``, `` );
addTest( `truecolor`, ``, null );
addTest( `truecolor`, ``, undefined );
addTest( `truecolor`, `truecolor`, NaN );
addTest( `truecolor`, `truecolor`, Number.NEGATIVE_INFINITY );
addTest( `truecolor`, `truecolor`, Number.POSITIVE_INFINITY );
addTest( `truecolor`, `truecolor=on`, `on` );
addTest( `truecolor`, `truecolor=off`, `off` );
addTest( `truecolor`, `truecolor`, true );
addTest( `truecolor`, ``, false );

addTest( `turn`, Error );
addTest( `turn`, ``, 0 );
addTest( `turn`, ``, `` );
addTest( `turn`, ``, null );
addTest( `turn`, Error, NaN );
addTest( `turn`, Error, Number.NEGATIVE_INFINITY );
addTest( `turn`, Error, Number.POSITIVE_INFINITY );
addTest( `turn`, `turn=60`, 60 );
addTest( `turn`, `turn=flip`, `flip` );
addTest( `turn`, `turn=left`, `left` );
addTest( `turn`, `turn=right`, `right` );

addTest( `zoom`, Error );
addTest( `zoom`, Error, false );
addTest( `zoom`, ``, true );
addTest( `zoom`, Error, `` );
addTest( `zoom`, Error, null );
addTest( `zoom`, Error, NaN );
addTest( `zoom`, Error, Number.NEGATIVE_INFINITY );
addTest( `zoom`, Error, Number.POSITIVE_INFINITY );
addTest( `zoom`, Error, 0 );
addTest( `zoom`, ``, 1 );
addTest( `zoom`, `zoom=2`, 2 );

addTest( `output`, Error );
addTest( `output`, Error, true );
addTest( `output`, Error, false );
addTest( `output`, Error, `unknown` );
addTest( `output`, ``, null );
addTest( `output`, ``, undefined );

for ( const o of [ `auto`, `avif`, `heif`, `image`, `jpeg`, `maincolor`, `meancolor`, `png`, `preview`, `webp` ] ) {
    addTest( `output`, `output=${ o }`, o );
    addTest( o, `output=${ o }` );
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

Object.assign( tests, {
    "path starts with v1": assert => {
        assert.expect( 8 );
        assert.strictEqual( url.src( `v1-` ).url(), `https://i.twic.pics/v1-` );
        assert.strictEqual( url.src( `V1-` ).url(), `https://i.twic.pics/V1-` );
        assert.strictEqual( url.src( `v1` ).url(), `https://i.twic.pics/v1/image:v1` );
        assert.strictEqual( url.src( `v1/` ).url(), `https://i.twic.pics/v1/image:v1/` );
        assert.strictEqual( url.src( `v1/image` ).url(), `https://i.twic.pics/v1/image:v1/image` );
        assert.strictEqual( url.src( `V1` ).url(), `https://i.twic.pics/v1/image:V1` );
        assert.strictEqual( url.src( `V1/` ).url(), `https://i.twic.pics/v1/image:V1/` );
        assert.strictEqual( url.src( `V1/image` ).url(), `https://i.twic.pics/v1/image:V1/image` );
        assert.done();
    },
    "query starts with v1": assert => {
        assert.expect( 16 );
        assert.strictEqual( url.src( `path?v1-` ).url(), `https://i.twic.pics/path?v1-` );
        assert.strictEqual( url.src( `path?V1-` ).url(), `https://i.twic.pics/path?V1-` );
        assert.strictEqual( url.src( `?v1-` ).url(), `https://i.twic.pics/?v1-` );
        assert.strictEqual( url.src( `?V1-` ).url(), `https://i.twic.pics/?V1-` );
        assert.strictEqual( url.src( `path?v1` ).url(), `https://i.twic.pics/v1/image:path?v1` );
        assert.strictEqual( url.src( `path?v1/` ).url(), `https://i.twic.pics/v1/image:path?v1/` );
        assert.strictEqual( url.src( `path?v1/image` ).url(), `https://i.twic.pics/v1/image:path?v1/image` );
        assert.strictEqual( url.src( `?v1` ).url(), `https://i.twic.pics/v1/image:?v1` );
        assert.strictEqual( url.src( `?v1/` ).url(), `https://i.twic.pics/v1/image:?v1/` );
        assert.strictEqual( url.src( `?v1/image` ).url(), `https://i.twic.pics/v1/image:?v1/image` );
        assert.strictEqual( url.src( `path?V1` ).url(), `https://i.twic.pics/v1/image:path?V1` );
        assert.strictEqual( url.src( `path?V1/` ).url(), `https://i.twic.pics/v1/image:path?V1/` );
        assert.strictEqual( url.src( `path?V1/image` ).url(), `https://i.twic.pics/v1/image:path?V1/image` );
        assert.strictEqual( url.src( `?V1` ).url(), `https://i.twic.pics/v1/image:?V1` );
        assert.strictEqual( url.src( `?V1/` ).url(), `https://i.twic.pics/v1/image:?V1/` );
        assert.strictEqual( url.src( `?V1/image` ).url(), `https://i.twic.pics/v1/image:?V1/image` );
        assert.done();
    },
    "query starts with v1 with manipulation": assert => {
        assert.expect( 12 );
        const tmp = url.resize( 300 );
        assert.strictEqual( tmp.src( `path?v1` ).url(), `https://i.twic.pics/path?v1/resize=300&v1` );
        assert.strictEqual( tmp.src( `path?v1/` ).url(), `https://i.twic.pics/path?v1/resize=300&v1/` );
        assert.strictEqual( tmp.src( `path?v1/image` ).url(), `https://i.twic.pics/path?v1/resize=300&v1/image` );
        assert.strictEqual( tmp.src( `?v1` ).url(), `https://i.twic.pics/?v1/resize=300&v1` );
        assert.strictEqual( tmp.src( `?v1/` ).url(), `https://i.twic.pics/?v1/resize=300&v1/` );
        assert.strictEqual( tmp.src( `?v1/image` ).url(), `https://i.twic.pics/?v1/resize=300&v1/image` );
        assert.strictEqual( tmp.src( `path?V1` ).url(), `https://i.twic.pics/path?v1/resize=300&V1` );
        assert.strictEqual( tmp.src( `path?V1/` ).url(), `https://i.twic.pics/path?v1/resize=300&V1/` );
        assert.strictEqual( tmp.src( `path?V1/image` ).url(), `https://i.twic.pics/path?v1/resize=300&V1/image` );
        assert.strictEqual( tmp.src( `?V1` ).url(), `https://i.twic.pics/?v1/resize=300&V1` );
        assert.strictEqual( tmp.src( `?V1/` ).url(), `https://i.twic.pics/?v1/resize=300&V1/` );
        assert.strictEqual( tmp.src( `?V1/image` ).url(), `https://i.twic.pics/?v1/resize=300&V1/image` );
        assert.done();
    },
} );

module.exports = tests;
