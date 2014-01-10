var a = new G.Stage({physics:true}).setCanvas("#a");
var b = new G.Stage({physics:true}).setCanvas("#b");
var c = new G.Stage({physics:true}).setCanvas("#c");
var d = new G.Stage({physics:true}).setCanvas("#d");

_.each(G.stages, function(stage, i)
{
    stage.backgroundColor = G.random.color();
    stage.add(new G.Bounds(0,0,stage.width,stage.height, 0, 1));
    stage.add(new G.Circle(stage.width/2,stage.height/2,10,G.random.color(), G.random.choice(G.random.float(5,0.5),G.random.float(-0.5,-5)),  G.random.choice(G.random.float(5,2),G.random.float(-2,-5))));

    stage.world.config({ collisions:{ dynamicdynamic:false } })

    stage.event.mouse.on("up", function()
    {
        stage.add(new G.Circle(stage.event.mouse.state.pos.x,stage.event.mouse.state.pos.y,10,G.random.color(), G.random.choice(G.random.float(5,0.5),G.random.float(-0.5,-5)),  G.random.choice(G.random.float(5,2),G.random.float(-2,-5))));
    });

    stage.animate(function()
    {
        stage.update();
        stage.render();
    });
});
