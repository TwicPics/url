"use strict";

const url = require( `../..` );

module.exports = {
    "chaining - classic API": assert => {
        assert.expect( 1 );
        assert.strictEqual(
            url
                .output( `png` )
                .cover( `1:1` )
                .resize( 500 )
                .src( `http://<END>` )
                .url(),
            `https://i.twic.pics/v1/cover=1:1/resize=500/output=png/http://<END>`
        );
        assert.done();
    },
    "chaining - catch-all API": assert => {
        assert.expect( 1 );
        assert.strictEqual(
            url
                .output( `png` )
                .cover( `1:1` )
                .resize( 500 )
                .src( `<END>` )
                .url(),
            `https://i.twic.pics/<END>?v1/cover=1:1/resize=500/output=png`
        );
        assert.done();
    },
    "forking - classic API": assert => {
        assert.expect( 2 );
        const src = url.focus( `X`, `Y` ).src( `http://<END>` );
        assert.strictEqual( src.cover( `1:1` ).url(), `https://i.twic.pics/v1/focus=XxY/cover=1:1/http://<END>` );
        assert.strictEqual( src.resize( `W` ).url(), `https://i.twic.pics/v1/focus=XxY/resize=W/http://<END>` );
        assert.done();
    },
    "forking - catch-all API": assert => {
        assert.expect( 2 );
        const src = url.focus( `X`, `Y` ).src( `<END>` );
        assert.strictEqual( src.cover( `1:1` ).url(), `https://i.twic.pics/<END>?v1/focus=XxY/cover=1:1` );
        assert.strictEqual( src.resize( `W` ).url(), `https://i.twic.pics/<END>?v1/focus=XxY/resize=W` );
        assert.done();
    },
    "forking by src - classic API": assert => {
        assert.expect( 2 );
        const src = url.focus( `X`, `Y` ).src( `http://<END>` );
        const cover = url.cover( `1:1` );
        const resize = url.resize( `W` );
        assert.strictEqual( cover.src( src ).url(), `https://i.twic.pics/v1/focus=XxY/cover=1:1/http://<END>` );
        assert.strictEqual( resize.src( src ).url(), `https://i.twic.pics/v1/focus=XxY/resize=W/http://<END>` );
        assert.done();
    },
    "forking by src - catch-all API": assert => {
        assert.expect( 2 );
        const src = url.focus( `X`, `Y` ).src( `<END>` );
        const cover = url.cover( `1:1` );
        const resize = url.resize( `W` );
        assert.strictEqual( cover.src( src ).url(), `https://i.twic.pics/<END>?v1/focus=XxY/cover=1:1` );
        assert.strictEqual( resize.src( src ).url(), `https://i.twic.pics/<END>?v1/focus=XxY/resize=W` );
        assert.done();
    },
    "using an object with no src as src": assert => {
        assert.expect( 1 );
        assert.throws( () => url.src( url.resize( 100 ) ) );
        assert.done();
    },
};
