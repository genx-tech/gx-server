const path = require('path');
const { _, fs, Promise, replaceAll, ensureRightSlash, trimLeftSlash } = require('rk-utils');
const { Helpers: { tryRequire } } = require('@genx/app');

/**
 * Markdown middleware.
 * @module Middleware_Markdown
 */

const cachePages = {};
let cacheLayout;

const defaultOpts = {
  cache: false,
  titleHolder: '{{TITLE}}',
  bodyHolder: '{{BODY}}',
  indexName: 'index',
  baseUrl: '/'
};

module.exports = function (options, app) {
  assert: options && options.root, 'options.root required';

  _.defaults(options, defaultOpts);

  options.baseUrl = ensureRightSlash(trimLeftSlash(options.baseUrl));
  options.layout = options.layout || path.join(options.root, 'layout.html');

  // support custom markdown render
  if (typeof options.render !== 'function') {
    let md = tryRequire('markdown-it')(options.mdOptions);
    options.render = content => md.render(content);
  }

  const defaultLayout = `
<!DOCTYPE html>
<html>
  <head>
    <title>{{TITLE}}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Bootstrap -->
    <link href="https://cdn.staticfile.org/twitter-bootstrap/3.0.0-rc1/css/bootstrap.min.css" rel="stylesheet" media="screen">
  </head>
  <body>
    <div class="container">
    {{BODY}}
    </div>
    <!-- JavaScript plugins (requires jQuery) -->
    <script src="https://cdn.staticfile.org/jquery/2.0.3/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="https://cdn.staticfile.org/twitter-bootstrap/3.0.0-rc1/js/bootstrap.min.js"></script>

    <!-- Enable responsive features in IE8 with Respond.js (https://github.com/scottjehl/Respond) -->
    <script src="https://cdn.staticfile.org/respond.js/1.2.0/respond.min.js"></script>
  </body>
</html>
`;

  return async (ctx, next) => {
    if (ctx.method !== 'GET') {
      return next();
    }

    let pathname = trimLeftSlash(ctx.path);
    // get md file path

    // index file
    if (pathname + '/' === options.baseUrl
      || pathname === options.baseUrl) {
      pathname = options.baseUrl + options.indexName;
    } else if (!pathname.startsWith(options.baseUrl)) {
        return next();
    }

    pathname = pathname.substr(options.baseUrl.length);    
    pathname = path.join(options.root, pathname + '.md');

    // generate html
    let html = await getPage(pathname);
    if (html === null) {  
      return next();
    }
    ctx.type = 'html';
    ctx.body = html;
  };

  async function getPage(filepath) {      
    if (options.cache && filepath in cachePages) {
      return cachePages[filepath];
    }
    let r;
    try {
      r = await Promise.all([getLayout(), getContent(filepath)]);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return null;
      }
      throw err;
    }

    let layout = r[0];
    let content = r[1];
    let html = replaceAll(layout, options.titleHolder, content.title);
    html = replaceAll(html, options.bodyHolder, content.body);

    if (options.cache) {
      cachePages[filepath] = html;
    }
    return html;
  }

  async function getLayout() {
    if (options.cache && cacheLayout) return cacheLayout;
    let layout = (await fs.exists(options.layout)) ? (await fs.readFile(options.layout, 'utf8')) : defaultLayout;
    if (options.cache) cacheLayout = layout;
    return layout;
  }

  async function getContent(filepath) {
    let content = await fs.readFile(filepath, 'utf8');
    let title = content.slice(0, content.indexOf('\n')).trim().replace(/^[#\s]+/, '');
    let body = options.render(content);
    return {
      title: title,
      body: body
    };
  }
};
