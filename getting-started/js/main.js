//add balls
(function(){

    if(G.isMobile) return;

    G.physics = true;
    G.setCanvas("#canvas");

    if(!G.canvas) return;

    var stage = G.stage, canvas = G.canvas, ctx = G.ctx;

    function addCircles(x,y,l)
    {
        for(var i = 0; i < 50; i++) new G.Circle(x||G.random(G.stage.width), y||G.random(G.stage.height), 2, G.random.color(), G.random.choice([G.random(-2, -5), G.random(5,2)]), G.random.choice([G.random(-2, -5), G.random(5,2)]));
    }

    new G.Bounds(20, 0, 1);

    stage.world.config({ collisions:{ dynamicdynamic:false } });

    addCircles();
    stage.event.on('up', window, function(e){ addCircles(e.clientX, e.clientY) })

    stage.animate(function()
    {
        stage.update();
        stage.render();
    })

})();