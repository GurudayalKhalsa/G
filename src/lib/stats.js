// ---------------------- \\
// Stats.js FPS Benchmark \\
// ---------------------- \\

/* 
  http://github.com/mrdoob/stats.js

  API:

initialize: 

    var stats=new Stats();
    document.body.appendChild(stats.domElement);
    stats.domElement.style.cssText="padding:3px;z-index:100;position:absolute;left:0;top:0;cursor:pointer;background-color:#fff;font: 12px 'Helvetica Neue', Helvetica, Arial, sans-serif;";

Every Frame:

    stats.update();

*/
var Stats = function()
{
    var a = Date.now(),
        b = a,
        c = 0,
        d = 1 / 0,
        e = 0,
        f = 0,
        g = 1 / 0,
        h = 0,
        i = 0,
        j = 0,
        k = document.createElement("div");
    k.id = "stats", k.addEventListener("mousedown", function(a)
    {
        a.preventDefault(), p(++j % 2)
    }, !1), k.style.cssText = "width:80px;opacity:0.9;cursor:pointer";
    var l = document.createElement("div");
    l.id = "fps", k.appendChild(l);
    var m = document.createElement("div");
    m.id = "fpsText", m.innerHTML = "FPS", l.appendChild(m);
    var n = document.createElement("div");
    n.id = "ms", n.style.cssText = "display:none", k.appendChild(n);
    var o = document.createElement("div");
    o.id = "msText", o.innerHTML = "MS", n.appendChild(o);
    var p = function(a)
    {
        switch (j = a)
        {
            case 0:
                l.style.display = "block", n.style.display = "none";
                break;
            case 1:
                l.style.display = "none", n.style.display = "block"
        }
    };
    return {
        REVISION: 11,
        domElement: k,
        setMode: p,
        begin: function()
        {
            a = Date.now()
        },
        end: function()
        {
            var j = Date.now();
            return c = j - a, d = Math.min(d, c), e = Math.max(e, c), o.textContent = c + " MS (" + d + "-" + e + ")", i++, j > b + 1e3 && (f = Math.round(1e3 * i / (j - b)), g = Math.min(g, f), h = Math.max(h, f), m.textContent = f + " FPS (" + g + "-" + h + ")", b = j, i = 0), j
        },
        update: function()
        {
            a = this.end()
        }
    }
};