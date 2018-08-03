"use strict";

const task = ( name, banner ) => {
    // eslint-disable-next-line no-console
    console.log( banner.replace( /^(\s*)(.+)(\s*)$/, ( _, pre, title, post ) => {
        // eslint-disable-next-line no-magic-numbers
        const line = ( new Array( title.length + 5 ) ).join( `━` );
        return `${ pre }┏${ line }┓\n┃  ${ title }  ┃\n┗${ line }┛${ post }`;
    } ) );
    // eslint-disable-next-line global-require
    require( `./tasks/${ name }` );
};

task( `lint`, `\nLINT SOURCE CODE\n` );
task( `test`, `\nRUN UNIT TESTS SUITE` );
