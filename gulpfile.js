var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('gulp-browserify');
var connect = require('gulp-connect');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var isProduction = -1 !== process.argv.indexOf('--prod');
var install = require("gulp-install");
var spawn = require('child_process').spawn;
var gutil = require('gulp-util');
var serverPort = process.env.PORT || 8080;

gulp.task('install_deps', function() {
    gulp.src(['./bower.json', './package.json'])
        .pipe(install());
});

gulp.task('sass', function() {
    var stream = gulp.src('src/styles/base.scss')
        .pipe(sass())
        .on('error', console.log)
        .pipe(rename('style.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .on('error', console.log),
        streamMobile = gulp.src('src/styles/mobile/base.scss')
            .pipe(sass())
            .on('error', console.log)
            .pipe(rename('mobile.css'))
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .on('error', console.log);

    if (isProduction) {
        stream.pipe(minifycss());
        streamMobile.pipe(minifycss());
    }

    stream
        .pipe(gulp.dest('assets/css'))
        .pipe(connect.reload());

    streamMobile
        .pipe(gulp.dest('assets/css'))
        .pipe(connect.reload());
});

gulp.task('browserify', function () {
    var stream = gulp.src(['src/app.js'], {read: true})
        .pipe(browserify({
            debug: true,
            transform: ['hbsfy'],
        }))
        .on('error', console.log)
        .pipe(rename('app.js'));

    if (isProduction) {
        stream.pipe(uglify());
    }

    stream
        .pipe(gulp.dest('assets/js'))
        .pipe(connect.reload());
});

gulp.task('connect', function () {
    connect.server({
        port: process.env.PORT || 8080,
        fallback: 'index.html',
        livereload: true,
    });
});

gulp.task('watch', function () {
    gulp.watch(['src/**/*.{js,hbs}'], ['browserify']);
    gulp.watch(['src/**/*.scss'], ['sass']);
    gulp.watch(['index.html'], function () {
        gulp.src('index.html').pipe(connect.reload());
    });
});

gulp.task('test', function () {
    var tests = [
        'tests/city_title.js',
        'tests/last_cities.js',
        'tests/now_block_exists.js',
        'tests/forecast_url.js',
        'tests/tab_clicker.js'
    ];

    var casperChild = spawn('casperjs', ['test'].concat(tests));

    casperChild.stdout.on('data', function (data) {
        gutil.log('CasperJS:', data.toString().slice(0, -1)); // Remove \n
    });

    casperChild.on('close', function (code) {
        var success = code === 0; // Will be 1 in the event of failure

        // Do something with success here
    });
});

gulp.task('build', ['sass', 'browserify']);
gulp.task('default', ['install_deps','build', 'connect', 'watch']);
