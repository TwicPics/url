/* eslint-disable max-classes-per-file, max-lines */
"use strict";

const { couple, coupleFromObject, getArgs, getArgsObject, toInteger, objectField } = require( `./utils` );

const DEFAULT_HOST = `https://i.twic.pics`;
const VERSION = `v1`;

const AUTHENT = Symbol( `authent` );
const FIRST_IS_FOCUS = Symbol( `firstIsFocus` );
const FORMAT = Symbol( `format` );
const HOST = Symbol( `host` );
const MANIPULATION = Symbol( `manipulation` );
const PLACEHOLDER = Symbol( `placeholder` );
const SRC = Symbol( `src` );
const TRANSFORMATION = Symbol( `transformation` );

const rAuthent = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/;
const rCamel = /-([a-z])/g;
const rDataType = /^background$|^src$/;
const rFocus = /^focus=/;
const rHost = /^(https?:\/\/)?([a-z0-9-]{1,63}(?:\.[a-z0-9-]{1,63})*)(?::([0-9]+))?$/i;
const rQuery = /^image:([^?]*)(\?(.*))?$/;
const rPrivate = /^image:/;
const rProtocol = /^[a-z][a-z0-9-+.]*:/i;
const rSRCVersion = new RegExp( `^${ VERSION }/|^[^?]*?${ VERSION }(?:/|$)` );

const MAX_HOSTNAME_LENGTH = 253;
const MAX_PORT_NUMBER = 65535;

class TPURL {
    constructor( ...sources ) {
        if ( sources.length ) {
            Object.assign( this, ...sources );
        } else {
            this[ FIRST_IS_FOCUS ] = false;
            this[ HOST ] = DEFAULT_HOST;
            this[ MANIPULATION ] = [];
        }
    }
    [ TRANSFORMATION ]( name, value ) {
        return new this.constructor( this, {
            [ FIRST_IS_FOCUS ]: this[ FIRST_IS_FOCUS ] || ( !this[ MANIPULATION ].length && ( name === `focus` ) ),
            [ MANIPULATION ]: this[ MANIPULATION ].concat( [ `${ name }=${ value }` ] ),
        } );
    }
    auth( token ) {
        if ( !rAuthent.test( token ) ) {
            throw new Error( `token '${ token }' is invalid` );
        }
        return new this.constructor( this, {
            [ AUTHENT ]: token,
        } );
    }
    dataAttributes( type = `src` ) {
        if ( !rDataType.test( type ) ) {
            throw new Error( `unknown data attribute type ${ type }` );
        }
        const main = `data-${ type }`;
        return {
            [ main ]: type === `background` ? `url(${ JSON.stringify( this.dataSrc() ) })` : this.dataSrc(),
            [ `${ main }-focus` ]: this.dataFocus(),
            [ `${ main }-transform` ]: this.dataTransform(),
        };
    }
    dataFocus() {
        return this[ FIRST_IS_FOCUS ] ? this[ MANIPULATION ][ 0 ].replace( rFocus, `` ) : ``;
    }
    dataSrc() {
        const src = this[ SRC ];
        if ( !src ) {
            throw new Error( `cannot create url without a source` );
        }
        // eslint-disable-next-line no-nested-ternary
        return rProtocol.test( src ) ?
            ( this[ AUTHENT ] ? `auth:${ this[ AUTHENT ] }/${ src }` : src ) :
            `image:${ src }`;
    }
    dataTransform( withFocus = false ) {
        const manip = this[ MANIPULATION ].slice( withFocus || !this[ FIRST_IS_FOCUS ] ? 0 : 1 ).join( `/` );
        const format = this[ FORMAT ] ? `format=${ this[ FORMAT ] }` : ``;
        return ( manip && format ) ? `${ manip }/${ format }` : ( manip || format );
    }
    host( host ) {
        if ( typeof host !== `string` ) {
            throw new Error( `host is missing or not a string` );
        }
        const check = rHost.exec( host );
        if ( !check ) {
            throw new Error( `host '${ host }' is invalid` );
        }
        const [ , protocol, hostname, port ] = check;
        if ( hostname.length > MAX_HOSTNAME_LENGTH ) {
            throw new Error( `hostname is too long (max is ${ MAX_HOSTNAME_LENGTH })` );
        }
        if ( Number( port ) > MAX_PORT_NUMBER ) {
            throw new Error( `port ${ port } is higher than maximum allowed (${ MAX_PORT_NUMBER }})` );
        }
        return new this.constructor( this, {
            [ HOST ]: protocol ? host : `https://${ host }`,
        } );
    }
    src( src ) {
        if ( typeof src === `string` ) {
            return new this.constructor( this, {
                [ PLACEHOLDER ]: undefined,
                [ SRC ]: src,
            } );
        }
        if ( src instanceof TPURL ) {
            if ( !src[ SRC ] ) {
                throw new Error( `cannot use object with a source as another object's source` );
            }
            return new src.constructor( this, {
                [ AUTHENT ]: src[ AUTHENT ] || this[ AUTHENT ],
                [ FORMAT ]: this[ FORMAT ] || src[ FORMAT ],
                [ MANIPULATION ]: src[ MANIPULATION ].concat( this[ MANIPULATION ] ),
                [ PLACEHOLDER ]: src[ PLACEHOLDER ],
                [ SRC ]: src[ SRC ],
            } );
        }
        throw new Error( `src is missing or not a string` );
    }
    toString() {
        const src = this.dataSrc();
        const manip = this.dataTransform( true );
        const host = this[ HOST ];
        if ( !rPrivate.test( src ) || rSRCVersion.test( src ) ) {
            return `${ host }/${ VERSION }/${ manip && `${ manip }/` }${ src }`;
        }
        const [ , path, query ] = rQuery.exec( src );
        return `${ host }/${ path || `` }${ manip ? `?${ VERSION }/${ manip }` : `` }${ query || `` }`;
    }
    url() {
        return this.toString();
    }
}

// format
const formats = new Set( [ `jpeg`, `png`, `webp` ] );
const MIN_QUALITY = 1;
const MAX_QUALITY = 100;
TPURL.prototype.format = function( ...args ) {
    const [ format, quality ] = getArgs( `format`, args, [ `type`, `quality` ] );
    if ( !formats.has( format ) ) {
        throw new Error( `unknown format '${ format }'` );
    }
    return new this.constructor( this, {
        [ FORMAT ]: format,
        [ MANIPULATION ]:
            quality == null ?
                this[ MANIPULATION ] :
                this[ MANIPULATION ].concat( [ `quality=${ toInteger( quality, MIN_QUALITY, MAX_QUALITY ) }` ] ),
    } );
};
for ( const format of formats ) {
    TPURL.prototype[ format ] = function( ...args ) {
        return this.format( format, ...args );
    };
}
const createQualityMethod = name =>
    ( TPURL.prototype[ name.replace( rCamel, ( _, l ) => l.toUpperCase() ) ] = function( quality ) {
        if ( quality == null ) {
            throw new Error( `method ${ name } requires a quality` );
        }
        return this[ TRANSFORMATION ]( name, toInteger( quality, MIN_QUALITY, MAX_QUALITY ) );
    } );
createQualityMethod( `quality` );
createQualityMethod( `quality-max` );
createQualityMethod( `quality-min` );

// resize methods & step
const createResizeMethod = ( name, expected = `a width and a height` ) =>
    ( TPURL.prototype[ name.replace( rCamel, ( _, l ) => l.toUpperCase() ) ] = function( ...args ) {
        const sizeString = couple( ...getArgs( name, args, [ `width`, `height` ] ) );
        if ( sizeString === null ) {
            throw new Error( `method ${ name } requires one or both of ${ expected }` );
        }
        // eslint-disable-next-line no-invalid-this
        return this[ TRANSFORMATION ]( name, sizeString );
    } );
for ( const name of [ `contain`, `cover`, `resize` ] ) {
    createResizeMethod( name );
    createResizeMethod( `${ name }-max` );
    createResizeMethod( `${ name }-min` );
}
createResizeMethod( `max` );
createResizeMethod( `min` );
createResizeMethod( `step`, `a horizontal step and a vertical step` );

// crop & focus
TPURL.prototype.crop = function( ..._args ) {
    const args = getArgs( `crop`, _args, [ `width`, `height`, `x`, `y` ] );
    const sizeString = couple( args[ 0 ], args[ 1 ] );
    if ( sizeString === null ) {
        throw new Error( `method crop requires one or both of a width and a height` );
    }
    const coordString = couple( args[ 2 ], args[ 3 ] );
    return this[ TRANSFORMATION ]( `crop`, coordString === null ? sizeString : `${ sizeString }@${ coordString }` );
};
TPURL.prototype.focus = function( ...args ) {
    const coordString = couple( ...getArgs( `focus`, args, [ `x`, `y` ] ) );
    if ( coordString === null ) {
        throw new Error( `method focus requires one or both of a x coordinate and a y coordinate` );
    }
    return this[ TRANSFORMATION ]( `focus`, coordString );
};

// placeholder
class Placeholder extends TPURL {
    constructor( ...objects ) {
        super( ...objects );
        const placeholder = Object.assign( {}, ...objects.map( o => o[ PLACEHOLDER ] ) );
        this[ PLACEHOLDER ] = placeholder;
        const size = coupleFromObject( placeholder, `width`, `height`, {
            "prepend": `:`,
            "fallback": ``,
        } );
        const color = coupleFromObject( placeholder, `background`, `text`, {
            "empty": `auto`,
            "fallback": ``,
            "prepend": `:`,
            "reverse": true,
            "separator": `/`,
        } );
        this[ SRC ] = `placeholder${ ( size || color ) ? ( size + color ) : `:auto` }`;
    }
    // eslint-disable-next-line class-methods-use-this
    src() {
        throw new Error( `cannot set src of a placeholder` );
    }
    color( ...args ) {
        const data = getArgsObject( `color`, args, [ `background`, `text` ] );
        if ( !data.hasOwnProperty( `background` ) && !data.hasOwnProperty( `text` ) ) {
            throw new Error( `method color requires one or both of a background color and a text color` );
        }
        return new this.constructor( this, {
            [ PLACEHOLDER ]: data,
        } );
    }
    size( ...args ) {
        const data = getArgsObject( `size`, args, [ `width`, `height` ] );
        if ( ( objectField( data, `width` ) == null ) || ( objectField( data, `height` ) == null ) ) {
            throw new Error( `method size both of a width and a height` );
        }
        return new this.constructor( this, {
            [ PLACEHOLDER ]: data,
        } );
    }
}
Object.defineProperty( TPURL.prototype, `placeholder`, {
    get() {
        return new Placeholder( this );
    },
} );

module.exports = TPURL;
