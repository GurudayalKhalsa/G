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

        dev_dir: 'dev',
        dev:'<%= dev_dir %>/<%= pkg.name %>.js',

        dev_banner: ['/**\n',
                ' * <%= pkg.name %> <%= pkg.devversion %>-dev, <%= grunt.template.today("yyyy-mm-dd") %>\n',
                ' * <%= pkg.description %>\n',
                ' *\n',
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
                ' * Licensed <%= pkg.license %>\n',
                ' */\n'].join(''),

        build_dir:'dist',
        build:'<%= build_dir %>/<%= pkg.name %>-<%= pkg.version %>.js',
        build_min:'<%= build_dir %>/<%= pkg.name %>-<%= pkg.version %>.min.js',

        build_banner: ['/**\n',
                ' * <%= pkg.name %> <%= pkg.version %>, <%= grunt.template.today("yyyy-mm-dd") %>\n',
                ' * <%= pkg.description %>\n',
                ' *\n',
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
                ' * Licensed <%= pkg.license %>\n',
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
                banner: '<%= banner %>',
                mangle:true
            },
            build: {
                files: {
                    '<%= build_min %>': ['<%= build %>']
                }
            },
        },

        watch: {
            js: {
                files: '<%= src %>',
                tasks: ['concat:dev']
            }
        },

    });

    // Default tasks
    grunt.registerTask('default',[
        'concat:dev',
        // 'jshint:dev',
        'watch'
    ]);

    // Default tasks
    grunt.registerTask('build',[
        'concat:build',
        // 'jshint:build',
        'uglify:build'
    ]);

};