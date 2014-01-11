G.js
=============

G is a fast, powerful and extendable javascript-based 2D game and graphics framework for use with the HTML5 Canvas element.

**Website:** http://gurudayalkhalsa.github.io/G

####Features:

- Built on extendable classes
- Multiple simultaneous stages
- Collections
- Circle, Rect, Line and Polygon Shapes
- Images
- Sprites (with animations)
- Events for all objects
- Sound
- Physics
- Cameras
- Mobile support
- Mouse/touch/keyboard handling
- And Many More!

G has a few nifty plugins, including integration with the Box2D and Chipmunk Physics engines. It is also very easy to extend so that you can make your own custom plugins!

Quick Start
-----------------

You can grab the code from either the dist repo or one of the latest [releases](https://github.com/GurudayalKhalsa/G/releases), or just clone the repo.

The best way to start learning is to view the source of existing demos. See either the demos folder in this repo or view online [here](http://gurudayalkhalsa.github.io/G/demos/).

Here is an example of a simple hello-world ball bounce demo. This assumes there is an HTML file that includes G.js and this below code afterwards. You can find the demo for the below code [here](http://gurudayalkhalsa.github.io/G/demos/bounce).

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

See [here](http://gurudayalkhalsa.github.io/G/getting-started) for more info on getting started.


Road Map
--------

- Add support for fast WebGL rendering - currently only Canvas

Contributing
------------

If you would like to contribute to the project, feel free to submit a pull request.

If you find a bug, or have a feature request, please report it in the issues section.

If you would like to add a demo to the list of demos, or want to show something off made in G, please get in touch with me at gurudayalkhalsa@gmail.com

License
-------

G is released under the [MIT License](http://opensource.org/licenses/MIT).