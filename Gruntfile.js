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
                tasks: ['jshint'],
                options: {
                    debounce: 5000, // miliseconds
                    interrupt: true
                }
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
            all: allScripts,
            options: {
                //camelcase: true,
                // quotmark: 'single',
                //strict: true,
                undef: true,
                unused: true,
                browser: true,
                node: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', ['jsbeautifier', 'jshint']);

};
