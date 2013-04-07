var path = require('path');

module.exports = function (grunt) {

    var serverScripts = ['*.js'];
    var clientScripts = ['public-src/**/*.js'];
    var allScripts = serverScripts.concat(clientScripts);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            scripts: {
                files: allScripts,
                tasks: ['jshint', 'browserify2:dev', 'express-restart']
            }
        },
        jsbeautifier: {
            files: allScripts,
            options: {
                indent_with_tabs: true,
                preserve_newlines: true,
                max_preserve_newlines: 3,
                jslint_happy: true,
                space_before_conditional: true
            }
        },
        jshint: {
            options: {
                //camelcase: true,
                // quotmark: 'single',
                //strict: true,
                undef: true,
                unused: true,
                node: true
            },
            server: serverScripts,
            client: {
                options: {
                    browser: true
                },
                files: {
                    src: clientScripts
                }
            }
        },
        csslint: {
            options: {
                ids: false,
                "overqualified-elements": false
            },
            files: ['public/*.css']
        },
        express: {
            pagerank_app: {
                options: {
                    port: 3000,
                    bases: __dirname + '/public',
                    supervisor: true,
                    watchChanges: true,
                    server: path.resolve('./pr-app')
                }
            }
        },
        browserify2: {
            dev: {
                entry: './public-src/init.js',
                compile: './public/pr-client.js',
                debug: true
            },
            compile: {
                entry: './public-src/init.js',
                compile: './public/pr-client.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-browserify2');

    // Default task(s).
    //grunt.registerTask('default', ['jsbeautifier', 'jshint', 'browserify2:dev', 'express', 'express-keepalive']);
    grunt.registerTask('default', ['jsbeautifier', 'jshint', 'csslint', 'browserify2:dev', 'express', 'watch']);

    grunt.registerTask('compile', ['jsbeautifier', 'jshint', 'browserify2:compile']);

};
