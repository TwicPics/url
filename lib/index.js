"use strict";

const MAIN_URL = `https://i.twic.pics/v1/`;

const AUTHENT = Symbol( `authent` );
const CLONE = Symbol( `clone` );
const FORMAT = Symbol( `format` );
const MANIPULATION = Symbol( `manipulation` );
const SRC = Symbol( `src` );
const TRANSFORMATION = Symbol( `transformation` );

const no = value => ( value === false ) || ( value == null );

const couple = ( v1, v2 ) => {
    const noV1 = no( v1 );
    const noV2 = no( v2 );
    if ( noV1 && noV2 ) {
        return null;
    }
    // eslint-disable-next-line no-nested-ternary
    return noV1 ?
        `-x${ v2 }` :
        ( noV2 ? v1 : `${ v1 }x${ v2 }` );
};

const getArgs = ( name, args, props ) => {
    const { length } = args;
    if ( ( length < 1 ) || ( length > props.length ) ) {
        throw new Error( `method ${ name } requires 1 to ${ props.length } arguments` );
    }
    const actualArgs = args;
    if ( length === 1 ) {
        const [ object ] = args;
        if ( typeof object === `object` ) {
            for ( let i = 0; i < props.length; i++ ) {
                const prop = props[ i ];
                actualArgs[ i ] = object.hasOwnProperty( prop ) ? object[ prop ] : null;
            }
        }
    }
    return actualArgs;
};

const formatQuality = new Map( [
    [ `jpeg`, true ],
    [ `png`, false ],
    [ `webp`, true ],
] );

const rAuthent = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/;

class TPURL {
    constructor() {
        this[ MANIPULATION ] = [];
    }
    [ CLONE ]() {
        const clone = new TPURL();
        clone[ AUTHENT ] = this[ AUTHENT ];
        clone[ FORMAT ] = this[ FORMAT ];
        clone[ MANIPULATION ] = this[ MANIPULATION ];
        clone[ SRC ] = this[ SRC ];
        return clone;
    }
    [ TRANSFORMATION ]( name, value ) {
        const clone = this[ CLONE ]();
        clone[ MANIPULATION ] = clone[ MANIPULATION ].concat( [ `${ name }=${ value }` ] );
        return clone;
    }
    auth( token ) {
        if ( !rAuthent.test( token ) ) {
            throw new Error( `token '${ token }' is illformed` );
        }
        const clone = this[ CLONE ]();
        clone[ AUTHENT ] = token;
        return clone;
    }
    format( ..._args ) {
        const [ format, quality ] = getArgs( `format`, _args, [ `type`, `quality` ] );
        if ( no( format ) ) {
            throw new Error( `format expected` );
        }
        const acceptsQuality = formatQuality.get( format );
        if ( acceptsQuality == null ) {
            throw new Error( `unknown format '${ format }'` );
        }
        const noQuality = no( quality );
        if ( !noQuality && !acceptsQuality ) {
            throw new Error( `format '${ format }' does not support quality specifier` );
        }
        const clone = this[ CLONE ]();
        clone[ FORMAT ] = noQuality ? format : `${ format }-${ quality }`;
        return clone;
    }
    src( src ) {
        const clone = this[ CLONE ]();
        if ( src instanceof TPURL ) {
            clone[ AUTHENT ] = src[ AUTHENT ] || clone[ AUTHENT ];
            if ( !clone[ FORMAT ] ) {
                clone[ FORMAT ] = src[ FORMAT ];
            }
            clone[ MANIPULATION ] = src[ MANIPULATION ].concat( clone[ MANIPULATION ] );
            clone[ SRC ] = src[ SRC ] || clone[ SRC ];
        } else {
            clone[ SRC ] = src;
        }
        return clone;
    }
    toString() {
        if ( !this[ SRC ] ) {
            throw new Error( `cannot create url without a source` );
        }
        const { [ AUTHENT ]: authent, [ FORMAT ]: format, [ MANIPULATION ]: manip } = this;
        return MAIN_URL +
            ( manip.length ? `${ manip.join( `/` ) }/` : `` ) +
            ( format ? `format=${ format }/` : `` ) +
            ( authent ? `auth:${ authent }/` : `` ) +
            this[ SRC ];
    }
    url() {
        return this.toString();
    }
}

for ( const [ type, acceptsQuality ] of formatQuality ) {
    TPURL.prototype[ type ] =
        acceptsQuality ?
            function( quality ) {
                return this.format( type, quality );
            } :
            function() {
                return this.format( type );
            };
}

const resizeFactory = name => function( ...args ) {
    const sizeString = couple( ...getArgs( name, args, [ `width`, `height` ] ) );
    if ( sizeString === null ) {
        throw new Error( `at least a width or a height is needed` );
    }
    // eslint-disable-next-line no-invalid-this
    return this[ TRANSFORMATION ]( name, sizeString );
};

TPURL.prototype.contain = resizeFactory( `contain` );
TPURL.prototype.containMax = resizeFactory( `contain-max` );
TPURL.prototype.containMin = resizeFactory( `contain-min` );

TPURL.prototype.cover = resizeFactory( `cover` );
TPURL.prototype.coverMax = resizeFactory( `cover-max` );
TPURL.prototype.coverMin = resizeFactory( `cover-min` );

TPURL.prototype.crop = function( ..._args ) {
    const args = getArgs( `crop`, _args, [ `width`, `height`, `x`, `y` ] );
    const sizeString = couple( args[ 0 ], args[ 1 ] );
    if ( sizeString === null ) {
        throw new Error( `at least a width or a height is needed` );
    }
    const coordString = couple( args[ 2 ], args[ 3 ] );
    return this[ TRANSFORMATION ]( `crop`, coordString === null ? sizeString : `${ sizeString }@${ coordString }` );
};

TPURL.prototype.focus = function( ...args ) {
    const coordString = couple( ...getArgs( `focus`, args, [ `x`, `y` ] ) );
    if ( coordString === null ) {
        throw new Error( `at least a x-coord or a y-coord is needed` );
    }
    return this[ TRANSFORMATION ]( `focus`, coordString );
};

TPURL.prototype.max = resizeFactory( `max` );
TPURL.prototype.min = resizeFactory( `min` );

TPURL.prototype.resize = resizeFactory( `resize` );
TPURL.prototype.resizeMax = resizeFactory( `resize-max` );
TPURL.prototype.resizeMin = resizeFactory( `resize-min` );

TPURL.prototype.step = resizeFactory( `step` );

module.exports = new TPURL();
