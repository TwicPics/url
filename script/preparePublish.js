"use strict";

const { execSync } = require( `child_process` );
const fs = require( `fs` );
const path = require( `path` );

const [ , , VERSION ] = process.argv;

const baseDir = path.resolve( __dirname, `..` );
const publishDir = path.resolve( baseDir, `publish` );

// copies to publish dir while respecting .npmignore
{
    const filter = ( () => {
        const rSpecial = /(\.|\*\*?|\/|\^|\^$)/g;
        const regExp = new RegExp( `^${ baseDir }(?:${
            [
                ...( new Set( [
                    ...fs.readFileSync( `${ __dirname }/../.npmignore`, `utf8` ).trim().split( `\n` ),
                    `/node_modules`,
                    `/publish`,
                ] ) ),
            ]
                .map( line => line.replace(
                    rSpecial,
                    // eslint-disable-next-line no-nested-ternary
                    ( _, char ) => ( char === `**` ? `.*` : ( char === `*` ? `[^\\/]*` : `\\${ char }` ) )
                ) )
                .join( `|` )
        })$` );
        return expr => !regExp.test( expr );
    } )();

    const copyRecursive = ( source, target ) => {
        if ( fs.statSync( source ).isDirectory() ) {
            fs.mkdirSync( target );
            for ( const item of fs.readdirSync( source ) ) {
                const sourceItem = path.resolve( source, item );
                if ( filter( sourceItem ) ) {
                    copyRecursive( sourceItem, path.resolve( target, item ) );
                }
            }
        } else {
            fs.copyFileSync( source, target );
        }
    };

    try {
        execSync( `rm -rf ${ JSON.stringify( publishDir ) }` );
    } catch ( _ ) {}

    copyRecursive( baseDir, publishDir );
}

const pkg = require( `../publish/package.json` );

// cleans package.json up
for ( const field of ( new Set( [ ...( pkg.removePublish || [] ), `private`, `removePublish` ] ) ).values() ) {
    delete pkg[ field ];
}

if ( VERSION ) {
    pkg.version = VERSION;
}

fs.writeFileSync( path.resolve( publishDir, `package.json` ), JSON.stringify( pkg, null, `    ` ) );
