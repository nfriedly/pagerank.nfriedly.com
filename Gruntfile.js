var path = require('path');

module.exports = function(grunt) {

    var serverScripts = ['*.js'];
    var clientScripts = ['public-src/**/*.js'];
    var allScripts = serverScripts.concat(clientScripts);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            scripts: {
                files: allScripts,
                tasks: ['jshint', 'browserify2:dev', 'copy:dev', 'express-restart']
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
                'overqualified-elements': false,
                'qualified-headings': false
            },
            files: ['public-src/*.css']
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
                compile: './public/pr-client-full.js'
            }
        },

        clean: {
            'pre-deploy': 'public',
            'post-deploy': 'public-tmp'
        },
        copy: {
            dev: {
                files: [{
                    expand: true,
                    cwd: 'public-src/',
                    src: ['*.{jpg,png,css,html}'],
                    dest: 'public/'
                }]
            },
            prod: {
                files: [{
                    expand: true,
                    cwd: 'public-src/',
                    src: ['*.{jpg,png}'], // in prod, the css & html are run through a minifier
                    dest: 'public/'
                }]
            },
            'prod-html-bandaid': {
                files: [{
                    expand: true,
                    cwd: 'public-tmp/',
                    src: ['*.html'], // in prod, the css & html are run through a minifier
                    dest: 'public/'
                }]
            }
        },

        replace: {
            prod: {
                options: {
                    variables: {
                        'timestamp': '<%= (new Date()).getTime() %>'
                    },
                    prefix: '@@'
                },
                files: [{
                    expand: true,
                    cwd: 'public-src/',
                    src: ['*.html'],
                    dest: 'public-tmp/'
                }]
            }
        },

        /* htmlmin strips the space between text and links :( At least gzip will fix most of the issue... 
        htmlmin: {
            prod: {
                files: {
                    // dest: src
                    'public/index.html': 'public-tmp/index.html',
                    'public/signup.html': 'public-tmp/signup.html'
                },
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                }
            }
        },
        */


        cssmin: {
            prod: {
                report: 'min',
                files: {
                    // dest: src
                    'public/styles.css': 'public-src/styles.css'
                }
            }
        },

        uglify: {
            prod: {
                options: {
                    sourceMap: 'public/pr-client-source-map.js',
                    sourceMappingURL: '/pr-client-source-map.js',
                    sourceMapPrefix: 1 // drop this many directories from the url to the original source files
                },
                files: {
                    'public/pr-client.js': 'public/pr-client-full.js'
                }
            }
        },

        shell: {
            options: {
                stdout: true,
                stderr: true,
                failOnError: true
            },
            // this is so that the files will exist on heroku (signup.html in particular because it must load over ssl, and I don't want to deal with xdomain ajax). I could change it to generate them on demand, but that's a lot of work that I don't want to do.
            'git-commit-public': {
                command: 'git commit public/ -m "committing public files for deployment: ' + (new Date()) + '"'
            },
            'heroku-push': {
                command: 'git push heroku'
            },
            'github-push': {
                command: 'git push'
            }
        },

        s3: {
            options: {
                key: process.env.AWS_KEY,
                secret: process.env.AWS_SECRET,
                region: 'us-west-2',
                bucket: 'static.pagerank.nfriedly.com',
                access: 'public-read',
                maxOperations: 4,
                gzip: true,
                headers: {
                    'Cache-Control': 'max-age=' + 60 * 60 * 24 * 365 // 1 year
                }
            },
            'prod-html': {
                options: {
                    headers: {
                        'Cache-Control': 'max-age=' + 60 * 1 // 1 minute
                    }
                },
                upload: [{
                    src: 'public/*.html',
                    dest: '/'
                }]
            },
            'prod-css-js': {
                upload: [{
                    src: 'public/*.{js,css}',
                    dest: '/'
                }]
            },
            'prod-images': {
                options: {
                    gzip: false
                },
                upload: [{
                    src: 'public/*.{jpg,png,gif}',
                    dest: '/'
                }]
            }
        }


    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-browserify2');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-replace');
    //grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-s3');

    // Default task(s).
    grunt.registerTask('default', ['clean:pre-deploy', 'jsbeautifier', 'jshint', 'csslint', 'copy:dev', 'browserify2:dev', 'express', 'watch']);

    /*'htmlmin:prod'*/
    grunt.registerTask('build-html', ['replace:prod', 'copy:prod-html-bandaid']);

    grunt.registerTask('predeploy', ['clean:pre-deploy', 'jsbeautifier', 'jshint', 'csslint', 'copy:prod', 'build-html', 'cssmin:prod', 'browserify2:compile', 'uglify:prod']);

    grunt.registerTask('deploy', ['predeploy', 'shell:git-commit-public', 'shell:heroku-push', 'shell:github-push', 's3', 'clean:post-deploy']);

    grunt.registerTask('pretty', 'jsbeautifier'); // I always misspell "jsbeautifier"
};
