G.gravity = {
    x:0,
    y:10
};

G.showFramerate = true;
G.setCanvas();

G.event.key.on("keyup:escape", function(){G.togglePaused()})

//run mouse engine
var mouse = G.event.mouse;

//prevent contextmenu
mouse.on('contextmenu', function(e){ e.preventDefault() });

//top,left,bottom,right  wall boundaries
var bounds = new G.Bounds(0, 0, G.stage.width, G.stage.height, 0.5, 0.5);

//resize boundaries on window resize
G.event.on("resize", window, function()
{ 
    G.stage.setCanvas(window.innerWidth, window.innerHeight);
    bounds.resize(0, 0, G.stage.width, G.stage.height);
});

//spawn object (random either circle or box) on click, do not spawn when throwing
mouse.on("up", function()
{
    if((mouseJoint && (mouse.state.pos.last.down.x !== mouse.state.x)) || mouse.state.right) return;    
    var x = mouse.state.pos.x, y = mouse.state.pos.y, w = 50, h = 50, c = G.random.color();
    G.random() === 1 ? new G.Rect(x,y,w,h,c) : new G.Circle(x,y,w/2,c);
});

//remove object on right click
mouse.on("up", function()
{
    if(!mouse.state.right) return;
    var shape = G.stage.shapeContainingPoint(mouse.state.x, mouse.state.y);
    if(shape) shape.remove();
});

//start animation
G.animate(function()
{ 
    G.stage.render(); 
});


//Box2D-Specific
//throw object
var mouseJoint;

mouse.on("down", function (e) 
{
    if(mouse.state.right || mouseJoint) return;

    var shape = G.stage.shapeContainingPoint(mouse.state.pos.x, mouse.state.pos.y);
    if (shape) 
    {
        var body = shape.b2.body;
        var md = new b2MouseJointDef();
        md.bodyA = G.stage.world.GetGroundBody();
        md.bodyB = body;
        md.target.Set(mouse.state.x/PTM, mouse.state.y/PTM);
        md.collideConnected = true;
        md.maxForce = 3000.0 * body.GetMass();
        mouseJoint = G.stage.world.CreateJoint(md);
        body.SetAwake(true);

        mouse.on("move", move);

        function move()
        {
            mouseJoint.SetTarget(new b2Vec2(mouse.state.pos.x/PTM, mouse.state.pos.y/PTM));
        }

        mouse.one("up", function (e) 
        {
            mouse.off("move", move);
            if(mouse.state.right) return;
            if (mouseJoint) 
            {
                G.stage.world.DestroyJoint(mouseJoint);
                mouseJoint = null;
            }
        });
    }
});