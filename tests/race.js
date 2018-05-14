/*
 * Tests the "waterfall" primitive.
 */

var mod_tap = require('tap');
var mod_vasync = require('..');

var count = 0;
var st;

mod_tap.test('badargs', function (test) {
	test.throws(function () { mod_vasync.race(); });
	test.throws(function () { mod_vasync.race({}); });
	test.throws(function () { mod_vasync.race([], 'foo'); });
	test.throws(function () { mod_vasync.race('foo', 'bar'); });
	test.end();
});

mod_tap.test('empty race, no callback', function (test) {
	st = mod_vasync.race([]);
	setTimeout(function () { test.end(); }, 100);
});

mod_tap.test('empty race', function (test) {
	st = mod_vasync.race([], function (err) {
		test.ok(err === null);
		test.ok(st.ndone === 0);
		test.ok(st.nerrors === 0);
		test.ok(st.operations.length === 0);
		test.ok(st.successes.length === 0);
		test.equal(count, 1);
		test.end();
	});
	count++;
	test.ok(st.ndone === 0);
	test.ok(st.nerrors === 0);
	test.ok(st.operations.length === 0);
	test.ok(st.successes.length === 0);
});

mod_tap.test('single func race', function (test) {
	count = 0;

	st = mod_vasync.race([
		function func1(cb) {
			count++;
			setTimeout(cb, 10, null, 1, 2);
		}
	], function callback(err, one, two) {
		test.ok(count == 1, 'callback: count == 1');
		test.ok(err === null, 'no error');
		test.ok(one === 1);
		test.ok(two === 2);
		test.ok(st.ndone === 1);
		test.ok(st.nerrors === 0);
		test.ok(st.operations.length === 1);
		test.ok(st.successes.length === 1);
		test.ok(st.operations[0].status == 'ok');
		setTimeout(function () { test.end(); }, 10);
	});
});

mod_tap.test('single func error', function (test) {
	count = 0;

	st = mod_vasync.race([
		function func1(cb) {
			count++;
			setTimeout(cb, 10, 'failed');
		}
	], function callback(err, res) {
		test.ok(count == 1, 'callback: count == 1');
		test.ok(err !== null, 'error seen');
		test.ok(res === undefined, 'undefined result');
		test.ok(st.ndone === 1);
		test.ok(st.nerrors === 1);
		test.ok(st.operations.length === 1);
		test.ok(st.successes.length === 0);
		test.ok(st.operations[0].status == 'fail');
		setTimeout(function () { test.end(); }, 10);
	});
});

mod_tap.test('race with error', function (test) {
	var called = 0;
	count = 0;

	st = mod_vasync.race([
		function func1(cb) {
			count++;
			setTimeout(cb, 10, 'failed');
		},
		function func2(cb) {
			count++;
			setTimeout(cb, 100, null, 1, 2);
		}
	], function callback(err, res) {
		test.ok(count == 2, 'callback: count == 2');
		test.ok(called === 0, 'callback: called == 0');
		test.ok(err !== null, 'error seen');
		test.ok(res === undefined, 'undefined result');
		test.ok(st.ndone === 1);
		test.ok(st.nerrors === 1);
		test.ok(st.operations.length === 2);
		test.ok(st.successes.length === 0);
		test.ok(st.operations[0].status == 'fail');
		test.ok(st.operations[1].status == 'pending');
		called++;
		setTimeout(function () { test.end(); }, 110);
	});
});

mod_tap.test('normal race', function (test) {
	var called = 0;
	count = 0;

	st = mod_vasync.race([
		function func1(cb) {
			count++;
			setTimeout(cb, 100, null, 1, 2);
		},
		function func2(cb) {
			count++;
			setTimeout(cb, 10, null, 3, 4);
		}
	], function callback(err, three, four) {
		test.ok(count == 2, 'callback: count == 2');
		test.ok(called === 0, 'callback: called == 0');
		test.ok(err === null, 'no error');
		test.ok(three === 3);
		test.ok(four === 4);
		test.ok(st.ndone === 1);
		test.ok(st.nerrors === 0);
		test.ok(st.operations.length === 2);
		test.ok(st.successes.length === 1);
		test.ok(st.operations[0].status == 'pending');
		test.ok(st.operations[1].status == 'ok');
		called++;
		setTimeout(function () { test.end(); }, 110);
	});
});

mod_tap.test('normal race, 3 funcs', function (test) {
	var called = 0;
	count = 0;

	st = mod_vasync.race([
		function func1(cb) {
			count++;
			setTimeout(cb, 10, null, 1, 2);
		},
		function func2(cb) {
			count++;
			setTimeout(cb, 100, null, 3, 4);
		},
		function func3(cb) {
			count++;
			setTimeout(cb, 101, null, 5);
		}
	], function callback(err, one, two) {
		test.ok(count == 3, 'callback: count == 3');
		test.ok(called === 0, 'callback: called == 0');
		test.ok(err === null, 'no error');
		test.ok(one === 1);
		test.ok(two === 2);
		test.ok(st.ndone === 1);
		test.ok(st.nerrors === 0);
		test.ok(st.operations.length === 3);
		test.ok(st.successes.length === 1);
		test.ok(st.operations[0].status == 'ok');
		test.ok(st.operations[1].status == 'pending');
		called++;
		setTimeout(function () { test.end(); }, 110);
	});
});
