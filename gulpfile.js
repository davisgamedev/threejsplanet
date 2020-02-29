var gulp = require('gulp');
var fallback = require("connect-history-api-fallback");
var bs= require('browser-sync').create();


function start() {
    bs.init({
        server: {
            baseDir: "./",
            middleware: [ fallback() ]
        }
    });
    bs.reload();
}

gulp.task('serve', function(done) {// .init starts the server
    start();

    gulp.watch(["./*"]).on("change", bs.reload);
    done();
});