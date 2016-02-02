module.exports = function(grunt) {
  grunt.initConfig({
    includes: {
      files:{
        src: ['TubeMap.js'],
        dest: '.',
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
    }
  });
  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['includes','watch']);
};
