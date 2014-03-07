var csst = require('csst');

module.exports = function() {
	var node = document.querySelector('.test');
	var update = csst.lift(csst.toggle('myclass'));

	document.querySelector('[name=toggle]').addEventListener('change', toggleState, false);

	function toggleState(e) {
		update(e.target.checked, node);
	}
};