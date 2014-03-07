var curry = require('./lib/curry');
var classes = require('./lib/classes');
var addClass = classes.add;
var removeClass = classes.remove;

module.exports = {
	map: map,
	toggle: toggle,
	range: range,
	cardinality: cardinality,
	mapf: mapf,
	compose: compose,
	lift: curry(lift),
	flip: flip
};

/**
 * Add and remove classes using a hash of value to class
 * @param {object} hash
 * @returns {function}
 */
function map(hash) {
	var all = Object.keys(hash).join(' ');
	hash = pivotHash(hash);

	return mapf(function(value) {
		return [hash[value], all];
	});
}

/**
 * Toggle a class on or off based on a truthy value
 * @param {string} name class to add or remove
 * @returns {function}
 */
function toggle(name) {
	return mapf(function(value) {
		return value ? [name, ''] : ['', name];
	});
}

/**
 * Add and remove classes based on a count
 * @param {string} prefix
 * @returns {function}
 */
function cardinality(prefix) {
	var none, one, many, all;

	none = prefix + '-zero';
	one = prefix + '-one';
	many = prefix + '-many';
	all = none + ' ' + one + ' ' + many;

	return mapf(function(value) {
		return [(value < 1 ? none : value > 1 ? many : one), all];
	});
}

/**
 * Add and remove classes based on a value that falls into a range
 * @param {object} ranges
 * @returns {function}
 */
function range(ranges) {
	var keys, all;

	keys = Object.keys(ranges);
	all = keys.join(' ');

	return mapf(function(value) {
		var index;

		keys.some(function(name, i) {
			if(ranges[name] > value) {
				return true;
			} else {
				index = i;
				return false;
			}
		});

		return typeof index !== 'undefined' ? [keys[index], all] : [];
	});
}

/**
 * Add and remove classes based on the result of a function
 * @param {function(*):[string, string]} f takes a value and returns
 *   a pair [classes to add, classes to remove]
 * @returns {function}
 */
function mapf(f) {
	return curry(function(value, s) {
		var pair = f(value);
		return [value, addClass(pair[0], removeClass(pair[1], s))];
	});
}

function compose() {
	var funcs = Array.prototype.slice.call(arguments);
	return curry(function (x, initial) {
		return funcs.reduce(function (state, f) {
			return f(state[0], state[1]);
		}, [x, initial]);
	});
}

function lift(transform, value, node) {
	var result = transform(value, node.className);
	node.className = result[1];
	return [result[0], node];
}

function flip(f) {
	return curry(function(a, b) {
		return f(b, a);
	});
}

function pivotHash(hash) {
	return Object.keys(hash).reduce(function(pivoted, k) {
		pivoted[hash[k]] = k;
		return pivoted;
	}, {});
}
