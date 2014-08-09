//make a canvas, append to html, set to window width and height
G.setCanvas();
var canvas = G.canvas, ctx = G.ctx;

//set root mouse event listener to canvas, and start running mouse engine
var state = G.event.mouse.setRoot(canvas).run().state;

//prevent mouse and only allow touch events if on mobile, disable default browser touch events (includes annoying zooming when clicked)
if(G.isMobile) 
{
    G.event.mouse.onlyTouch().run().on('touchstart,touchend,touchmove', function(e){ e.preventDefault(); })
}

//resize canvas on window resize
G.event.on("resize", window, function(e){ G.stage.setCanvas(window.innerWidth, window.innerHeight); })

//html container to display the amount of shapes
var $numObjects = document.querySelector("#numObjects span");

var rects = [];

//adds rectangles to array
function addRects()
{
    var x = state.pos.x;
    var y = state.pos.y;
    var r = 20;

    for(var i = 0; i < 25; i++)
    {
        var vx = G.random.float(5, -5);
        var vy = G.random.float(5, -5);
        var w = G.random.float(40, 10);
        var h = G.random.float(40, 10);

        //add rectangles
        rects.push({
            x:x,
            y:y,
            w:w,
            h:h,
            vx:vx,
            vy:vy,
            color:G.random.color() 
        });
    }
}

function animate()
{
    ctx.clearRect(0,0,G.stage.width,G.stage.height);

    //add shapes if G.event.mouse is pressed down and not right click
    if(state.down && !state.right) addRects();

    //display amount of shapes in top left
    $numObjects.innerHTML = rects.length + " objects";

    //get framerate change since last frame (so a huge frame drop keeps the same speed for the shape)
    var delta = G.getdeltaFramerate();

    //render and detect collisions in canvas bounds for all rects
    for(var i = 0; i < rects.length; i++)
    {
        var shape = rects[i];

        var bounds = {
            left:shape.x,
            right:shape.x+shape.w,
            bottom:shape.y+shape.h,
            top:shape.y
        };

        //left and right wall collisions
        if(bounds.right > G.stage.width || bounds.left < 0) 
        {
            shape.vx *= -1;
            if(bounds.right > G.stage.width) shape.x = G.stage.width-shape.w;
            else if(bounds.left < 0) shape.x = 0;
        }
        
        //top and bottom wall collisions
        else if(bounds.bottom > G.stage.height || bounds.top < 0)
        {
            shape.vy *= -1;
            if(bounds.bottom > G.stage.height) shape.y = G.stage.height-shape.h;
            else if(bounds.top < 0) shape.y = 0;
        }

        //move shape by shape's velocity, according to framerate (constant speed, framerate-independent)
        shape.x += shape.vx*delta;
        shape.y += shape.vy*delta;

        ctx.fillStyle = shape.color;
        ctx.fillRect(shape.x,shape.y,shape.w,shape.h);
    }

    //show framerate
    G.stats.update();

    //continue animating
    requestAnimationFrame(animate);
}

//initialize by adding shapes
addRects();

//create stats
G.stats.create();

//start animating
requestAnimationFrame(animate);