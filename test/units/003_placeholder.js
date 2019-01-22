/* eslint-disable max-lines */
"use strict";

const url = require( `../..` );

module.exports = {
    "base": assert => {
        assert.expect( 5 );
        assert.strictEqual(
            url
                .placeholder()
                .url(),
            `https://i.twic.pics/v1/placeholder:auto`
        );
        assert.throws( () => url.placeholder().placeholder() );
        assert.throws( () => url.placeholder().src( `dir/my-image.png` ) );
        assert.throws( () =>
            url
                .placeholder()
                .max( 600 )
                .placeholder()
        );
        assert.throws( () =>
            url
                .placeholder()
                .max( 600 )
                .src( `dir/my-image.png` )
        );
        assert.done();
    },
    "transformations": assert => {
        assert.expect( 3 );
        assert.strictEqual(
            url
                .placeholder()
                .png()
                .cover( `1:1` )
                .max( 200 )
                .url(),
            `https://i.twic.pics/v1/cover=1:1/max=200/format=png/placeholder:auto`,
            `after`
        );
        assert.strictEqual(
            url
                .png()
                .cover( `1:1` )
                .max( 200 )
                .placeholder()
                .url(),
            `https://i.twic.pics/v1/cover=1:1/max=200/format=png/placeholder:auto`,
            `before`
        );
        assert.strictEqual(
            url
                .png()
                .cover( `1:1` )
                .placeholder()
                .max( 200 )
                .url(),
            `https://i.twic.pics/v1/cover=1:1/max=200/format=png/placeholder:auto`,
            `before and after`
        );
        assert.done();
    },
    "expression": assert => {
        assert.expect( 2 );
        assert.throws( () => url.placeholder( `` ).url() );
        assert.strictEqual( url.placeholder( `<EXPR>` ).url(), `https://i.twic.pics/v1/placeholder:<EXPR>` );
        assert.done();
    },
    "size": assert => {
        assert.expect( 10 );
        assert.throws( () => url.placeholder( 400 ) );
        assert.throws( () => url.placeholder( 400, null ) );
        assert.throws( () => url.placeholder( null, 300 ) );
        assert.throws( () => url.placeholder( {
            "width": 400,
        } ) );
        assert.throws( () => url.placeholder( {
            "width": 400,
            "height": null,
        } ) );
        assert.throws( () => url.placeholder( {
            "height": 300,
        } ) );
        assert.throws( () => url.placeholder( {
            "width": null,
            "height": 300,
        } ) );
        assert.strictEqual(
            url
                .placeholder( `400x300` )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300`
        );
        assert.strictEqual(
            url
                .placeholder( 400, 300 )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300`
        );
        assert.strictEqual(
            url
                .placeholder( {
                    "width": 400,
                    "height": 300,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300`
        );
        assert.done();
    },
    "color": assert => {
        assert.expect( 12 );
        assert.strictEqual(
            url
                .placeholder( null, null, null )
                .url(),
            `https://i.twic.pics/v1/placeholder:auto`
        );
        assert.strictEqual(
            url
                .placeholder( null, null )
                .url(),
            `https://i.twic.pics/v1/placeholder:auto`
        );
        assert.strictEqual(
            url
                .placeholder( `red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:red`
        );
        assert.strictEqual(
            url
                .placeholder( null, null, `red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:red`
        );
        assert.strictEqual(
            url
                .placeholder( {
                    "background": `red`,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:red`
        );
        assert.strictEqual(
            url
                .placeholder( `black/auto` )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/auto`
        );
        assert.strictEqual(
            url
                .placeholder( null, null, null, `black` )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/auto`
        );
        assert.strictEqual(
            url
                .placeholder( {
                    "text": `black`,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/auto`
        );
        assert.strictEqual(
            url
                .placeholder( `black/red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/red`
        );
        assert.strictEqual(
            url
                .placeholder( null, null, `black/red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/red`
        );
        assert.strictEqual(
            url
                .placeholder( null, null, `red`, `black` )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/red`
        );
        assert.strictEqual(
            url
                .placeholder( {
                    "background": `red`,
                    "text": `black`,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/red`
        );
        assert.done();
    },
    "both": assert => {
        assert.expect( 11 );
        assert.strictEqual(
            url
                .placeholder( `400x300:red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300:red`
        );
        assert.strictEqual(
            url
                .placeholder( 400, 300, `red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300:red`
        );
        assert.strictEqual(
            url
                .placeholder( {
                    "width": 400,
                    "height": 300,
                    "background": `red`,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300:red`
        );
        assert.strictEqual(
            url
                .placeholder( `400x300:black/auto` )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300:black/auto`
        );
        assert.strictEqual(
            url
                .placeholder( 400, 300, `black/auto` )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300:black/auto`
        );
        assert.strictEqual(
            url
                .placeholder( 400, 300, null, `black` )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300:black/auto`
        );
        assert.strictEqual(
            url
                .placeholder( {
                    "width": 400,
                    "height": 300,
                    "text": `black`,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300:black/auto`
        );
        assert.strictEqual(
            url
                .placeholder( `400x300:black/red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300:black/red`
        );
        assert.strictEqual(
            url
                .placeholder( 400, 300, `black/red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300:black/red`
        );
        assert.strictEqual(
            url
                .placeholder( 400, 300, `red`, `black` )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300:black/red`
        );
        assert.strictEqual(
            url
                .placeholder( {
                    "width": 400,
                    "height": 300,
                    "background": `red`,
                    "text": `black`,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300:black/red`
        );
        assert.done();
    },
};
