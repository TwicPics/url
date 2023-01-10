"use strict";

const couple = ( v1, v2 ) => {
    const noV1 = ( v1 == null );
    const noV2 = ( v2 == null );
    if ( noV1 && noV2 ) {
        return null;
    }
    // eslint-disable-next-line no-nested-ternary
    return noV1 ? `-x${ v2 }` : ( noV2 ? v1 : `${ v1 }x${ v2 }` );
};

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

const toNumber = ( v, min, max ) => {
    const n = Number( v );
    if ( isNaN( n ) || !isFinite( n ) ) {
        throw new Error( `${ v } is not a number` );
    }
    if ( ( n < min ) || ( n > max ) ) {
        throw new Error( `${ n } is out of bound` );
    }
    return n;
};

const join = ( a, b ) => ( ( a && b ) ? `${ a }/${ b }` : ( a || b ) );

module.exports = {
    couple,
    getArgs,
    join,
    toInteger,
    toNumber,
};
