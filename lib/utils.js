"use strict";

const couple = ( v1, v2, { empty = `-`, fallback = null, prepend = ``, reverse = false, separator = `x` } = {} ) => {
    const noV1 = ( v1 == null );
    const noV2 = ( v2 == null );
    if ( noV1 && noV2 ) {
        return fallback;
    }
    const join = ( a, b ) => ( reverse ? `${ b }${ separator }${ a }` : `${ a }${ separator }${ b }` );
    // eslint-disable-next-line no-nested-ternary
    return `${ prepend }${ noV1 ? join( empty, v2 ) : ( noV2 ? v1 : join( v1, v2 ) ) }`;
};

const objectField = ( object, field ) => ( object.hasOwnProperty( field ) ? object[ field ] : undefined );
const coupleFromObject = ( object, field1, field2, config ) =>
    couple( objectField( object, field1 ), objectField( object, field2 ), config );

const getArgs = ( name, args, props ) => {
    const { length } = args;
    if ( ( length < 1 ) || ( length > props.length ) ) {
        throw new Error( `method ${ name } requires 1 to ${ props.length } arguments` );
    }
    if ( ( length === 1 ) && args[ 0 ] && ( typeof args[ 0 ] === `object` ) ) {
        const [ reference ] = args;
        return props.map( prop => ( reference.hasOwnProperty( prop ) ? reference[ prop ] : undefined ) );
    }
    return args;
};

const getArgsObject = ( name, args, props ) => {
    const { length } = args;
    if ( ( length < 1 ) || ( length > props.length ) ) {
        throw new Error( `method ${ name } requires 1 to ${ props.length } arguments` );
    }
    const object = {};
    if ( ( args.length === 1 ) && args[ 0 ] && ( typeof args[ 0 ] === `object` ) ) {
        for ( const prop of props ) {
            if ( args[ 0 ].hasOwnProperty( prop ) ) {
                object[ prop ] = args[ 0 ][ prop ];
            }
        }
    } else {
        args.forEach( ( value, i ) => ( object[ props[ i ] ] = value ) );
    }
    return object;
};

const toInteger = ( v, min, max ) => {
    const n = Number( v );
    if ( !Number.isInteger( n ) ) {
        throw new Error( `${ v } is not an integer` );
    }
    if ( ( n < min ) || ( n > max ) ) {
        throw new Error( `${ n } is out of bound` );
    }
    return n;
};

module.exports = {
    couple,
    coupleFromObject,
    getArgs,
    getArgsObject,
    objectField,
    toInteger,
};
