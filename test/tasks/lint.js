"use strict";

const ESLint = require( `eslint` ).CLIEngine;
const linter = new ESLint();
const report = linter.executeOnFiles( [ `${ __dirname }/../../` ] );
if ( report.errorCount || report.warningCount ) {
    console.log( linter.getFormatter( `codeframe` )( report.results ) );
    if ( report.errorCount ) {
        process.exit( 1 );
    }
}
