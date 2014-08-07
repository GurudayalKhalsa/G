/**
 * This gruntfile does multiple things
 * 
 *
 *
 */
module.exports = function(grunt){

    "use strict";
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        src: [
            'src/intro.js',
            'src/core/init.js',
            'src/lib/*.js',

            'src/core/object.js',
            ['src/core/*.js', '!src/core/main.js'],

            'src/shapes/rect.js',
            'src/shapes/image.js',
            'src/shapes/*.js',

            'src/physics/main.js',
            'src/physics/*.js',

            'src/util/*.js',
            'src/core/main.js',
            'src/outro.js'
        ],

        dev_dir: 'dist',
        dev:'<%= dev_dir %>/<%= pkg.name %>.js',
        dev_min:'<%= dev_dir %>/<%= pkg.name %>.min.js',

        dev_banner: ['/**\n',
                ' * <%= pkg.name %> <%= pkg.version %>-dev, <%= grunt.template.today("yyyy-mm-dd") %>\n',
                ' * <%= pkg.description %>\n',
                ' *\n',
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
                ' * Licensed under <%= pkg.license %>\n',
                ' */\n'].join(''),

        build_dir:'dist',
        build:'<%= build_dir %>/<%= pkg.name %>.js',
        build_min:'<%= build_dir %>/<%= pkg.name %>.min.js',
        
        site: '../site/dist/G.js',
        site_min: '../site/dist/G.min.js',

        build_banner: ['/**\n',
                ' * <%= pkg.name %> <%= pkg.version %>, <%= grunt.template.today("yyyy-mm-dd") %>\n',
                ' * <%= pkg.description %>\n',
                ' *\n',
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
                ' * Licensed under <%= pkg.license %>\n',
                ' */\n'].join(''),

        clean: {
            build: {
                src: '<%= build_dir %>'
            },
            dev: {
                src: '<%= dev_dir %>'
            }
        },

        jshint: {
            dev:{
                src: '<%= dev %>'
            },
            build: {
                src: '<%= build %>',
           }

            
        },

        concat: {
            dev: {
                options:{
                    banner: '<%= dev_banner %>',
                    separator: '\n\n'
                },
                src: '<%= src %>',
                dest: '<%= dev %>'
            },
            site: {
                options:{
                    banner: '<%= dev_banner %>',
                    separator: '\n\n'
                },
                src: '<%= src %>',
                dest: '<%= site %>'
            },
            build: {
                options:{
                    banner: '<%= build_banner %>',
                    separator: '\n\n'
                },
                src: '<%= src %>',
                dest: '<%= build %>'
           }
        },

        uglify: {
            options: {
                banner: '<%= build_banner %>',
                mangle:{
                    except:["Class"]
                }
            },
            build: {
                files: {
                    '<%= build_min %>': ['<%= build %>']
                }
            },
            dev: {
                files: {
                    '<%= dev_min %>': ['<%= dev %>']
                }
            },
            site: {
                files: {
                    '<%= site_min %>': ['<%= build %>']
                }
            },
        },

        watch: {
            js: {
                files: '<%= src %>',
                tasks: ['concat:dev', 'concat:site', 'uglify:site']
            }
        },

    });

    // Default tasks
    grunt.registerTask('dev',[
        'clean:dev',
        'concat:dev',
        'uglify:dev',
        'concat:site',
        'uglify:site',
        // 'jshint:dev',
        'watch'
    ]);

    // Default tasks
    grunt.registerTask('default',[
        'clean:build',
        'concat:build',
        // 'jshint:build',
        'uglify:build',
        'concat:site',
        'uglify:site',
    ]);

};