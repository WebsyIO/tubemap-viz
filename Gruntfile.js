module.exports = function(grunt) {
  grunt.initConfig({
    includes: {
      files:{
        src: ['TubeMapViz.js'],
        dest: 'build',
        cwd: 'src'
      }
    },
    watch: {
      scripts: {
        files: ['src/**/*.js'], // which files to watch
        tasks: ['includes'],
        options: {
          nospawn: true,
          livereload: true
        }
      }
    },
    uglify:{
      options : {
        beautify : false,
        mangle   : true
      },
      build: {
        files: {
          'build/TubeMapViz.min.js': ['build/TubeMapViz.js']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['includes','uglify','watch']);
};
