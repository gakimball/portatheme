# portatheme

> Small, opinionated theme bundler

[![Travis](https://img.shields.io/travis/spacedoc/portatheme.svg?maxAge=2592000)](https://travis-ci.org/spacedoc/portatheme) [![npm](https://img.shields.io/npm/v/portatheme.svg?maxAge=2592000)](https://www.npmjs.com/package/portatheme)

## Installation

```bash
npm install portatheme
```

## Setup

A theme has these features:

- A set of *layouts*, which are Pug templates. Every theme must have at least one layout called `default.pug`.
- Sass compilation using node-sass and Eyeglass.
- JavaScript compilation and bundling using Webpack with Babel support.
- Static asset copying.

A minimal theme is structured like this:

```txt
- theme/
  - assets/
  - js/
    - index.js
  - sass/
    - index.scss
  - templates/
    - default.pug
```

Let's break it down.

- `assets` includes static assets like images and fonts.
- `js` includes JavaScript required by your theme.
- `sass` includes Sass required by your theme.
- `templates` includes Pug templates that will render pages.

Static assets placed at the root of the theme, such as a `robots.txt`, will also be copied.

Only the `templates` folder is required, and the only required file in that folder is `default.pug`. All other features&dash;static files, Sass, and JavaScript&mdash;are optional.

## Usage

```js
import Theme from 'portatheme';

// Initialize the theme with a file path
// The theme can be in node_modules or a local folder
const catTheme = new Theme('./cat-theme');

// Set an output folder for pages and theme assets
catTheme.outputTo('./dist');

// Create a page by passing a file name and data object
catTheme.compilePage('index.html', { title: 'Home' }).then(() => console.log('Page built.'));

// Compile theme assets (static files, Sass, and JavaScript)
catTheme.build().then(() => console.log('Assets compiled.'))
```

## Inheritance

A theme can inherit the layouts, assets, Sass, and JavaScript of another theme. Here's how it works:

- Any layout in a theme or its parents can be used. If a child theme has a layout with the same name as a parent theme, the child layout will be used.
- All static assets are combined together and copied to the final build folder.
- The child Sass files can import the parent theme's Sass using `@import '<parent theme>';`, where `<parent theme>` is the folder name of the parent theme.
- The child JavaScript files can import the parent theme's JavaScript using `require('<parent theme>');` or `import '<parent theme>';`.

Note that if a parent theme has Sass or JavaScript features, the child theme must import the parent theme's files for them to be compiled.

Here's what theme inheritance looks like:

```js
import Theme from 'portatheme';

const catTheme = new Theme('cat-theme');
const kittenTheme = new Theme('./lib/kitten-theme', catTheme);

// Any layout in cat-theme/ or kitten-theme/ can be referenced
kittenTheme.compilePage('index.html', {}, 'catLayout');
```

If `cat-theme/` has a Sass codebase, `kitten-theme/` can import those files:

```scss
@import 'cat-theme';
```

It works the same with JavaScript:

```js
import 'cat-theme';
```

## API

### new Theme(location[, parent])

Create a new theme.

- **location** (String): path to theme folder. Should be an absolute path, or relative to the current working directory.
- **parent** (Theme): *Optional.* Theme to inherit assets from.

#### Theme.outputTo(location)

Define the output folder when building theme assets and pages. Call this before using other theme methods.

- **location** (String): path to output to.

#### Theme.compilePage(dest[, data, layout])

Create a page using one of the theme's layouts, paired with a data object.

- **dest** (String): name of file to output, e.g. `index.html`. The path is relative to the root folder set with `Theme.outputTo()`.
- **data** (Object): object to pass to Pug template.
- **layout** (String): theme template to use. Defaults to `default`.

Returns a Promise which resolves when the page has been written to disk, or rejects if there's an error.

#### Theme.compileString([data, layout])

Create an HTML string using one of the theme's layouts, paired with a data object.

- **data** (Object): object to pass to Pug template.
- **layout** (String): theme template to use. Defaults to `default`.

Returns an HTML string.

#### Theme.build()

Build the assets of a theme: static files, CSS, and JavaScript.

Returns a Promise which resolves when the build process is done, or rejects if there's an error.

#### Theme.buildAndWatch()

Build the assets of a theme, then watch for changes to theme files and rebuild when necessary.

Returns a Promise which rejects if there's an error. The Promise will never resolve, because file watching goes on indefinitely.

## Local Development

```bash
git clone https://github.com/spacedoc/portatheme
cd portatheme
npm install
npm test
```

## License

MIT &copy; [Geoff Kimball](http://geoffkimball.com)
