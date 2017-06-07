/* eslint-env mocha */
/* eslint no-unused-expressions:0 */

'use strict';

const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiFiles = require('chai-files');
const Gulp = require('gulp').Gulp;
const tmp = require('tmp');
const compile = require('../lib/compile');
const getAssetStreams = require('../lib/get-asset-streams');
const getEyeglassConfig = require('../lib/get-eyeglass-config');
const getLocation = require('../lib/get-location');
const getWatchPaths = require('../lib/get-watch-paths');
const NoLayoutError = require('../lib/no-layout-error');
const webpackConfig = require('../lib/webpack.config');
const Theme = require('..');

chai.use(chaiAsPromised);
chai.use(chaiFiles);

const expect = chai.expect;
const file = chaiFiles.file;
const folder = chaiFiles.dir;

describe('Theme', () => {
  describe('constructor', () => {
    it('creates a new instance of Theme', () => {
      expect(new Theme('test')).to.be.an.instanceOf(Theme);
    });

    it('sets a theme location', () => {
      const theme = new Theme('test/fixtures/base');
      expect(theme.location).to.contain('test/fixtures/base');
    });

    it('inherits a parent theme', () => {
      const parent = new Theme('test/fixtures/base');
      const theme = new Theme('test/fixtures/child', parent);
      expect(theme.parents[0]).to.contain('test/fixtures/base');
    });

    it('can go deeper', () => {
      const grandparent = new Theme('test/fixtures/base');
      const parent = new Theme('test/fixtures/child', grandparent);
      const theme = new Theme('mocha', parent);
      expect(theme.parents[0]).to.contain('test/fixtures/child');
      expect(theme.parents[1]).to.contain('test/fixtures/base');
    });
  });

  describe('outputTo', () => {
    it('sets theme output folder', () => {
      const theme = new Theme('test');
      theme.outputTo('dist');
      expect(theme).to.have.property('dest').that.contains('dist');
    });

    it('throws an error if path is not a string', () => {
      const theme = new Theme('test');
      expect(() => theme.outputTo(false)).to.throw(Error);
    });
  });

  describe('compilePage()', () => {
    it('compiles a page', () => {
      const theme = new Theme('test/fixtures/base');
      const dir = tmp.dirSync();
      theme.outputTo(dir.name);
      return theme.compilePage('index.html', {body: 'Kittens'}).then(() => {
        expect(file(path.join(dir.name, 'index.html'))).to.contain('Kittens');
      });
    });

    it('allows an alternate layout to be specified', () => {
      const theme = new Theme('test/fixtures/base');
      const dir = tmp.dirSync();
      theme.outputTo(dir.name);
      return theme.compilePage('index.html', {body: 'Kittens'}, 'alternate').then(() => {
        expect(file(path.join(dir.name, 'index.html'))).to.contain('Puppies');
      });
    });

    it('rejects if no destination has been set', () => {
      const theme = new Theme('test/fixtures/base');
      return expect(theme.compilePage('index.html', {})).to.eventually.be.rejectedWith(Error);
    });

    it('rejects if there is a Pug error', () => {
      const theme = new Theme('test/fixtures/base');
      const dir = tmp.dirSync();
      theme.outputTo(dir.name);
      return expect(theme.compilePage('index.html', {body: 'Kittens'}, 'nope')).to.eventually.be.rejectedWith(Error);
    });

    it('can handle a path with a directory', () => {
      const theme = new Theme('test/fixtures/base');
      const dir = tmp.dirSync();
      theme.outputTo(dir.name);
      return theme.compilePage('subdir/index.html', {body: 'Kittens'}).then(() => {
        expect(file(path.join(dir.name, 'subdir/index.html'))).exist;
      });
    });
  });

  describe('compileString()', () => {
    it('compiles a Pug template to HTML', () => {
      const theme = new Theme('test/fixtures/base');
      expect(theme.compileString({body: 'Kittens'})).to.contain('Kittens');
    });

    it('allows an alternate layout to be specified', () => {
      const theme = new Theme('test/fixtures/base');
      expect(theme.compileString({body: 'Kittens'}, 'alternate')).to.contain('Puppies');
    });

    it('throws Pug errors', () => {
      const theme = new Theme('test/fixtures/base');
      expect(() => theme.compileString({}, 'error')).to.throw(SyntaxError);
    });

    it('looks in the child and parent themes for a layout', () => {
      const parent = new Theme('test/fixtures/base');
      const theme = new Theme('test/fixtures/child', parent);
      expect(theme.compileString({body: 'Kittens'})).to.contain('Kittens');
    });

    it('throws an error if no layout is found', () => {
      const theme = new Theme('test/fixtures/base');
      expect(() => theme.compileString({}, 'nope')).to.throw(NoLayoutError);
    });
  });

  describe('build()', () => {
    it('compiles the assets of a theme', function () {
      // This test runs super slow on Node 4
      this.timeout(0);
      const theme = new Theme('test/fixtures/base');
      const dir = tmp.dirSync();
      theme.outputTo(dir.name);
      return theme.build().then(() => {
        expect(folder(dir.name)).to.exist;
      });
    });

    it('rejects if no destination has been set', () => {
      const theme = new Theme('test/fixtures/base');
      return expect(theme.build()).to.eventually.be.rejectedWith(Error);
    });
  });

  describe('buildAndWatch()', () => {
    it('compiles the assets of a theme', () => {
      const theme = new Theme('test/fixtures/base');
      const dir = tmp.dirSync();
      theme.outputTo(dir.name);
      return theme.build().then(() => {
        expect(folder(dir.name)).to.exist;
      });
    });

    it('rejects if no destination has been set', () => {
      const theme = new Theme('test/fixtures/base');
      return expect(theme.build()).to.eventually.be.rejectedWith(Error);
    });
  });
});

describe('getLocation()', () => {
  it('finds a theme folder', () => {
    expect(getLocation('test/fixtures/base')).to.contain('/test/fixtures/base');
  });

  it('can find a folder in node_modules', () => {
    // Mocha isn't a theme folder, but we can use it to test that node_modules are searched
    expect(getLocation('mocha')).to.contain('/node_modules/mocha');
  });
});

describe('compile()', () => {
  let dir;

  before(() => {
    const theme = path.join(__dirname, 'fixtures/base');
    dir = tmp.dirSync();
    return compile([theme], dir.name)();
  });

  it('copies root assets', () => {
    const robots = path.join(dir.name, 'robots.txt');
    return expect(file(robots)).to.exist;
  });

  it('copies the assets folder', () => {
    const assets = path.join(dir.name, 'assets/asset.txt');
    return expect(file(assets)).to.exist;
  });

  it('compiles Sass to CSS', () => {
    const css = path.join(dir.name, 'css/style.css');
    return expect(file(css)).to.exist;
  });

  it('compiles and bundles JS with Webpack', () => {
    const js = path.join(dir.name, 'js/script.js');
    return expect(file(js)).to.exist;
  });
});

describe('webpackConfig()', () => {
  it('returns an object', () => {
    expect(webpackConfig([])).to.be.an('object');
  });

  it('allows the watch option to be enabled', () => {
    expect(webpackConfig([], true)).to.have.property('watch', true);
  });

  it('adds aliases to parent themes', () => {
    const locations = [
      'test/fixtures/base',
      'test/fixtures/parent'
    ];
    expect(webpackConfig(locations))
      .to.have.deep.property('resolve.alias')
      .that.eql({
        parent: 'test/fixtures/parent'
      });
  });
});

describe('getWatchPaths()', () => {
  it('produces a set of file paths', () => {
    expect(getWatchPaths(['base', 'child'])).to.eql({
      assets: [
        'base/*.*',
        'base/assets/**/*',
        'child/*.*',
        'child/assets/**/*'
      ],
      sass: [
        'base/scss/**/*.scss',
        'child/scss/**/*.scss'
      ],
      js: [
        'base/js/**/*.js',
        'child/js/**/*.js'
      ]
    });
  });
});

describe('getAssetStreams()', () => {
  it('returns a stream', () => {
    const stream = getAssetStreams(new Gulp(), [
      'test/fixtures/base',
      'test/fixtures/child'
    ]);

    expect(stream.pipe).to.be.a('function');
  });
});

describe('getEyeglassConfig()', () => {
  it('returns nothing for a basic theme', () => {
    const locations = [
      'test/fixtures/base'
    ];

    expect(getEyeglassConfig(locations)).to.be.undefined;
  });

  it('returns a config object for a theme with parents', () => {
    const locations = [
      'test/fixtures/base',
      'test/fixtures/parent'
    ];
    const config = getEyeglassConfig(locations);
    const parentModule = config.eyeglass.modules[0];

    expect(parentModule.name).to.equal('parent');
    expect(parentModule.main().sassDir).to.contain('test/fixtures/parent');
  });
});
