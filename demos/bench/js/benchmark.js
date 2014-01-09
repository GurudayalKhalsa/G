/**
 * A benchmark utility and G demo
 */

//show framerate in top left corner
G.showFramerate = true;

//make a canvas, append to html, set to window width and height (default)
G.setCanvas();

//get mouse state
var state = G.event.mouse.state;

//resize canvas on window resize
G.event.on("resize", window, function(e){ G.stage.setCanvas(window.innerWidth, window.innerHeight); })

//randomly select the initial type of shape to draw
var type = G.random.choice(["circle", "bee", "rect"]);

//make the html button of that type active
var active = $("#type #" + type).addClass("active");

//when a new button is clicked, change the render type for new clicks
$("#type .button").on('click', function()
{ 
    type = this.id; 
    if(!collections[type].length()) addShapes(type);
});

//html container to display the amount of shapes
var $numObjects = document.querySelector("#numObjects span");

//create new collections to store shapes in
var collections = {
    rect:new G.Collection(),
    bee:new G.Collection(),
    circle:new G.Collection()
};

//adds shapes of choice, can be rect, circle of bee
function addShapes(t)
{
    var x = state.pos.x;
    var y = state.pos.y;
    var r = 20;

    for(var i = 0; i < 10; i++)
    {
        var vx = G.random.float(5, -5);
        var vy = G.random.float(5, -5);
        var w = G.random.float(40, 10);
        var h = G.random.float(40, 10);

        //add circles
        if(t === "circle") collections[t].add(new G.Circle( x,y,r,G.random.color(),vx,vy ));
        //add bunnies
        if(t === "bee") collections[t].add(new G.Image( "img/"+G.random.choice(["1","2","3","4","5","6","7","8"])+".png",x,y,0,0,vx,vy ));
        //add rectangles
        if(t === "rect") collections[t].add(new G.Rect( x,y,w,h,G.random.color(),vx,vy ));
    }
}

//initialize by adding shapes
addShapes(type);

var rotinc = 0.1;
var maxrot = 0.1;

G.animate(function()
{
    //clear entire canvas of previously rendered shapes
    G.clearCanvas();

    //add shapes if G.event.mouse is pressed down and not right click
    if(state.down && !state.right) addShapes(type);

    //display amount of shapes in top left
    $numObjects.innerHTML = collections[type].length() + " objects";

    //render and detect collisions in canvas bounds for all shapes of currently selected collection
    collections[type].each(function(shape)
    {        
        if(type === "bee")
        {
            if(typeof shape.rot === "undefined") shape.rot = rotinc;
            shape.rotation += shape.rot;
            if(shape.rotation > maxrot) shape.rot = -rotinc;
            if(shape.rotation < -maxrot) shape.rot = rotinc;
        }

        var bounds = shape.bounds();

        //left and right wall collisions
        if(bounds.right > G.stage.width || bounds.left < 0) 
        {
            shape.vel.x *= -1;
            if(bounds.right > G.stage.width) shape.bounds({ right: G.stage.width });
            else if(bounds.left < 0) shape.bounds({ left: 0 });
        }
        
        //top and bottom wall collisions
        else if(bounds.bottom > G.stage.height || bounds.top < 0)
        {
            shape.vel.y *= -1;
            if(bounds.bottom > G.stage.height) shape.bounds({ bottom: G.stage.height });
            else if(bounds.top < 0) shape.bounds({ top: 0 });
        }

        //move shape by shape's velocity, according to framerate (constant speed, framerate-independent)
        if(shape.vel && shape.vel.x) shape.pos.x += shape.vel.x*G.deltaFramerate;
        if(shape.vel && shape.vel.y) shape.pos.y += shape.vel.y*G.deltaFramerate;

        shape.render();
    });
});