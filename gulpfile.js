var gulp = require("gulp");
var uglify = require("gulp-uglify");
var insert = require("gulp-file-insert");
var sass = require('gulp-sass');
var concat = require("gulp-concat");
var size = require("gulp-size");

gulp.task("sass", function() {
    return gulp.src([__dirname + "/src/scss/toast.scss"])
        .pipe(sass({outputStyle: "compressed"}).on('error', sass.logError))
        .pipe(gulp.dest(__dirname + "/dist/css"));
});

gulp.task("uglify:compat", function() {
    return gulp.src([
        __dirname + "/node_modules/es6-promise/dist/es6-promise.min.js",
        __dirname + "/src/js/**/*.js"
    ])
        .pipe(concat("toast-polyfill.js"))
        .pipe(insert({ "@@style": __dirname + "/dist/css/toast.css"} ))
        .pipe(uglify())
        .pipe(size({ gzip: true, title: "With polyfill" }))
        .pipe(gulp.dest("dist/js"))
});

gulp.task("uglify", function () {
    return gulp.src([
        __dirname + "/src/js/**/*.js"
    ])
        .pipe(concat("toast.js"))
        .pipe(insert({ "@@style": __dirname + "/dist/css/toast.css"} ))
        .pipe(uglify())
        .pipe(size({ gzip: true, title: "No polyfill" }))
        .pipe(gulp.dest("dist/js"))
});

gulp.task("watch", function () {
    gulp.watch(__dirname + "/src/scss/**/*.scss", ["sass"]);
    gulp.watch(__dirname + "/dist/css/**/*.css", ["uglify", "uglify:compat"]);
    gulp.watch(__dirname + "/src/js/**/*.js", ["uglify", "uglify:compat"]);
});