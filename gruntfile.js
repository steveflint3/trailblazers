
    'use strict';

    module.exports = function(grunt) {

        grunt.initConfig({

            clean: ['public/js/app.js', 'public/index.html', 'public/styles.css', 'public/styles.css.map'],

            jshint: {
                options: {
                    jshintrc: '.jshintrc',
                    ignores: [
                        'node_modules/**',
                        'vendor/**',
                        'tmp/**',
                        'test/**',
                        'log/**',
                        'lib/**',
                        'db/**',
                        'config/**',
                        'bin/**',
                        'app/assets/javascripts/all-angular-files/*.js'
                    ]
                },
                source: {
                    files: {
                        src: [ 'app/assets/javascripts/**/*.js' ]
                    }
                }
            },

            copy: {
                html: {
                    files: [
                        {
                            expand: true,
                            cwd: 'app/assets/',
                            src: 'index.html',
                            dest: 'public/'
                        },
                        {
                            expand: true,
                            cwd: 'app/assets',
                            src: 'templates/**',
                            dest: 'public'
                        }
                    ]
                },
                css: {
                    files: [
                        {
                            expand: true,
                            cwd: 'node_modules/angular-openlayers-directive/dist',
                            src: [ 'angular-openlayers-directive.css' ],
                             dest: 'public/'
                        },
                        {
                            expand: true,
                            cwd: 'node_modules/openlayers/dist',
                            src: 'ol.css',
                            dest: 'public/'
                        }
                    ]
                },
                images: {
                    files: [
                        {
                            expand: true,
                            cwd: 'app/assets/',
                            src: [ 'images/**' ],
                            dest: 'public/'
                        }
                    ]
                },
                vendorjs: {
                    files: [
                        {
                            expand: true,
                            cwd: 'node_modules/jquery/dist/',
                            src: [ 'jquery.js' ],
                            dest: 'public/js'

                        },
                        {
                            expand: true,
                            cwd: 'node_modules/openlayers/dist',
                            src: [ 'ol.js' ],
                            dest: 'public/js'
                        },
                        {
                            expand: true,
                            cwd: 'node_modules/angular-sanitize/',
                            src: ['angular-sanitize.js'],
                            dest: 'app/assets/javascripts/all-angular-files'
                         },
                         {
                             expand: true,
                             cwd: 'node_modules/angular-openlayers-directive/dist/',
                             src: [ 'angular-openlayers-directive.js' ],
                             dest: 'app/assets/javascripts/all-angular-files'
                         },
                         {
                             expand: true,
                             cwd: 'node_modules/angular-ui-router/release/',
                             src: ['angular-ui-router.js'],
                             dest: 'app/assets/javascripts/all-angular-files'
                         },
                         {
                            expand: true,
                            cwd : 'node_modules/angular/',
                            src: ['angular.js'],
                            dest: 'app/assets/javascripts/all-angular-files'
                         },
                    ]
                }
            },

            concat: {
                js: {
                    src: [ 'app/assets/javascripts/trailblazer.module.js', 'app/assets/javascripts/**/*.js' ],
                    dest: 'public/js/app.js'
                },
                vendorjs: {
                    src: [ 'app/assets/all-angular-files/angular.js', 'app/assets/javascripts/all-angular-files/*.js'],
                    dest: 'public/js/all-angular-files.js'
                }
            },

            sass: {
                allStyles: {
                    files: {
                        'public/styles.css': 'app/assets/stylesheets/sass/main.scss'
                    }
                }
            },

            karma: {
                options: {
                    frameworks: ['mocha', 'chai'],
                    client: {
                        mocha: {
                            ui: 'bdd'
                        }
                    },
                    browsers: [ 'PhantomJS' ],
                    singleRun: true,

                    preprocessors: {
                        'app/assets/javascripts/**/*.js': [ 'coverage' ]
                    },
                    reporters: [ 'dots', 'coverage' ],
                    coverageReporter: {
                        type: 'text-summary'
                    }
                },
                trailsandcampgrounds: {
                    options: {
                        files: [
                            'node_modules/angular/angular.js',
                            'node_modules/angular-ui-router/release/angular-ui-router.js',
                            'node_modules/angular-openlayers-directive/dist/angular-openlayers-directive.js',
                            'node_modules/angular-sanitize/angular-sanitize.js',
                            'node_modules/angular-mocks/angular-mocks.js',
                            'app/assets/javascripts/trailblazer.module.js',
                            'app/assets/javascripts/services/trail-and-campground.service.js',
                            'app/assets/javascripts/controllers/trail-and-campground.controller.js',
                            'app/assets/tests/specs/trail-and-campground.controller.spec.js',
                            'app/assets/tests/specs/trail-and-campground.service.spec.js'
                        ]
                    }
                },
                radiusSearch: {
                    options: {
                        files: [
                            'node_modules/angular/angular.js',
                            'node_modules/angular-ui-router/release/angular-ui-router.js',
                            'node_modules/angular-openlayers-directive/dist/angular-openlayers-directive.js',
                            'node_modules/angular-sanitize/angular-sanitize.js',
                            'node_modules/angular-mocks/angular-mocks.js',
                            'app/assets/javascripts/trailblazer.module.js',
                            'app/assets/javascripts/controllers/radius-search.controller.js',
                            'app/assets/tests/specs/radius-search.controller.spec.js',
                        ]
                    }
                },
                homeMap: {
                    options: {
                        files: [
                            'node_modules/angular/angular.js',
                            'node_modules/angular-ui-router/release/angular-ui-router.js',
                            'node_modules/angular-openlayers-directive/dist/angular-openlayers-directive.js',
                            'node_modules/angular-sanitize/angular-sanitize.js',
                            'node_modules/angular-mocks/angular-mocks.js',
                            'node_modules/openlayers/dist/ol.js',
                            'app/assets/javascripts/trailblazer.module.js',
                            'app/assets/javascripts/directives/homepage-map.directive.js',
                            'app/assets/tests/specs/homepage-map.directive.spec.js'
                        ]
                    }
                },
                user: {
                    options: {
                        files: [
                            'node_modules/angular/angular.js',
                            'node_modules/angular-ui-router/release/angular-ui-router.js',
                            'node_modules/angular-openlayers-directive/dist/angular-openlayers-directive.js',
                            'node_modules/angular-sanitize/angular-sanitize.js',
                            'node_modules/angular-mocks/angular-mocks.js',
                            'app/assets/javascripts/trailblazer.module.js',
                            'app/assets/javascripts/services/user.service.js',
                            'app/assets/tests/specs/user.service.spec.js'
                        ]
                    }
                },
                signin: {
                    options: {
                        files: [
                            'node_modules/angular/angular.js',
                            'node_modules/angular-ui-router/release/angular-ui-router.js',
                            'node_modules/angular-openlayers-directive/dist/angular-openlayers-directive.js',
                            'node_modules/angular-sanitize/angular-sanitize.js',
                            'node_modules/angular-mocks/angular-mocks.js',
                            'app/assets/javascripts/trailblazer.module.js',
                            'app/assets/javascripts/services/user.service.js',
                            'app/assets/javascripts/controllers/signin.controller.js',
                            'app/assets/tests/specs/signin.controller.spec.js'
                        ]
                    }
                }
            },

            watch: {
                html: {
                    files: ['app/assets/templates/*.html', 'app/assets/index.html'],
                    tasks: ['copy:html']
                },
                sass: {
                    files: ['app/assets/stylesheets/sass/*.scss'],
                    tasks: ['sass']
                },
                js: {
                    files: ['app/assets/javascripts/**/*.js'],
                    tasks: ['test', 'concat:js']
                },
                test: {
                    files: ['app/assets/tests/**/*.js'],
                    tasks: ['test']
                }
            }
        });

        grunt.loadNpmTasks('grunt-karma');
        grunt.loadNpmTasks('grunt-contrib-clean');
        grunt.loadNpmTasks('grunt-contrib-copy');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-contrib-sass');

        grunt.registerTask('test', ['jshint'] );
        grunt.registerTask('default', [ 'test', 'clean', 'copy:css', 'copy:html', 'copy:images', 'concat:js' ] );
    };
