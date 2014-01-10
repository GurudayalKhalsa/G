G.showFramerate = true;
// G.physics = true;

G.setCanvas();

//set root mouse event listener to canvas, and start running mouse engine
var state = G.event.mouse.setRoot(G.canvas).run().state;

//prevent mouse and only allow touch events if on mobile, disable default browser touch events (includes annoying zooming when clicked)
if (G.isMobile) G.event.mouse.onlyTouch().run().on('touchstart,touchend,touchmove', function(e)
{
    e.preventDefault();
})

//randomly select the initial type of shape to draw
var type = G.random.choice(["circle", "bunny", "rect"]);

//make the html button of that type active
var active = $("#type #" + type).addClass("active");

//when a new button is clicked, change the render type for new clicks
$("#type .button").on('click', function()
{
    type = this.id;
});

//resize canvas / walls on window resize
G.event.on("resize", window, function(e)
{
    G.stage.setCanvas(window.innerWidth, window.innerHeight);
    _.each(collections, function(collection)
    {
        collection.walls.resize(0,0,G.stage.width,G.stage.height, 0.2, 1);
        collection.walls.each(function(wall){collection.add(wall)});
    });
})

//create new collections to store shapes in
var collections = {
    //params are addToCollections, addToObjectCollections, addPhysics
    rect: new G.Collection(true,true,true),
    bunny: new G.Collection(true,true,true),
    circle: new G.Collection(true,true,true)
};


//configure physics to not detect collisions for two moving objects
_.each(collections, function(collection)
{
    var walls = collection.walls = new G.Bounds(0, 0, G.stage.width, G.stage.height, 0.2, 1);
    walls.each(function(wall){collection.add(wall)});

    collection.world.config
    ({
        collisions:
        {
            dynamicdynamic: false
        }
    })
});

//adds shapes of choice, can be rect, circle of bunny

function addShapes(t)
{
    var x = state.pos.x || G.stage.width / 2;
    var y = state.pos.y || G.stage.height / 2;
    var r = 20;

    for (var i = 0; i < 10; i++)
    {
        var vx = G.random.float(5, -5);
        var vy = G.random.float(5, -5);
        var w = G.random.float(60, 40);
        var h = G.random.float(60, 40);

        //add circles
        if (t === "circle") collections[t].add(new G.Circle(x, y, r, G.random.color(), vx, vy));
        //add bunnies
        if (t === "bunny") collections[t].add(new G.Image("bunny.png", x, y, 0, 0, vx, vy));
        //add rectangles
        if (t === "rect") collections[t].add(new G.Rect(x, y, w, h, G.random.color(), vx, vy));
    }
}

//initialize by adding shapes
addShapes(type);

//get amount of collision checks, add properties to shapes
var checks = {circle:0,rect:0,bunny:0};
_.each(collections, function(collection, name)
{
    collection.query({type:"static"}).each(function(shape)
    {
        shape.on("collisionCheck", function() { checks[name]++; });
    })
});

G.animate(function()
{
    //clear entire canvas of previously rendered shapes
    G.clearCanvas();

    //update physics
    collections[type].update();

    //render shapes
    collections[type].render();

    //add shapes if G.event.mouse is pressed down and not right click
    if (state.down && !state.right) addShapes(type);

    G.ctx.fillStyle = "#fff";
    G.ctx.fillRect(0,15,125,60);

    G.ctx.fillStyle = "#000";
    G.ctx.font = "13px Helvetica Neue";

    //display amount of shapes in top left
    // G.ctx.fillText(collections[type].query({pos:{x:"range:0:"+G.stage.width, y:"range:0:"+G.stage.height}}).length() + " objects", 5, 40);
    G.ctx.fillText(collections[type].length() + " objects", 5, 40);

    //display amount of collision checks
    G.ctx.fillText(checks[type] + " collision checks", 5, 60);
    //reset checks
    _.each(checks, function(check, i){ checks[i] = 0 })
});