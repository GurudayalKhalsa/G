G.physics = true;
G.setCanvas();

G.stage.backgroundColor = "black";

G.event.key.on("keyup:escape", function(){G.togglePaused()})

var sound = new G.Sound("assets/explosion", ["wav", "mp3"]);

var Asteroid = G.Polygon.extend
({
    initialize:function(x,y,size)
    {
        this.minSize = 35;
        var x = x || G.random(G.stage.width),
            y = y || G.random(G.stage.height),
            vx = G.random.choice(G.random.float(1.5,0.5), G.random.float(-0.5,-1.5)),
            vy = G.random.choice(G.random.float(1.5,0.5), G.random.float(-0.5,-1.5)),
            size = this.size = size || 50,
            vertices = [-1 * size, 0 * size, -0.5 * size, 0.6 * size, -0.2 * size, 0.8 * size, 0.2 * size, 0.8 * size, 0.7 * size, 0.4 * size, 1 * size, -0.3 * size, 0.8 * size, -0.6 * size , 0.5 * size, -0.8 * size, 0.2 * size, -1 * size, -0.4 * size, -0.8 * size, -0.8 * size, -0.5 * size];

        //create asteroid
        this._super(x,y,vertices,"white",vx,vy);
        this.fill = false;
        this.lineWidth = 2;
        this.rotationInc = G.random.float(0.01, -0.01);

        //do not detect collisions with other asteroids
        this.on("collisionCheck", function(shape){ if(shape instanceof Asteroid) return false; });

        //on collision, break into 2 smaller if not below min size
        this.on("collision", function(shape)
        {
            if(shape instanceof G.Circle || shape === player)
            {
                sound.play();
                shape.remove();
                this.remove();
                if(this.size >= this.minSize)
                {
                    new Asteroid(this.pos.x-this.size/1.3, this.pos.y, this.size/1.3);
                    new Asteroid(this.pos.x+this.size/1.3, this.pos.y, this.size/1.3);
                }
            }
        });

        this.on("update", function()
        {
            this.rotation += this.rotationInc;
        });
    }
});

G.stage.on("add", function(shape)
{
    shape.on("collision", function(){return false})
    shape.on("update", function()
    {
        var bounds = this.bounds();
        if(bounds.left > G.stage.width && this.vel.x > 0) this.bounds({right:0});
        if(bounds.right < 0 && this.vel.x < 0) this.bounds({left:G.stage.width});
        if(bounds.top > G.stage.height && this.vel.y > 0) this.bounds({bottom:0});
        if(bounds.bottom < 0 && this.vel.y < 0) this.bounds({top:G.stage.height});
    });
});

var player = new G.Polygon(G.stage.width/2,G.stage.height/2,[-10,-15,0,15,10,-15],"white");
var playerSpeed = 3;
var ballSpeed = 5;

function gameover(win)
{
    G.clearCanvas();
    new G.Text((win === true ? "You Win!" : "Game Over!"),G.stage.width/2,G.stage.height/2,"25px","Helvetica Neue","normal","white","center").render();
    G.pause();
}

//gameover
player.on("collision", function(shape){ if(shape instanceof Asteroid) gameover(false); });

//fire ball
G.event.key.on("keyup:space", function()
{
    G.stage.query({shape:"circle"}).remove(true);
    var x = -Math.sin(player.rotation)*ballSpeed;
    var y = Math.cos(player.rotation)*ballSpeed;
    new G.Circle(player.pos.x, player.pos.y, 2, "white", x, y);
});

for(var i = 0; i < 5; i++) new Asteroid();

G.animate(function()
{
    //move player
    if(G.event.key.isDown("left")) player.rotation -= 0.05;
    if(G.event.key.isDown("right")) player.rotation += 0.05;
    if(G.event.key.isDown("up")) player.vel = new G.Vector(-Math.sin(player.rotation)*playerSpeed, Math.cos(player.rotation)*playerSpeed);
    else if(G.event.key.isDown("down")) player.vel = new G.Vector(Math.sin(player.rotation)*playerSpeed, -Math.cos(player.rotation)*playerSpeed);
    else player.vel = new G.Vector();

    G.update().render();    

    if(!G.stage.query(function(shape){if(shape instanceof Asteroid) return true;}).length()) gameover(true);
});