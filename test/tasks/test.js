"use strict";

const testRunner = require( `nodeunit` ).reporters.default;
testRunner.run( [ `${ __dirname }/../units` ], null, error => {
    if ( error ) {
        process.exit( 1 );
    }
} );
