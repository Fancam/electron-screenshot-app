'use strict';
/* globals it, describe */
// Run in Electron
const assert = require('assert');
const screenshot = require('./index');
const isPng = require('is-png');
const pngparse = require('pngparse');

describe('Screenshot', () => {
	it('should take a screenshot', done => {
		screenshot({
			url: 'about:blank',
			width: 500,
			height: 500
		},
		(err, image) => {
			assert.equal(err, undefined);
			assert(isPng(image.data));
			assert.equal(image.size.width, 500 * image.size.devicePixelRatio);
			assert.equal(image.size.height, 500 * image.size.devicePixelRatio);
			done();
		});
	});
	it('should have a `delay` option', done => {
		const past = new Date();
		screenshot({
			url: 'about:blank',
			delay: 500,
			width: 500,
			height: 500
		},
		err => {
			assert.equal(err, undefined);
			assert((new Date()) - past > 500);
			done();
		});
	});

	it('should have a `page` and `css` option', done => {
		screenshot({
			url: 'about:blank',
			page: true,
			width: 500,
			height: 500,
			css: 'html,body{width: 600px; height:600px !important;}'
		},
		(err, image, cleanup) => {
			assert.equal(err, undefined);
			assert.equal(image.size.width, 600 * image.size.devicePixelRatio);
			assert.equal(image.size.height, 600 * image.size.devicePixelRatio);
			cleanup();
			done();
		});
	});

	it('should have a `crop`', done => {
		screenshot({
			url: 'about:blank',
			page: true,
			width: 500,
			height: 500,
			crop: {
				x: 10,
				y: 10,
				width: 200,
				height: 200
			}
		},
		(err, image, cleanup) => {
			assert.equal(err, undefined);
			assert.equal(image.size.width, 200 * image.size.devicePixelRatio);
			assert.equal(image.size.height, 200 * image.size.devicePixelRatio);
			cleanup();
			done();
		});
	});

	it('should inject custom css', done => {
		screenshot({
			url: 'about:blank',
			width: 600,
			height: 500,
			transparent: true,
			css: 'html,body{background:rgba(255,0,0,0.5)}'
		},
		(err, image, cleanup) => {
			assert.equal(err, undefined);
			pngparse.parse(image.data, (err, pixels) => {
				assert.equal(err, undefined);
				// Should be transparent
				assert.equal(pixels.channels, 4);
				assert.equal(pixels.width, 600 * image.size.devicePixelRatio);
				assert.equal(pixels.height, 500 * image.size.devicePixelRatio);

				// Should be red + half transparent
				assert.equal(pixels.data[0], 255);
				assert.equal(pixels.data[1], 0);
				assert.equal(pixels.data[2], 0);
				assert.equal(pixels.data[3], 127);

				cleanup();
				done();
			});
		});
	});

	it('should throw an error', done => {
		screenshot({
			url: 'http://thiswillnotbeadomain.nonono/'
		},
		err => {
			assert.equal(err.toString(), 'Error: [-105] ');
			done();
		});
	});
});
