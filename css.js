var classes = require('./lib/classes');
var curry = require('./lib/curry');

exports.map = map;
exports.mapWith = mapWith;
exports.hash = hash;
exports.toggle = toggle;
exports.range = range;
exports.cardinality = cardinality;

exports.compose = compose;

exports.run = curry(run);
exports.withValue = curry(withValue);
exports.withNode = curry(withNode);

var addClass = classes.add;
var removeClass = classes.remove;

var defaultCardinalitySuffixes = ['-0', '-1', '-n'];

/**
 * Add and remove classes using the provided function to compute a new class
 * @param {function(*):String} f function to compute a class to add
 * @returns {function(x:*, node:HTMLElement):[*, HTMLElement]} css state transform
 */
function map(f) {
	var range = '';
	return function(value, className) {
		var cls = f(value);
		range = addClass(cls, range);
		return [value, addClass(cls, removeClass(range, className))];
	};
}

/**
 * Add and remove classes using the provided hash of classes to values
 * @param {object} hash hash of classes to values
 * @returns {function(x:*, node:HTMLElement):[*, HTMLElement]} css state transform
 */
function hash(hash) {
	var keys = Object.keys(hash);
	var all = keys.join(' ');
	var mapped = pivotHash(hash, keys);

	return function(value, className) {
		return [value, addClass(mapped[value], removeClass(all, className))];
	};
}

/**
 * Toggle a class on or off based on a truthy value
 * @param {string} name class to add or remove
 * @returns {function(x:*, node:HTMLElement):[*, HTMLElement]} css state transform
 */
function toggle(name) {
	return function(value, className) {
		var updated = value ? addClass(name, className): removeClass(name, className);
		return [value, updated];
	}
}

/**
 * Add and remove classes based on a count
 * @param {string} prefix
 * @param {?Array} suffixes optional suffixes
 * @returns {function(x:*, node:HTMLElement):[*, HTMLElement]} css state transform
 */
function cardinality(prefix, suffixes) {
	if(arguments.length < 2) {
		suffixes = defaultCardinalitySuffixes;
	}

	var classes = new Array(suffixes.length);
	for(var i=0; i<classes.length; ++i) {
		classes[i] = prefix + suffixes[i];
	}

	var all = classes.join(' ');

	return function(value, className) {
		var x = Math.min(classes.length-1, Math.max(0, value));
		return [value, addClass(classes[x], removeClass(all, className))];
	};
}

/**
 * Add and remove classes based on a value that falls into a range
 * @param {object} ranges
 * @returns {function(x:*, node:HTMLElement):[*, HTMLElement]} css state transform
 */
function range(ranges) {
	var keys = Object.keys(ranges);
	var all = keys.join(' ');

	return function(value, className) {
		for(var i=keys.length-1; i>=0; --i) {
			if(ranges[keys[i]] <= value) {
				return [value, addClass(keys[i], removeClass(all, className))];
			}
		}

		return [value, className];
	};
}

/**
 * Add and remove classes based on the result of a function
 * @param {function(*):[string, string]} f takes a value and returns
 *   a pair [classes to add, classes to remove]
 * @returns {function(x:*, node:HTMLElement):[*, HTMLElement]} css state transform
 */
function mapWith(f) {
	return function(value, s) {
		var pair = f(value);
		return [value, addClass(pair[0], removeClass(pair[1], s))];
	};
}

function compose() {
	var fs = Array.prototype.slice.call(arguments);
	return function (x, initial) {
		return fs.reduceRight(function (state, f) {
			return f(state[0], state[1]);
		}, [x, initial]);
	};
}

function withValue(transform, value, node) {
	return run(transform, value, node)[1];
}

function withNode(transform, node, value) {
	return run(transform, value, node)[0];
}

function run(transform, value, node) {
	var result = transform(value, node.className);
	node.className = result[1];
	return [result[0], node];
}

function pivotHash(hash, keys) {
	return keys.reduce(function(pivoted, k) {
		pivoted[hash[k]] = k;
		return pivoted;
	}, {});
}
