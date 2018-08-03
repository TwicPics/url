"use strict";

const url = require( `../..` );

module.exports = {
    "chaining": assert => {
        assert.expect( 1 );
        assert.strictEqual(
            url
                .format( `png` )
                .cover( `1:1` )
                .resize( 500 )
                .src( `<END>` )
                .url(),
            `https://i.twic.pics/v1/cover=1:1/resize=500/format=png/<END>`
        );
        assert.done();
    },
    "forking": assert => {
        assert.expect( 2 );
        const src = url.focus( `X`, `Y` ).src( `<END>` );
        assert.strictEqual( src.cover( `1:1` ).url(), `https://i.twic.pics/v1/focus=XxY/cover=1:1/<END>` );
        assert.strictEqual( src.resize( `W` ).url(), `https://i.twic.pics/v1/focus=XxY/resize=W/<END>` );
        assert.done();
    },
    "forking by src": assert => {
        assert.expect( 2 );
        const src = url.focus( `X`, `Y` ).src( `<END>` );
        const cover = url.cover( `1:1` );
        const resize = url.resize( `W` );
        assert.strictEqual( cover.src( src ).url(), `https://i.twic.pics/v1/focus=XxY/cover=1:1/<END>` );
        assert.strictEqual( resize.src( src ).url(), `https://i.twic.pics/v1/focus=XxY/resize=W/<END>` );
        assert.done();
    },
};
