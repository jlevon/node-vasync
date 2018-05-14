var mod_vasync = require('../lib/vasync');

var w = mod_vasync.race([
    function first(cb) {
        console.log('initiating first()');
        setTimeout(function () { cb(null, 'result1'); }, 10);
    }, function second(cb) {
        console.log('initiating second()');
        setTimeout(function () { cb(null, 'result2'); }, 10);
    }],

    /*
     * The timeout for first() will expire first, which means we'll get
     * 'result1' here; mycb will not be called again.
     */
    function mycb(err, result) {
        console.log('result: %s state: %j', result, w);
    }
);

console.log('w (start): %j', w);
