exports.add = addClass;
exports.remove = removeClass;

var classRx = '(\\s+|^)(classNames)(\\b(?![\\-_])|$)';
var trimLeadingRx = /^\s+/;
var splitClassNamesRx = /(\b\s+\b)|(\s+)/g;

/**
 * Add the classesToAdd to classNameStr
 * @param {String} classesToAdd space-separated list of classes to add,
 *  e.g. 'class1 class2'
 * @param {String} classNameStr existing className string to which to
 *  add classesToAdd
 * @returns {String} new className string with classes added
 */
function addClass (classesToAdd, classNameStr) {
	if(!classesToAdd) {
		return classNameStr;
	}

	var newClass = removeClass(classesToAdd, classNameStr);

	if(newClass && classesToAdd) {
		newClass += ' ';
	}

	return newClass + classesToAdd;
}

/**
 * Remove the classesToRemove from classNameStr
 * @param {String} classesToRemove space-separated list of classes to remove,
 *  e.g. 'class1 class2'
 * @param {String} classNameStr existing className string from which to
 *  remove classesToRemove
 * @returns {String} new className string with classes removed
 */
function removeClass (classesToRemove, classNameStr) {
	if (!classesToRemove) {
		return classNameStr;
	}

	// convert space-delimited tokens with bar-delimited (regexp `or`)
	classesToRemove = classesToRemove.replace(splitClassNamesRx,
		function (m, inner, edge) {
			// only replace inner spaces with |
			return edge ? '' : '|';
		}
	);

	// create one-pass regexp
	var rx = new RegExp(classRx.replace('classNames', classesToRemove), 'g');

	// remove all tokens in one pass (wish we could trim leading
	// spaces in the same pass! at least the trim is not a full
	// scan of the string)
	return classNameStr.replace(rx, '').replace(trimLeadingRx, '');
}
