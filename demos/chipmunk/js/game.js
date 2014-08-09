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
var bounds = new G.Bounds(0, 0, G.stage.width, G.stage.height, 0.8, 0.5);

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

//Chipmunk-specific
//throw object
var mouseBody = new cp.Body(Infinity, Infinity);
var mouseJoint;

G.on("animate", function()
{
    // Move mouse body toward the mouse while being thrown
    var newPoint = cp.v.lerp(mouseBody.p, cp.v(mouse.state.pos.x, mouse.state.pos.y), 0.25);
    mouseBody.v = cp.v.mult(cp.v.sub(newPoint, mouseBody.p), 60);
    mouseBody.p = newPoint;
});

mouse.on("down", function (e) 
{
    if(mouse.state.right || mouseJoint) return;

    var shape = G.stage.space.pointQueryFirst(cp.v(mouse.state.pos.x, mouse.state.pos.y), 1 << 31, cp.NO_GROUP);
    if (shape) 
    {
        mouseJoint = new cp.PivotJoint(mouseBody, shape.body, cp.v(0, 0), shape.body.world2Local(cp.v(mouse.state.pos.x, mouse.state.pos.y)));
        mouseJoint.maxForce = 500;
        G.stage.space.addConstraint(mouseJoint);

        mouse.one("up", function (e) 
        {
            if(mouse.state.right) return;
            if (mouseJoint) 
            {
                G.stage.space.removeConstraint(mouseJoint);
                mouseJoint = null;
            }
        });
    }
});