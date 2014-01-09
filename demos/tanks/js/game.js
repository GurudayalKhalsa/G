G.showFramerate = true;
G.setCanvas();

var state = G.event.mouse.run().state;

G.stage.world.SetGravity(new b2Vec2(0,10));

var terrain = new Terrain(G.random.color());

var tank = new Tank(200,200);

G.animate(function()
{ 
    G.render(); 
    tank.update();
});