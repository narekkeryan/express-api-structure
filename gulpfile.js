var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

var config = {
    srcCss: './client/stylesheets/**/*.scss',
    buildCss: './server/public/css'
};

gulp.task('stylesheets', () => {
    return gulp.src(config.srcCss)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sass({
            outputStyle: 'expanded',
            sourceMap: true
        }).on('error', sass.logError))
        .pipe(autoprefixer({}))
        .pipe(cleanCSS())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.buildCss));
});

gulp.task('watch', () => {
    gulp.watch(config.srcCss, ['stylesheets']);
});

gulp.task('default', ['stylesheets', 'watch']);