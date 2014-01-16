var stage = new G.Stage({ physics:{gravity:{x:0,y:0.2}}, showFramerate:true }).setCanvas();

var key = stage.event.key;

//add bounds
var bounds = new G.Bounds(0,0,stage.width,stage.height);

//setup coins
var coins = new G.Collection,
    coinSize = 20,
    gap = 100;

for(var i = 1; i < 10; i++)
{
    var ranx = G.random(stage.width-gap, gap);
    var left = new G.Rect
    ({
        pos:{ x: (ranx-gap/2)/2, y: (stage.height/10)*i }, 
        width: ranx-gap/2, 
        height: 20, 
        color: G.random.color(),
        type: "static"
    });

    var right = new G.Rect
    ({
        pos:{ x: stage.width-((stage.width-(ranx+gap/2))/2), y: (stage.height/10)*i }, 
        width: stage.width-(ranx+gap/2), 
        height: 20, 
        color: G.random.color(),
        type: "static"
    });
}

//add player
var player = new G.Sprite
({
    src:"img/mario.png",
    pos:{ x:20, y:20 },
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

//when colliding with top of something
player.on("collision", function(shape, mtv)
{
    if(mtv.x !== 0 || mtv.y > 0) return;
    if(player.vel.x < 0) player.setAnimation("walkLeft");
    if(player.vel.x > 0) player.setAnimation("walkRight");
});

stage.animate(function()
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

    stage.update();
    stage.render();
})