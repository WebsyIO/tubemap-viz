module.exports = function(grunt) {
  grunt.initConfig({
    includes: {
      files:{
        src: ['tube-map-viz.js'],
        dest: 'build',
        cwd: 'src'
      }
    },
    watch: {
      scripts: {
        files: ['src/**/*.js'], // which files to watch
        tasks: ['includes','uglify'],
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
          'build/tube-map-viz.min.js': ['build/tube-map-viz.js']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['includes','uglify','watch']);
};
