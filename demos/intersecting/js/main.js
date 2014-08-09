//make a canvas, append to html, set to window width and height
G.showFramerate = true;
G.setCanvas();
var canvas = G.canvas, ctx = G.ctx;

//set root mouse event listener to canvas, and start running mouse engine
var state = G.event.mouse.setRoot(canvas).run().state;

//prevent mouse and only allow touch events if on mobile, disable default browser touch events (includes annoying zooming when clicked)
if(G.isMobile) G.event.mouse.onlyTouch().run().on('touchstart,touchend,touchmove', function(e){ e.preventDefault(); });

//resize canvas on window resize
G.event.on("resize", window, function(e){ G.stage.setCanvas(window.innerWidth, window.innerHeight); })

//object to test collisions with
var colliders = new G.Collection
(
    new G.Rect(70,70,100,60),
    new G.Polygon(100,250,[-50,-50,25,50,-30,50]),
    new G.Polygon(300,350,[-50,-50,25,50,-30,50]),
    new G.Circle(100,400,40),
    new G.Line(50,500,150,600)
);

//objects to test
var shapes = new G.Collection
(
    new G.Rect(250,100,50,50,'blue'),
    new G.Circle(200,200,40,'blue')
);

G.event.mouse.on('down', function()
{
    shapes.each(function(shape)
    {
        if(shape.posInBounds(state.pos.x, state.pos.y))
        {
            G.event.mouse.on('move', move);
            G.event.mouse.on('up', function(){G.event.mouse.off('move', move)});
        }

        function move()
        {
            shape.vel.x = state.pos.x - state.pos.last.x;
            shape.vel.y = state.pos.y - state.pos.last.y;
        }
    });
});

G.animate(function()
{
    colliders.each(function(collider){ collider.color = "black"; });

    shapes.each(function(shape)
    {
        var colliding;

        colliders.each(function(collider)
        { 
            colliding = G.Physics.intersecting(collider, shape);
            if(colliding) return false;
        });

        if(!colliding)
        {
            shape.pos.x += shape.vel.x;
            shape.pos.y += shape.vel.y;
        } 
        else
        {
            if(shape.shape === "polygon" || shape.shape === "rect" || shape.shape === "circle") 
            {
                shape.pos.x += colliding.x;
                shape.pos.y += colliding.y;
            }            
        }

        shape.vel.x = 0;
        shape.vel.y = 0;
    });

    G.render();
});