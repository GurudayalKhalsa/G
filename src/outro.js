//
// Nodejs and AMD support: export the implemenation as a module using
// either convention.
//

if (typeof module === "object" && module.exports)
{
  module.exports = G;
}
else if (typeof define === "function" && define.amd)
{
  define(function()
  {
    return G;
  });
}
else this.G = G;

})();