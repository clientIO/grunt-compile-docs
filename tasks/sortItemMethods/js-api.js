'use strict';

var getFileName = require('../lib/getFileName');
var getFileBaseName = require('../lib/getFileBaseName');

module.exports = function(item1, item2) {

	var file1 = item1.file;
	var file2 = item2.file;
	var docDir1 = getDocDir(file1);
	var docDir2 = getDocDir(file2);

	// Sort by directory name (alphabetic).
	if (docDir1 !== docDir2) return docDir1 > docDir2 ? 1 : (docDir1 < docDir2 ? -1 : 0);

	var depth1 = file1.split('/').length;
	var depth2 = file2.split('/').length;

	// Sort by depth.
	if (depth1 !== depth2) return depth1 > depth2 ? 1 : (depth1 < depth2 ? -1 : 0);

	var importance1 = getDocFileImportance(file1);
	var importance2 = getDocFileImportance(file2);

	// Sort by importance.
	if (importance1 !== importance2) return importance1 > importance2 ? 1 : (importance1 < importance2 ? -1 : 0);

	var filename1 = getFileName(file1).toLowerCase();
	var filename2 = getFileName(file2).toLowerCase();

	// Sort by filename (alphabetic).
	return filename1 > filename2 ? 1 : (filename1 < filename2 ? -1 : 0);
};

function getDocDir(file) {

	var docDir;

	while (!docDir || docDir === 'prototype') {
		docDir = file.substr(0, file.lastIndexOf('/') + 1).toLowerCase();
	}

	return docDir;
}

// Lower numbers are more important.
function getDocFileImportance(file) {

	var basename = getFileBaseName(file);

	if (basename === 'index') return 0;
	if (basename === 'constructor') return 1;

	return isPrototypeDocFile(file) ? 2 : 3;
}

function isPrototypeDocFile(file) {

	var parts = file.split('/');
	return parts[parts.length - 2] === 'prototype';
}
