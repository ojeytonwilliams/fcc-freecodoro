'use strict';

var sass = require('gulp-sass');
var gulp = require('gulp');

gulp.task('sass', function() {
  return gulp.src('./src/scss/**/*.scss')
.pipe(sass().on('error', sass.logError))
.pipe(gulp.dest('./www/css'));
});

gulp.task('watch:sass', function() {
  gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass'));
});

gulp.task('default', gulp.series('sass','watch:sass', function(done){
	done();
}));

