//add balls
(function(){

    if(G.isMobile) return;

    var stage = new G.Stage({physics:true}).setCanvas("#canvas"),
        r = G.random;

    function addCircles(x,y,l)
    {
        for(var i = 0; i < 50; i++) new G.Circle(x||r(stage.width), y||r(stage.height), 2, r.color(), r.choice([r(-2, -5), r(5,2)]), r.choice([r(-2, -5), r(5,2)]));
    }

    new G.Bounds(1,0,20);

    stage.world.config({ collisions:{ dynamicdynamic:false } });

    addCircles();
    stage.event.on('up', window, function(e){ addCircles(e.clientX, e.clientY) })

    stage.animate(function()
    {
        stage.update();
        stage.render();
    })

})();

//get latest release
(function()
{
    if(!document.querySelector(".download")) return;
    
    window.emit = new Emit;

    window.getJSONP = function(e,t){if(typeof e==="undefined")return;if(typeof t==="function")window.getJSONP.prototype.callback=t;if(typeof e==="string"){var i=document.createElement("script");i.getJSONPid="getJSONP";var n="&";if(e.indexOf("?")===-1)n="?";i.src=e+n+"callback=getJSONP";document.body.appendChild(i)}else{var o=document.getElementsByTagName("script");for(var d in o){var i=o[d];if(typeof i.getJSONPid!=="undefined"&&i.getJSONPid==="getJSONP")document.body.removeChild(i)}if(typeof window.getJSONP.prototype.callback!=="undefined")window.getJSONP.prototype.callback(e);}}

    //get releases
    getJSONP('https://api.github.com/repos/GurudayalKhalsa/G/tags', function(data)
    {
        var tags = data.data;
        var latest = tags[tags.length-1];
        var name = latest.name;
        var url = 'https://github.com/GurudayalKhalsa/G/releases/download/' + name + '/';
        latest.production_url = url + 'G.min.js';
        latest.development_url = url + 'G.js';

        emit.trigger("load:releases", [latest, tags]);
    });

    //insert into html
    emit.on("load:releases", function(latest, tags)
    {
        document.querySelector(".download").innerHTML = '' +
        '<h4>Download:</h4>' +
        '<p>Latest version: ' + latest.name + '</p>' +
        '<a class="button button-blue" href="' + latest.production_url + '">Production Build</a>\n' +
        '<a class="button button-blue" href="' + latest.development_url + '">Development Build</a>\n' +
        '<a class="button button-blue" href="' + latest.zipball_url + '">Full Source</a>';
    });

})();

