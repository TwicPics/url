"use strict";

const { ESLint } = require( `eslint` );
const formatter = require( `eslint-formatter-codeframe` );

( new ESLint() ).lintFiles( [ `${ __dirname }/../../` ] ).then( report => {
    if ( report.errorCount || report.warningCount ) {
        console.log( formatter( report.results ) );
        if ( report.errorCount ) {
            process.exit( 1 );
        }
    }
} );

