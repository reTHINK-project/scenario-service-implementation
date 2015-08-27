var gulp = require('gulp');
var gutil = require('gulp-util');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var buffer = require('vinyl-buffer');
var del = require('del'); // rm -rf
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var compass = require('gulp-compass');
var assign = require('lodash').assign;
var browserSync = require('browser-sync').create();
var Server = require('karma').Server;

function handleError(err) {
  gutil.log(gutil.colors.red(err.toString()));
  this.emit('end');
}

function trace(log) {
  console.log(log);
}

gulp.task('clean', function(done) {

  del(['./dist/*.js'], function(err, paths) {
    if (err) {
      handleError(err);
      return;
    }

    gutil.log('Deleted files:\n', gutil.colors.green(paths.join('\n')));
    done();
  });

});

gulp.task('agent', function(done) {
  browserify({
    insertGlobals: true,
    entries: './js/rethinkAgent.js',
    debug: true,
  }).transform(babelify.configure({compact: false}))
  .bundle()
  .on('error', handleError)
  .pipe(source('rethinkAgent.js'))
  .pipe(gulp.dest('./dist'))
  .on('end', function() {
    gutil.log(gutil.colors.green('Rethink Agent Installer has been processed'));
    done();
  });
});

// add custom browserify options here
var customOpts = {
  entries: ['./js/main.js'],
  debug: true,
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));
b.transform(babelify.configure({
  compact: false,
}));

gulp.task('main', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

function bundle() {

  return b.bundle()

    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('main.js'))

    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())

    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist'));
}

gulp.task('installer', function(done) {
  browserify({
    insertGlobals: true,
    entries: './js/rethink.js',
    debug: true,
  })
  .transform(babelify.configure({compact: false}))
  .bundle()
  .on('error', handleError)
  .pipe(source('rethink.js'))
  .pipe(gulp.dest('./dist'))
  .on('end', function() {
    gutil.log(gutil.colors.green('Rethink file has been processed'));
    done();
  });
});

gulp.task('compass', function() {
  gulp.src('./sass/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: 'css',
      sass: 'sass'
    })).on('error', handleError)
    .pipe(gulp.dest('css'));
});

gulp.task('sass:watch', function() {
  gulp.watch('./sass/**/*.scss', ['compass']);
});

gulp.task('watch', function() {
  gulp.watch('./js/rethink.js', ['installer']);
  gulp.watch('./js/rethinkAgent.js', ['agent']);
});


/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('default', ['clean', 'main', 'installer', 'agent', 'watch', 'compass', 'sass:watch']);
