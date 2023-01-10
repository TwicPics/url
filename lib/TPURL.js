/* eslint-disable max-classes-per-file, max-lines */
"use strict";

const { couple, getArgs, join, toInteger, toNumber } = require( `./utils` );

const DEFAULT_HOST = `https://i.twic.pics`;
const VERSION = `v1`;

const AUTHENT = Symbol( `authent` );
const BACKGROUND = Symbol( `background` );
const COLOR_FILTERS = Symbol( `color filters` );
const FIRST_IS_FOCUS = Symbol( `firstIsFocus` );
const HOST = Symbol( `host` );
const MANIPULATION = Symbol( `manipulation` );
const OUTPUT = Symbol( `output` );
const SRC = Symbol( `src` );
const TRANSFORMATION = Symbol( `transformation` );
const TRUECOLOR = Symbol( `true color` );

const extendColorFilters = ( o1, o2 ) => {
    if ( !o2 ) {
        return o1;
    }
    const output = o1 ? {
        ...o1,
    } : {};
    for ( const filter of Object.getOwnPropertyNames( o2 ) ) {
        delete output[ filter ];
        const level = o2[ filter ];
        if ( level > 0 ) {
            output[ filter ] = level;
        }
    }
    return output;
};
const generateColorFilters =
    object => object && Object.getOwnPropertyNames( object ).map( f => `${
        f
    }${
        ( object[ f ] === 1 ) ? `` : `=${ object[ f ] }`
    }` ).join( `/` );

const outputs = [ `auto`, `avif`, `heif`, `image`, `jpeg`, `maincolor`, `meancolor`, `png`, `preview`, `webp` ];

const rAuthent = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/;
const rCamel = /-([a-z])/g;
const rCatchAllProto = /^(?:file|https?|image):$/;
const rFlip = /^(?:both|x|y)$/;
const rFocus = /^focus=/;
const rHost = /^\s*(https?:\/\/)?([a-z0-9-]{1,63}(?:\.[a-z0-9-]{1,63})*)(?::([0-9]+))?\s*$/i;
const rOutput = new RegExp( `^(?:${ outputs.join( `|` ) })$` );
const rPlaceholderArgType = /^(?:object|string)$/;
const rProtocol = /^[a-z][a-z0-9-+.]*:/i;
const rQuery = /^([a-z][a-z0-9-+.]*:(?:\/\/)?)?([^?]*)(?:\?(.*))?$/i;
const rTurn = /^(?:flip|left|right)$/;
const rVersionPath = new RegExp( `^${ VERSION }(?:\\/|$)`, `i` );

const MAX_HOSTNAME_LENGTH = 253;
const MAX_PORT_NUMBER = 65535;

const dataTypes = new Set( [ `background`, `src` ] );

class TPURL {
    constructor( ...sources ) {
        if ( sources.length ) {
            for ( const source of sources ) {
                const thisManip = this[ MANIPULATION ];
                const sourceManip = source[ MANIPULATION ];
                const firstIsFocus = ( thisManip ? this : source )[ FIRST_IS_FOCUS ];
                Object.assign( this, source, {
                    [ COLOR_FILTERS ]: extendColorFilters( this[ COLOR_FILTERS ], source[ COLOR_FILTERS ] ),
                    [ FIRST_IS_FOCUS ]: firstIsFocus,
                    [ MANIPULATION ]:
                        ( thisManip && sourceManip ) ?
                            thisManip.concat( sourceManip ) :
                            thisManip || sourceManip,
                } );
            }
        } else {
            this[ FIRST_IS_FOCUS ] = false;
            this[ HOST ] = DEFAULT_HOST;
        }
    }
    [ TRANSFORMATION ]( name, value ) {
        return new this.constructor( this, {
            [ FIRST_IS_FOCUS ]: ( name === `focus` ),
            [ MANIPULATION ]: [ `${ name }=${ value }` ],
        } );
    }
    dataAttributes( type = `src` ) {
        if ( !dataTypes.has( type ) ) {
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
        const background = this[ BACKGROUND ] ? `background=${ this[ BACKGROUND ] }` : ``;
        const filters = generateColorFilters( this[ COLOR_FILTERS ] );
        const format = this[ OUTPUT ] ? `output=${ this[ OUTPUT ] }` : ``;
        const truecolor = this[ TRUECOLOR ] ? `truecolor${
            typeof this[ TRUECOLOR ] === `string` ? `=${ this[ TRUECOLOR ] }` : ``
        }` : ``;
        const manip =
            this[ MANIPULATION ] ?
                this[ MANIPULATION ].slice( ( withFocus || !this[ FIRST_IS_FOCUS ] ) ? 0 : 1 ).join( `/` ) :
                ``;
        return join( manip, join( join( background, filters ), join( format, truecolor ) ) );
    }
    host( host ) {
        if ( typeof host !== `string` ) {
            throw new Error( `host is missing or not a string` );
        }
        const check = rHost.exec( host );
        if ( !check ) {
            throw new Error( `host '${ host }' is invalid` );
        }
        const [ , protocol = `https://`, hostname, port ] = check;
        if ( hostname.length > MAX_HOSTNAME_LENGTH ) {
            throw new Error( `hostname is too long (max is ${ MAX_HOSTNAME_LENGTH })` );
        }
        if ( port && ( Number( port ) > MAX_PORT_NUMBER ) ) {
            throw new Error( `port ${ port } is higher than maximum allowed (${ MAX_PORT_NUMBER }})` );
        }
        return new this.constructor( this, {
            [ HOST ]: `${ protocol }${ hostname }${ port ? `:${ port }` : `` }`,
        } );
    }
    toString() {
        const src = this.dataSrc();
        const m = this.dataTransform( true );
        const host = this[ HOST ];
        const [ , proto, path, q = `` ] = rQuery.exec( src );
        if (
            !rCatchAllProto.test( proto ) ||
            rVersionPath.test( path ) ||
            ( !m && rVersionPath.test( q ) )
        ) {
            return `${ host }/${ VERSION }/${ m && `${ m }/` }${ proto }${ path }${ q && `?${ q }` }`;
        }
        return `${ host }/${ path }${ m ? `?${ VERSION }/${ m }` : `` }${ q && `${ ( m ? `&` : `?` ) }${ q }` }`;
    }
    url() {
        return this.toString();
    }
}

// color filters
[ `achromatopsia`, `deuteranopia`, `protanopia`, `tritanopia` ].forEach(
    name => ( TPURL.prototype[ name ] = function( ...args ) {
        const level = args.length ? toNumber( args[ 0 ], 0, 1 ) : 1;
        return new this.constructor( this, {
            [ COLOR_FILTERS ]: {
                [ name ]: level,
            },
        } );
    } )
);

// setters
const setterFactory = ( name, key, regExp, fallback ) => ( TPURL.prototype[ name ] = function( ...args ) {
    if ( !args.length ) {
        throw new Error( `method ${ name } expects one argument` );
    }
    const [ arg ] = args;
    if ( ( arg != null ) &&
        ( ( typeof arg !== `string` ) || !arg || ( regExp && !regExp.test( arg ) ) )
    ) {
        const alternative = fallback && fallback( this, arg );
        if ( alternative ) {
            return alternative;
        }
        throw new Error( `method ${ name } expects a parameter of the correct format` );
    }
    return new this.constructor( this, {
        [ key ]: arg,
    } );
} );

// eslint-disable-next-line no-param-reassign
setterFactory( `auth`, AUTHENT, rAuthent );
setterFactory( `background`, BACKGROUND );
setterFactory( `src`, SRC, null, ( self, src ) => {
    if ( src instanceof TPURL ) {
        if ( !src[ SRC ] ) {
            throw new Error( `method src expects object with a source` );
        }
        return new self.constructor( src, self, {
            [ HOST ]: src[ HOST ],
            [ SRC ]: src[ SRC ],
        } );
    }
    return undefined;
} );
setterFactory( `truecolor`, TRUECOLOR, null, ( self, arg ) => new self.constructor( self, {
    [ TRUECOLOR ]: Boolean( arg ),
} ) );

// output
setterFactory( `output`, OUTPUT, rOutput );
for ( const output of outputs ) {
    TPURL.prototype[ output ] = function() {
        return this.output( output );
    };
}
const MIN_QUALITY = 1;
const MAX_QUALITY = 100;
const createQualityMethod = name =>
    ( TPURL.prototype[ name.replace( rCamel, ( _, l ) => l.toUpperCase() ) ] = function( ...args ) {
        if ( !args.length ) {
            throw new Error( `method ${ name } requires a quality` );
        }
        return this[ TRANSFORMATION ]( name, toInteger( args[ 0 ], MIN_QUALITY, MAX_QUALITY ) );
    } );
createQualityMethod( `quality` );
createQualityMethod( `quality-max` );
createQualityMethod( `quality-min` );

// resize methods
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

// flip and turn
TPURL.prototype.flip = function( ...args ) {
    if ( !args.length ) {
        throw new Error( `method flip requires an argument` );
    }
    const [ axis ] = args;
    if ( !rFlip.test( axis ) ) {
        throw new Error( `method flip expects one of "both", "x" or "y"` );
    }
    return this[ TRANSFORMATION ]( `flip`, axis );
};
TPURL.prototype.turn = function( ...args ) {
    if ( !args.length ) {
        throw new Error( `method turn requires an argument` );
    }
    const [ turn ] = args;
    if ( !rTurn.test( turn ) ) {
        const angle = Number( turn );
        if ( !angle ) {
            return new this.constructor();
        }
        if ( isNaN( angle ) || !isFinite( angle ) ) {
            throw new Error( `method turn expects one of "flip", "left" or "right", or a number` );
        }
    }
    return this[ TRANSFORMATION ]( `turn`, turn );
};

// zoom
TPURL.prototype.zoom = function( ...args ) {
    if ( !args.length ) {
        throw new Error( `method zoom requires an argument` );
    }
    const level = Number( args[ 0 ] );
    if ( isNaN( level ) || !isFinite( level ) || ( level < 1 ) ) {
        throw new Error( `method zoom expects a number superior or equal to 1` );
    }
    return ( level > 1 ) ? this[ TRANSFORMATION ]( `zoom`, level ) : new this.constructor();
};

// placeholder
class Placeholder extends TPURL {
    // eslint-disable-next-line class-methods-use-this
    placeholder() {
        throw new Error( `cannot call method placeholder twice` );
    }
    // eslint-disable-next-line class-methods-use-this
    src() {
        throw new Error( `cannot call method src after method placeholder was called` );
    }
}
const _placeholderExpression = ( width, height, background, text ) => {
    if ( width ? !height : height ) {
        throw new Error( `method placeholder requires a width and a height or none of both` );
    }
    const size = width ? `:${ width }x${ height }` : ``;
    let color;
    if ( !size || background || text ) {
        const colors = [];
        if ( text ) {
            colors.push( text );
        }
        colors.push( background || `auto` );
        color = `:${ colors.join( `/` ) }`;
    }
    return `${ size }${ color || `` }`;
};
const placeholderExpression = _args => {
    let args;
    if ( _args.length === 1 ) {
        const [ arg ] = _args;
        const type = typeof arg;
        if ( !arg || !rPlaceholderArgType.test( type ) ) {
            throw new Error(
                `method placeholder with a single argument requires an non-empty string or an object`
            );
        }
        if ( type === `string` ) {
            return `:${ arg }`;
        }
        const { width, height, background, text } = arg;
        args = [ width, height, background, text ];
    } else {
        args = _args;
    }
    return _placeholderExpression( ...args );
};

TPURL.prototype.placeholder = function( ...args ) {
    return new Placeholder( this, {
        [ SRC ]: `placeholder${ placeholderExpression( args ) }`,
    } );
};

module.exports = TPURL;
