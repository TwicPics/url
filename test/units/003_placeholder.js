/* eslint-disable max-lines */
"use strict";

const url = require( `../..` );

module.exports = {
    "base": assert => {
        assert.expect( 2 );
        assert.strictEqual(
            url
                .placeholder
                .url(),
            `https://i.twic.pics/v1/placeholder:auto`
        );
        assert.throws( () => url.placeholder.src( `dir/my-image.png` ) );
        assert.done();
    },
    "transformations": assert => {
        assert.expect( 3 );
        assert.strictEqual(
            url
                .placeholder
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
                .placeholder
                .url(),
            `https://i.twic.pics/v1/cover=1:1/max=200/format=png/placeholder:auto`,
            `before`
        );
        assert.strictEqual(
            url
                .png()
                .cover( `1:1` )
                .placeholder
                .max( 200 )
                .url(),
            `https://i.twic.pics/v1/cover=1:1/max=200/format=png/placeholder:auto`,
            `before and after`
        );
        assert.done();
    },
    "color": assert => {
        assert.expect( 11 );
        assert.throws( () => url.placeholder.color() );
        assert.throws( () => url.placeholder.color( 1, 2, 3 ) );
        assert.throws( () => url.placeholder.color( {} ) );
        assert.strictEqual(
            url
                .placeholder
                .color( null )
                .url(),
            `https://i.twic.pics/v1/placeholder:auto`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( null, null )
                .url(),
            `https://i.twic.pics/v1/placeholder:auto`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( `red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:red`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( {
                    "background": `red`,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:red`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( null, `black` )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/auto`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( {
                    "text": `black`,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/auto`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( `red`, `black` )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/red`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( {
                    "background": `red`,
                    "text": `black`,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/red`
        );
        assert.done();
    },
    "color override": assert => {
        assert.expect( 6 );
        assert.strictEqual(
            url
                .placeholder
                .color( `black` )
                .color( `red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:red`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( {
                    "background": `black`,
                } )
                .color( {
                    "background": `red`,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:red`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( `black` )
                .color( null )
                .url(),
            `https://i.twic.pics/v1/placeholder:auto`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( {
                    "background": `black`,
                } )
                .color( {
                    "background": null,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:auto`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( null, `black` )
                .color( `red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/red`
        );
        assert.strictEqual(
            url
                .placeholder
                .color( {
                    "text": `black`,
                } )
                .color( {
                    "background": `black`,
                } )
                .color( `red` )
                .url(),
            `https://i.twic.pics/v1/placeholder:black/red`
        );
        assert.done();
    },
    "size": assert => {
        assert.expect( 14 );
        assert.throws( () => url.placeholder.size() );
        assert.throws( () => url.placeholder.size( 1, 2, 3 ) );
        assert.throws( () => url.placeholder.size( null ) );
        assert.throws( () => url.placeholder.size( {
            "width": null,
        } ) );
        assert.throws( () => url.placeholder.size( {
            "height": null,
        } ) );
        assert.throws( () => url.placeholder.size( null, null ) );
        assert.throws( () => url.placeholder.size( {
            "width": null,
            "height": null,
        } ) );
        assert.throws( () => url.placeholder.size( 40, null ) );
        assert.throws( () => url.placeholder.size( {
            "width": 40,
            "height": null,
        } ) );
        assert.throws( () => url.placeholder.size( null, 40 ) );
        assert.throws( () => url.placeholder.size( {
            "width": null,
            "height": 40,
        } ) );
        assert.strictEqual(
            url
                .placeholder
                .size( 400, 300 )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300`
        );
        assert.strictEqual(
            url
                .placeholder
                .size( {
                    "width": 400,
                    "height": 300,
                } )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300`
        );
        assert.strictEqual(
            url
                .placeholder
                .size( 50, 75 )
                .size( 400, 300 )
                .url(),
            `https://i.twic.pics/v1/placeholder:400x300`
        );
        assert.done();
    },
};
