! function(name, root, factory) {
    //expose module to either Node/CommonJS or AMD if available, and root object of choosing (e.g. Window)
    (typeof define === "function" && define.amd) ? define(function(){ return root.call(factory) }) : (typeof module === "object" && typeof module.exports === "object") ? module.exports = factory.call(root) : root[name] = factory.call(root)
}
("G", this, function() {