//Create stage and canvas, append canvas to dom, by default canvas fills whole window, also creates a physics world at stage.world
var stage = new G.Stage({physics:true}).setCanvas(960, 540);

//set balls not to collide into eachother
stage.world.config({collisions:{ dynamicdynamic:false }});

//create wall bounds - left,top,right,bottom,restitution
new G.Bounds(0, 0, stage.width, stage.height, 1);

//adds 10 balls at either a random position or position specified, a random color and a random velocity
function addBalls(x, y)
{
    for(var i = 0; i < 10; i++)
    {
        //arguments for random are (max, min)
        var x = x||G.random.float(stage.width),
            y = y||G.random.float(stage.height),
            radius = 10,
            color = G.random.color(),
            vx = G.random.float(5,-5),
            vy = G.random.float(5,-5);

        new G.Circle(x,y,radius,color,vx,vy);
    }
}

addBalls();

//adds new balls on click or tap
stage.event.mouse.on("up", function(){  addBalls(stage.event.mouse.state.x, stage.event.mouse.state.y)  });

//start animate and update loop, on every loop, call function passed in
stage.animate(function()
{
    //update physics and positions
    stage.update();
    //clear canvas and render shapes
    stage.render();
});