G.physics = true;
G.gravity = new G.Vector(0,0.2);
G.showFramerate = true;
G.setCanvas();
G.stage.enableVisibleHash();

var key = G.event.key;

var mapWidth = 10000;
var mapHeight = 10000;

//add bounds
var bounds = new G.Bounds(0,-mapHeight+G.stage.height,mapWidth,G.stage.height);

//add blocks
var blocks = new G.Collection;

for(var i = 0; i < 5000; i++)
{
    var block = new G.Rect(G.random(mapWidth), G.random(-mapHeight+G.stage.height, G.stage.width), G.random(100,40), G.random(70,30), G.random.color());
    block.type = "static";
    blocks.add(block);
}

//add player
var player = new G.Sprite
({
    src:"img/mario.png",
    pos:{ x:200, y:200 },
    stepSize:{ x:30, y:50 },
    columns:4,
    rows:3,
    framecount:10,
    animations:
    {
        walkRight:{range:[0,3], speed:1/5},
        walkLeft:{range:[4,7], speed:1/5}
    }
});
player.restitution = 0;
player.speed = 5;

//configure camera
G.stage.config({ camera: { focus:player, bounds: { top:-mapHeight+G.stage.height, left:0, right:mapWidth, bottom:G.stage.height } } });

//when colliding with top of something
player.on("collision", function(shape, mtv)
{
    if(mtv.x !== 0 || mtv.y > 0) return;
    if(player.vel.x < 0) player.setAnimation("walkLeft");
    if(player.vel.x > 0) player.setAnimation("walkRight");
})

G.animate(function()
{
    if(player.vel.y !== 0 && player.animation) player.removeAnimation();

    if(key.isDown("left,a")) 
    {
        if(player.vel.y !== 0) player.setFrame(8);
        player.vel.x = -player.speed;
    }
    else if(key.isDown("right,d")) 
    {
        if(player.vel.y !== 0) player.setFrame(9);
        player.vel.x = player.speed;
    }
    else 
    {
        player.removeAnimation();
        if(player.vel.y === 0 && player.currentFrame === 9) player.setFrame(0);
        if(player.vel.y === 0 && player.currentFrame === 8) player.setFrame(4);
        player.vel.x = 0;
    }
    if(key.isUp("space") && player.colliding === true) 
    {
        player.removeAnimation();
        var frame = player.currentFrame === 0 ? 9 : 8;
        player.setFrame(frame);
        player.vel.y = -10;
    }

    G.update();
    G.render();
})