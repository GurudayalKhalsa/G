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
        dev_min:'<%= dev_dir %>/<%= pkg.name %>.min.js',

        dev_banner: ['/**\n',
                ' * <%= pkg.name %> v<%= pkg.version %>-dev, <%= grunt.template.today("yyyy-mm-dd") %>\n',
                ' * <%= pkg.description %>\n',
                ' *\n',
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
                ' * Licensed <%= pkg.license %>\n',
                ' */\n'].join(''),

        build_dir:'dist',
        build:'<%= build_dir %>/<%= pkg.name %>.js',
        build_min:'<%= build_dir %>/<%= pkg.name %>.min.js',

        build_banner: ['/**\n',
                ' * <%= pkg.name %> v<%= pkg.version %>, <%= grunt.template.today("yyyy-mm-dd") %>\n',
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
                banner: '<%= build_banner %>',
                mangle:true
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
        'clean:dev',
        'concat:dev',
        // 'jshint:dev',
        'uglify:dev',
        'watch'
    ]);

    // Default tasks
    grunt.registerTask('build',[
        'clean:build',
        'concat:build',
        // 'jshint:build',
        'uglify:build'
    ]);

};