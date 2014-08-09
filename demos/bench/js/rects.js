//make a canvas, append to html, set to window width and height
G.showFramerate = true;
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

var collection = new G.Collection();

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
        collection.add(new G.Rect(x,y,w,h,G.random.color(),vx,vy));
    }
}

function animate()
{
    G.clearCanvas();

    //add shapes if mouse is pressed down and not right click
    if(state.down && !state.right) addRects();

    //display amount of shapes in top left
    $numObjects.innerHTML = G.stage.objects.length + " objects";

    //render and detect collisions in canvas bounds for all rects
    collection.each(function(shape)
    {
        var bounds = shape.bounds();

        //left and right wall collisions
        if(bounds.right > G.stage.width || bounds.left < 0) 
        {
            shape.vel.x *= -1;
            if(bounds.right > G.stage.width) shape.bounds({right:G.stage.width});
            else if(bounds.left < 0) shape.bounds({left:0});
        }
        
        //top and bottom wall collisions
        else if(bounds.bottom > G.stage.height || bounds.top < 0)
        {
            shape.vel.y *= -1;
            if(bounds.bottom > G.stage.height) shape.bounds({bottom:G.stage.height});
            else if(bounds.top < 0) shape.bounds({top:0});
        }

        // move shape by shape's velocity, according to framerate (constant speed, framerate-independent)
        shape.pos.x += shape.vel.x*G.deltaFramerate;
        shape.pos.y += shape.vel.y*G.deltaFramerate;

        shape.render();
    });
}

G.animate(animate);

//initialize by adding shapes
addRects();