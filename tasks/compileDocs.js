'use strict';

module.exports = function(grunt) {

	var async = require('async');
	var marked = require('marked');

	var getFileExtension = require('./lib/getFileExtension');
	var sortItemMethods = require('./sortItemMethods');

	grunt.registerMultiTask('compileDocs', 'Compile documentation.', function() {

		var done = this.async();
		var options = this.options();

		if (!options.template) {
			return done(new Error('Missing required option: "template"'));
		}

		var template = options.compileTemplate(grunt.file.read(options.template));

		if (options.markdown) {
			marked.setOptions(options.markdown);
		}

		var createdFiles = 0;

		async.each(this.files, function(file, next) {

			async.parallel({
				intro: getIntro.bind(undefined, file, options),
				items: getItems.bind(undefined, file, options)
			}, function(error, results) {

				if (error) return next(error);

				var data = file.meta || {};

				data.intro = results.intro;
				data.items = results.items;

				if (data.items.length > 0) {

					var processItems = file.processItems || options.processItems;
					var sortItems = file.sortItems || options.sortItems;

					if (processItems) {
						data.items = data.items.map(processItems);
					}

					if (sortItems) {

						if (typeof sortItems === 'string') {
							sortItems = sortItemMethods[sortItems] || null;
						}

						if (sortItems) {
							data.items.sort(sortItems);
						}
					}
				}

				grunt.file.write(file.dest, template(data));
				createdFiles++;
				grunt.log.writeln('File ' + file.dest['cyan'] + ' created.');
				next();
			});

		}, function(error) {

			if (error) return done(error);

			if (createdFiles > 0) {
				grunt.log.ok(createdFiles + ' ' + grunt.util.pluralize(createdFiles, 'file/files') + ' created.');
			} else {
				grunt.log.warn('No files created.');
			}

			done();
		});
	});

	function getIntro(file, options, cb) {

		if (!file.intro) return cb();

		var introFile = grunt.file.expand(file.intro).shift();

		if (!introFile) return cb();

		getFileContentsAsHtml(introFile, cb);
	}

	function getItems(file, options, cb) {

		var files = grunt.file.expand(file.src);

		async.map(files, function(file, next) {

			getFileContentsAsHtml(file, function(error, html) {

				if (error) return next(error);

				var item = {
					file: file,
					content: html
				};

				next(null, item);
			});

		}, cb);
	}

	function getFileContentsAsHtml(file, cb) {

		try {
			var contents = grunt.file.read(file);
		} catch (error) {
			return cb(error);
		}

		var extension = getFileExtension(file);

		if (extension !== 'md') return cb(null, contents);

		marked(contents, cb);
	}
};
