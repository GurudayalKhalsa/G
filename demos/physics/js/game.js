G.gravity = {
    x: 0,
    y: 10
}

G.showFramerate = true;

G.setCanvas();

G.event.key.on("keyup:escape", function(){G.togglePaused()})


//prevent right click menu from popping up
G.event.mouse.on('contextmenu', function(e){ e.preventDefault(); })

var state = G.event.mouse.state;

var balls = new G.Collection();

function addBall(x, y)
{
    balls.add(new G.Circle(
    {
        pos:
        {
            x: x,
            y: y
        },
        radius: 20,
        friction: 0.5,
        restitution: 0.6,
        mass: 10,
        type: "dynamic",
        color: G.random.color()
    }));
}

var rects = new G.Collection();

function addRect(x, y)
{
    rects.add(new G.Rect(
    {
        pos:
        {
            x: x,
            y: y
        },
        width: 40,
        height: 40,
        friction: 0.5,
        restitution: 0.8,
        mass: 15,
        type: "dynamic",
        color: G.random.color()
    }));
}

var bounds = new G.Bounds(0,0,G.stage.width,G.stage.height,0.8,0.5);

//resize boundaries on window resize
G.event.on("resize", window, function()
{ 
    G.stage.setCanvas(window.innerWidth, window.innerHeight);
    bounds.resize(0, 0, G.stage.width, G.stage.height);
});

var mouseBody = new cp.Body(Infinity, Infinity);
var mouseJoint;

G.event.mouse.on("down", function (e) 
{

    if(state.right || mouseJoint) return;

    var shape = G.stage.space.pointQueryFirst(cp.v(state.pos.x, state.pos.y), 1 << 31, cp.NO_GROUP);
    if (shape) 
    {
        var body = shape.body;
        mouseJoint = new cp.PivotJoint(mouseBody, body, cp.v(0, 0), body.world2Local(cp.v(state.pos.x, state.pos.y)));

        mouseJoint.maxForce = 50000;
        mouseJoint.errorBias = Math.pow(1 - 0.15, 60);
        G.stage.space.addConstraint(mouseJoint);
    }
});
G.event.mouse.on("up", function (e) 
{
    
    if(state.right) return;

    if (mouseJoint) 
    {
        G.stage.space.removeConstraint(mouseJoint);
        mouseJoint = null;
    }
});

G.animate(function()
{
    G.render();

    // Move mouse body toward the mouse
    var newPoint = cp.v.lerp(mouseBody.p, cp.v(state.pos.x, state.pos.y), 0.25);
    mouseBody.v = cp.v.mult(cp.v.sub(newPoint, mouseBody.p), 60);
    mouseBody.p = newPoint;
});

G.on('renderShape', function(shape)
{
    //if clicking on shape, toggle activation
    if (shape.posInBounds(state.pos.x, state.pos.y)) shapeClicked = true;
})

function removeShape(x, y)
{
    for(var i = 0; i < G.stage.objects.length; i++)
    {
        var shape = G.stage.objects[i];
        if(!shape) continue;

        if(shape.posInBounds(x,y)) 
        {
            shape.remove();
            return true;
        }
    }
    return false;
}


var releaseLine = false;

G.event.mouse.on("down", drawStraightLine);
G.event.mouse.on("down", drawCurvedLine);

//toggle ball activation on click
G.event.mouse.on("up", leftclick);
G.event.mouse.on("up", rightclick);

function leftclick(e)
{
    if(state.right) return false;

    //if not moved mouse, draw circle
    if (state.pos.last.down.x === state.pos.x && state.pos.last.down.y === state.pos.y) addBall(state.pos.x, state.pos.y);
};

function rightclick(e)
{
    if(state.left) return false;

    if(state.pos.last.down.x === state.pos.x && state.pos.last.down.y === state.pos.y) 
    {
        var success = removeShape(state.pos.x, state.pos.y); 
        if(success !== true) addRect(state.pos.x, state.pos.y);
    }
}

function drawStraightLine(e1)
{
    if(state.left) return;

    var line;

    function moveListener(e2)
    {
        releaseLine = false;

        if (!line) line = new G.Line(
        {
            type: "static",
            pos:
            {
                x1: state.pos.last.down.x,
                y1: state.pos.last.down.y,
                x2: state.pos.last.down.x,
                y2: state.pos.last.down.y
            },
            friction: 0.5,
            restitution: 1,
            addToPhysics: false,
            color: G.random.color()
        });

        line.pos.x2 = state.pos.x;
        line.pos.y2 = state.pos.y;
    }

    G.event.mouse.on("move", moveListener);
    G.event.mouse.one("up", true, function(e)
    {
        if(line && line.setcpProperties)
        {
            line.addToPhysics = true;
            line.setcpProperties().add();
        }
        G.event.mouse.off("move", moveListener);
    });
}

function drawCurvedLine(e1)
{
    if (state.right) return;

    //if mouse is currently over a shape
    if(G.stage.space.pointQueryFirst(cp.v(state.pos.x, state.pos.y), 1 << 31, cp.NO_GROUP)) return;

    var oldPos = [state.pos.x, state.pos.y];

    releaseLine = false;

    var lines = [];
    var threshold = 30;

    function moveListener(e2)
    {

        var pos = [state.pos.x, state.pos.y];
        var displacement = [Math.abs(oldPos[0] - pos[0]), Math.abs(oldPos[1] - pos[1])];

        if (displacement[0] > threshold || displacement[1] > threshold)
        {
            lines.push(new G.Line(
            {
                type: "static",
                pos:
                {
                    x1: oldPos[0],
                    y1: oldPos[1],
                    x2: pos[0],
                    y2: pos[1]
                },
                friction: 0.5,
                restitution: 0.5,
                color: G.random.color()
            }));

            oldPos = pos.slice(0);
        }
    }

    G.event.mouse.on("move", moveListener);
    G.event.mouse.one("up", true, function(e)
    {
        G.event.mouse.off("move", moveListener);
    });
}