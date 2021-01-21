
const { promises: fs } = require('fs');
const browserify = require('browserify');
const stripComments = require('strip-comments');
// const terser = require('terser')

const { logError } = require('./utils');

module.exports = {
  bundle,
};

/**
 * Builds a Snap bundle JSON file from its JavaScript source.
 *
 * @param {string} src - The source file path
 * @param {string} dest - The destination file path
 * @param {object} argv - argv from Yargs
 * @param {boolean} argv.sourceMaps - Whether to output sourcemaps
 * @param {boolean} argv.stripComments - Whether to remove comments from code
 */
function bundle(src, dest, argv) {

  const { sourceMaps: debug } = argv;

  return new Promise((resolve, _reject) => {

    const bundleStream = createBundleStream(dest);

    browserify(src, { debug })

      // TODO: Just give up on babel, which we may not even need?
      // This creates globals that SES doesn't like
      // .transform('babelify', {
      //   presets: ['@babel/preset-env'],
      // })
      .bundle((err, bundleBuffer) => {

        if (err) {
          await writeError('Build error:', err);
        }

        // TODO: minification, probably?
        // const { error, code } = terser.minify(bundle.toString())
        // if (error) {
        //   writeError('Build error:', error.message, error, dest)
        // }
        // closeBundleStream(bundleStream, code.toString())

        closeBundleStream(bundleStream, bundleBuffer ? bundleBuffer.toString() : null, {stripComments: argv.stripComments})
          .then(() => {
            if (bundleBuffer) {
              console.log(`Build success: '${src}' bundled as '${dest}'!`);
            }
            resolve(true);
          })
          .catch((errs) => await writeError('Write error:', errs.message, errs, dest));
      });
  });
}

/**
 * Opens a stream to write the destination file path.
 *
 * @param {string} dest - The output file path
 * @returns {object} - The stream
 */
function createBundleStream(dest) {
  const stream = fs.createWriteStream(dest, {
    autoClose: false,
    encoding: 'utf8',
  });
  stream.on('error', (err) => {
    writeError('Write error:', err.message, err, dest);
  });
  return stream;
}

/**
 * Postprocesses the bundle string and closes the write stream.
 *
 * @param {object} stream - The write stream
 * @param {string} bundleString - The bundle string
 * @param {object} options - post process options
 * @param {boolean} options.stripComments
 */
async function closeBundleStream(stream, bundleString, options) {
  stream.end(postProcess(bundleString, options), (err) => {
    if (err) {
      throw err;
    }
  });
}

/**
 * Postprocesses a JavaScript bundle string such that it can be evaluated in SES.
 * Currently:
 * - converts certain dot notation to string notation (for indexing)
 * - makes all direct calls to eval indirect
 * - wraps original bundle in anonymous function
 * - handles certain Babel-related edge cases
 *
 * @param {string} bundleString - The bundle string
 * @param {object} options - post process options
 * @param {boolean} options.stripComments
 * @returns {string} - The postprocessed bundle string
 */
<<<<<<< HEAD
function postProcess (bundleString, options) {
=======
function postProcess(bundleString) {
>>>>>>> bd313ac6e66800f27161d6bffab8c087f012d937

  if (typeof bundleString !== 'string') {
    return null;
  }

  let processedString = bundleString.trim();

  if (options.stripComments) {
    bundleString = stripComments(bundleString)
  }

  // .import( => ["import"](
  processedString = processedString.replace(/\.import\(/gu, '["import"](');

  // stuff.eval(otherStuff) => (1, stuff.eval)(otherStuff)
  processedString = processedString.replace(
    /((?:\b[\w\d]*[\])]?\.)+eval)(\([^)]*\))/gu,
    '(1, $1)$2',
  );

  // if we don't do the above, the below causes syntax errors if it encounters
  // things of the form: "something.eval(stuff)"
  // eval(stuff) => (1, eval)(stuff)
  processedString = processedString.replace(/(\b)(eval)(\([^)]*\))/gu, '$1(1, $2)$3');

  // SES interprets syntactically valid JavaScript '<!--' and '-->' as illegal
  // HTML comment syntax.
  // '<!--' => '<! --' && '-->' => '-- >'
  processedString = processedString.replace(/<!--/gu, '< !--');
  processedString = processedString.replace(/-->/gu, '-- >');

  // Browserify provides the Buffer global as an argument to modules that use
  // it, but this does not work in SES. Since we pass in Buffer as an endowment,
  // we can simply remove the argument.
  processedString = processedString.replace(/^\(function \(Buffer\)\{$/gmu, '(function (){');

  if (processedString.length === 0) {
    throw new Error(
      `Bundled code is empty after postprocessing.`,
    );
  }

  // handle some cases by declaring missing globals
  // Babel regeneratorRuntime
  if (processedString.indexOf('regeneratorRuntime') !== -1) {
    processedString = `var regeneratorRuntime;\n${processedString}`;
  }

  return processedString;
}

/**
 * Logs an error, attempts to unlink the destination file, and exits.
 *
 * @param {string} prefix - The message prefix.
 * @param {string} msg - The error message
 * @param {Error} err - The original error
 * @param {string} destFilePath - The output file path
 */
async function writeError(prefix, msg, err, destFilePath) {

  const processedPrefix;
  if (!prefix.endsWith(' ')) {
    processedPrefix += ' ';
  }

  logError(processedPrefix + msg, err);
  try {
    if (destFilePath) {
      await fs.unlink(destFilePath);
    }
  } catch (_err) {
    continue;
  }

  // unless the watcher is active, exit
  if (!snaps.isWatching) {
    throw new Error("Watcher isn't active!");
  }
}
