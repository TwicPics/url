"use strict";

const { createCipheriv } = require( `crypto` );

const KEY = Symbol( `key` );

const ALGORITHM = `aes-128-ecb`;
const ENCODING = `base64`;
const KEY_LENGTH = 16;

const encode = string => string.replace( /\//g, `-` );
const reverse = string => [ ...string ].reverse().join( `` );

module.exports = class {
    constructor( key ) {
        if ( typeof key !== `string` ) {
            throw new Error( `encryption key should be a string` );
        }
        try {
            this[ KEY ] = Buffer.from( key, `base64` );
        } catch ( _ ) {
            // node is very (too?) laxed here so it never hits the catch
            /* istanbul ignore next */
            throw new Error( `key ${ key } is not properly base64-encoded` );
        }
        if ( this[ KEY ].length !== KEY_LENGTH ) {
            throw new Error( `key ${ key } is not ${ KEY_LENGTH } bytes long once decoded` );
        }
    }
    encrypt( src ) {
        try {
            // eslint-disable-next-line no-new
            new URL( src );
        } catch ( _ ) {
            throw new Error( `src ${ src } is not a properly formed URL` );
        }
        const cipher = createCipheriv( ALGORITHM, this[ KEY ], null );
        return encode( Buffer.concat( [
            cipher.update( reverse( src ) ),
            cipher.final(),
        ] ).toString( ENCODING ) );
    }
};
