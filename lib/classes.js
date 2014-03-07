
var classRx, trimLeadingRx, splitClassNamesRx;

classRx = '(\\s+|^)(classNames)(\\b(?![\\-_])|$)';
trimLeadingRx = /^\s+/;
splitClassNamesRx = /(\b\s+\b)|(\s+)/g;

module.exports = {
	add: addClass,
	remove: removeClass
};

function addClass (className, str) {
	var newClass;

	if(!className) {
		return str;
	}

	newClass = removeClass(className, str);

	if(newClass && className) {
		newClass += ' ';
	}

	return newClass + className;
}

function removeClass (removes, tokens) {
	var rx;

	if (!removes) {
		return tokens;
	}

	// convert space-delimited tokens with bar-delimited (regexp `or`)
	removes = removes.replace(splitClassNamesRx,
		function (m, inner, edge) {
			// only replace inner spaces with |
			return edge ? '' : '|';
		}
	);

	// create one-pass regexp
	rx = new RegExp(classRx.replace('classNames', removes), 'g');

	// remove all tokens in one pass (wish we could trim leading
	// spaces in the same pass! at least the trim is not a full
	// scan of the string)
	return tokens.replace(rx, '').replace(trimLeadingRx, '');
}
