// ---------------------- \\
// Array.indexOf polyfill \\
// ---------------------- \\

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
        var i, m;
        pivot = fromIndex ? fromIndex : 0, length;
        if (!this) {
            throw new TypeError
        }
        length = this.length;
        if (length === 0 || pivot >= length) {
            return -1
        }
        if (pivot < 0) {
            pivot = length - Math.abs(pivot)
        }
        for (i = pivot; i < length; i++) {
            if (this[i] === searchElement) {
                return i
            }
        }
        return -1
    }
}


// ------------------------------ \\
// requestAnimationFrame polyfill \\
// ------------------------------ \\

(function() {
    var lastTime = 0;
    var vendors = ["webkit", "moz"];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"]
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
        var currTime = (new Date).getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() {
            callback(currTime +
                timeToCall)
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
        clearTimeout(id)
    }
})();

// -------------------- \\
// Object.keys Polyfill \\
// -------------------- \\

Object.keys = Object.keys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj)
        if (Object.prototype.hasOwnProperty.call(obj, key)(obj, key)) keys.push(key);
    return keys;
};

//math average (not polyfill)
Math.avg = Math.avg || function()
{
    var sum = 0;
    for(var i in arguments) sum += arguments[i];
    return sum/arguments.length;
}