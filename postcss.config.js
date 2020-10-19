const path = require('path');
console.log('postcss.config подключен');

function sortMedia(a, b, revers = false) {

  function searchMedia(val) {
    let maxWidth = /max-width\s*:\s*[\d+.]+/;
    let minWidth = /min-width\s*:\s*[\d+.]+/;
    let digit = /[\d.]+/;
    let result = null;
    let [other, max, min] = [0, 1, 2];
    
    result = val.match(maxWidth);
    if (result) return [+result[0].match(digit)[0], max];
    
    result = val.match(minWidth);
    if (result) return [+result[0].match(digit)[0], min];

    return [val, other];
  }


  console.log('a', a);
  console.log('b', b);
  a = searchMedia(a);
  b = searchMedia(b);
  console.log('a', a);
  console.log('b', b);
  if (revers) {
    [a, b] = [b, a];
    console.log(revers)
  }

  if (b[1] != a[1]) {
    return b[1] - a[1];
  }

  return b[0] - a[0];
}

// console.log(sortMedia('(min-width: 800px) and (max-width: 1200px)', '(min-width: 320px) and (max-width: 799px)'))

module.exports = {
  plugins: [
    // require('postcss-preset-env'),
    require('autoprefixer'),
    require('css-mqpacker')({
      sort: sortMedia
    }),
    require('cssnano')({preset: ['default', {
      cssDeclarationSorter: false,
      normalizeWhitespace: false,
      mergeRules: false
    }]}),
    require('postcss-normalize')({ browsers: 'last 2 versions' }),
    // require('stylelint'),
    require('stylefmt')
  ]
}

// const postcss = require('postcss')
// const postcssNormalize = require('postcss-normalize')

// postcss([postcssNormalize(/* pluginOptions */)]).process(YOUR_CSS /*, processOptions */)