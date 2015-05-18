"use strict";

var 
	gulp = require('gulp'),
	clean = require('gulp-clean'),
	concatCss = require('gulp-concat-css'),
	ftp = require('gulp-ftp'),
	gulpif = require('gulp-if'),
	imagemin = require('gulp-imagemin'),
	minifyCss = require('gulp-minify-css'),
	notify = require("gulp-notify"), //.pipe(notify("Found file: <%= file.relative %>!"))
	prefixer  = require('gulp-autoprefixer'),
	rename = require("gulp-rename"),
	replace = require('gulp-replace'),
	rev = require('gulp-rev-append'),
	sass = require('gulp-sass'),
	server = require('gulp-server-livereload'),
	size = require('gulp-size'),
	uglify = require('gulp-uglify'),
	uncss  = require('gulp-uncss'),
	useref = require('gulp-useref'),
	wiredep = require('wiredep').stream;

// sass
gulp.task('sass', function () {
	return gulp.src('app/sass/*.sass')
	.pipe(sass({style: "compressed", noCache: true}))
		.on("error", notify.onError({
			message: 'Error: <%= error.message %>'
		}))
	.pipe(prefixer())
	.pipe(gulp.dest('app/css'));
});

// replace
gulp.task('replace', function(){
	gulp.src(['app/index.html'])
		.pipe(replace(/[\?]rev=(.*)[\"]/g, '"'))
		.pipe(gulp.dest('app'));
});

// css
gulp.task('css', function() {
	return gulp.src('app/css/media.css')
		.pipe(prefixer())
		.pipe(gulp.dest('app/css'));
});

// rev
gulp.task('rev', function() {
	gulp.src('app/app.html')
		.pipe(rev())
		.pipe(rename('index.html'))
		.pipe(gulp.dest('app'));
});

// bower <<  bower install --save bootstrap
gulp.task('bower', function () {
	gulp.src('app/app.html')
		.pipe(wiredep({
			directory : "app/bower_components"
		}))
		.pipe(gulp.dest('app'));
});

// webserver
gulp.task('webserver', function() {
	return gulp.src('app')
	.pipe(server({
		livereload: true,
	}));
});

// ftp
gulp.task('ftp', function () {
	return gulp.src('dist/**/*')
		.pipe(ftp({
			host: 'ftp.byethost14.com',
			user: 'b14_15828070',
			pass: '1x2x3x4x5x6x',
			remotePath: "/my-apps.cu.cc/htdocs/test"
		}))
		.pipe(size());
});

// clean
gulp.task('clean', function () {
	return gulp.src('dist', {read: false})
		.pipe(clean());
});

// build
gulp.task('build',['clean','replace','fonts','imagemin'], function () {
	var assets = useref.assets();
	gulp.src('app/index.html')
		.pipe(assets)
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', uncss({ html: ['app/index.html']})))
		.pipe(gulpif('*.css', minifyCss()))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('dist'))
		.pipe(size());
});

// fonts
gulp.task('fonts', function() {
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));
});

// imagemin
gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img'));
});

// watch
gulp.task('watch', function() {
	gulp.watch('app/css/media.css',['css']);
	gulp.watch('app/sass/*.sass',['sass']);
	gulp.watch(['app/css/*.css','app/js/*.js',['app/app.html']],['rev']);
	gulp.watch('bower.json',['bower']);
});

gulp.task('default', ['webserver', 'sass', 'css', 'rev', 'bower', 'watch']);