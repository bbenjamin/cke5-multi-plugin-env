'use strict';

const path = require( 'path' );
const fs = require( 'fs' );
const webpack = require('webpack');
const { styles, builds } = require( '@ckeditor/ckeditor5-dev-utils' );
const TerserPlugin = require('terser-webpack-plugin');

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath)
		.filter(item => fs.statSync(path.join(srcpath, item)).isDirectory());
}


if ( process.argv.includes( '--dll' ) ) {
	module.exports = [];
  // Loop through every subdirectory in src, which should be a different
	// plugin, and build them all in ./build.
	getDirectories('./src').forEach((dir) => {
		const bc = {
			mode: 'production',
			optimization: {
				minimize: true,
				minimizer: [
					new TerserPlugin({
						terserOptions: {
							format: {
								comments: false,
							},
						},
						test: /\.js(\?.*)?$/i,
						extractComments: false
					}),
				],
				moduleIds: 'named',
			},
			entry: {
				path: path.resolve(__dirname, 'src', dir, 'src/index.js')
			},
			output: {
				path: path.resolve(__dirname, './build'),
				filename: `${dir}.js`,
				// @todo find a way to get library name or refactor plugins to simplify.
				//   currently some plugins add values like the camel cased
				//   'drupalImage', but that value isn't available in config.
				library: ['CKEditor5', dir],
				libraryTarget: 'umd',
				libraryExport: 'default'
			},
			plugins: [
				new webpack.DllReferencePlugin({
					manifest: require('./node_modules/dllCkeditor5/build/ckeditor5-dll.manifest.json'),
					scope: 'ckeditor5/src',
					name: 'CKEditor5.dll',
				})
			],
			module: {
				rules: [
					{ test: /\.svg$/, use: 'raw-loader' }
				],
			}
		};

		module.exports.push(bc);
	});
} else {
	// AFTER 'else' NOTHING HAS BEEN CHANGED FROM ckeditor5-plugin-env YET.
	// TODO
	// The below can also be replaced with something like `builds.getPluginDevWebpackConfig()` call.

	module.exports = {
		// https://webpack.js.org/configuration/entry-context/
		entry: './sample/sample-dev.js',

		// https://webpack.js.org/configuration/output/
		output: {
			path: path.resolve( __dirname, 'build' ),
			filename: 'sample.js'
		},

		module: {
			rules: [
				{
					test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,

					use: [ 'raw-loader' ]
				},
				{
					test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,

					use: [
						{
							loader: 'style-loader',
							options: {
								injectType: 'singletonStyleTag',
								attributes: {
									'data-cke': true
								}
							}
						},
						{
							loader: 'postcss-loader',
							options: styles.getPostCssConfig( {
								themeImporter: {
									themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
								},
								minify: true
							} )
						}
					]
				}
			]
		},

		// Useful for debugging.
		devtool: 'source-map',

		// By default webpack logs warnings if the bundle is bigger than 200kb.
		performance: { hints: false }
	};
}