# Jesse Reitz Branding
Branding is probably a bit of a strong word here. Essentially, this is a collection
of JavaScript and CSS to provide a unifying theme between my projects.

## Including The Libraries
I use the [jsDelivr](https://www.jsdelivr.com/) cdn to serve these from GitHub.
To use each library, use the following tags, replacing '--version--' with the
[latest release version](https://github.com/jessereitz/branding/releases) of
this repo.

To include the JavaScript library, include the following:
```html
<script src="https://cdn.jsdelivr.net/gh/jessereitz/branding@--version--/assets/js/rbrandlib.js" type="text/javascript"></script>
```
To include the CSS library, include the following:
```html
<link href="https://cdn.jsdelivr.net/combine/gh/jessereitz/branding@--version--/assets/css/rbrandlib.css" type="text/css" rel="stylesheet">
```

## Usage
The CSS library is mainly based on tags, not classes or ids. It doesn't need
much configuration. Just load and go.

The JavaScript library includes the following components:

### Menu
To include a menu, simply add the class `menuTarget` to any text element. This
will create a link in the menu using the element's textContent as its own text.
Clicking the link will scroll the element into view.

If including code snippets, I use [Google's code-prettify](https://github.com/google/code-prettify)
with a [custom theme from Yoshihide Jimbo](https://github.com/jmblog/color-themes-for-google-code-prettify).
To use, include the following in the head of the HTML document:

```html
<link href="https://cdn.jsdelivr.net/combine/gh/jessereitz/branding@--version--/assets/css/code-theme.css" type="text/css" rel="stylesheet">

<script crossorigin src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js"></script>
```

Then use a <pre\> tag like so:

```html
<pre class="prettyprint lang-javascript">
const variable = Function(document.getElementById('element'));
</pre>
```

A <code\> tag can also be used but only for inline snippets.


## Build Process
For JavaScript, I use [rollup.js](https://rollupjs.org/guide/en) to package
everything into a single file. I also use [Babel](https://babeljs.io/) to
transpile everything and [UglifyJS](https://github.com/mishoo/UglifyJS2) to
minimize it. All JavaScript is linted using the [AirBnB JavaScript Style Guide](https://github.com/airbnb/javascript).

For CSS, everything is written in SCSS and packaged into a single site.css file.

Everything in the build process is run as an npm script:

`$ npm run sass-watch` just runs sass with the `--watch` option. Output is
`site.css` in the `assets/css` directory.

`$ npm run sassify` runs sass without the `--watch` option. Output is
`site.css` in the `assets/css` directory.

`$ npm run build-iife` runs rollup.js to package the `src` directory. Output is
`rbrandlib.js` in the `assets/js` directory. If the environment variable
`BUILDTARGET` is set to `PROD`, the code will be run through UglifyJS.

`$ npm run buld-prod` builds a production version of everything. Essentially,
just calls `sassify` and `build-iife` (with `BUILDTARGET=PROD`) above.
