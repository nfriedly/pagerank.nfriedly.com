var path = require('path');

module.exports = function (grunt) {
    'use strict';

    var serverScripts = ['*.js'];
    var clientScripts = ['public/**/*.js'];
    var allScripts = serverScripts.concat(clientScripts);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            scripts: {
                files: allScripts,
                tasks: ['jshint']
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
                    node: false,
                    browser: true
                },
                files: {
                    src: clientScripts
                }
            }
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
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-express');

    // Default task(s).
    grunt.registerTask('default', ['jsbeautifier', 'jshint', 'express', 'express-keepalive']);

};
