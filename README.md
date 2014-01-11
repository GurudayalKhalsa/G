G.js
=============

G is a fast, powerful and extendable javascript-based 2D game and graphics library for use with the HTML5 Canvas element.

**Website:** http://gurudayalkhalsa.github.io/G

####Features:

- Object/Entity-based
- Full mobile support
- Events (event emitter)
- Mouse/touch/keyboard handling
- Sound
- Physics
- Cameras
- Multiple simultaneous stages
- Collections
- Multiple drawable shape objects
- Images
- Sprites
- And Many More!

Quickstart
-----------------

The first thing to do is grab the G source from either the dist repo or one of the latest [releases](releases), or to just clone the repo.

Here is an example of a simple hello-world ball bounce demo. This assumes there is an HTML file that includes G.js and this below code afterwards. For more examples, see the demos folder in this repository, or view online [here](http://gurudayalkhalsa.github.io/G/demos/).

    //Create stage and canvas, append canvas to dom, by default canvas fills whole window
    var stage = new G.Stage({physics:true}).setCanvas();

    //set balls not to collide into eachother
    stage.world.config({collisions:{ dynamicdynamic:false }});

    //create wall bounds - args are either (left,top,right,bottom,restitution,friction,thickness) or (restitution,friction,thickness) defaulting bounds to stage bounds
    new G.Bounds(1,0,5);

    //adds 10 balls at either a random position or position specified, a random color and a random velocity
    function addBalls(x, y)
    {
        for(var i = 0; i < 10; i++)
        {
            var x = x||G.random.float(stage.width),
                y = y||G.random.float(stage.height),
                radius = 10,
                color: G.random.color(),
                vx = G.random.float(5,-5),
                vy = G.random.float(5,-5);

            new G.Circle(x,y,radius,color,vx,vy);
        }
    }

    //adds initial balls
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


Features
--------

**WebGL &amp; Canvas**

Phaser uses both a Canvas and WebGL renderer internally and can automatically swap between them based on browser support. This allows for lightning fast rendering across Desktop and Mobile. When running under WebGL Phaser now supports shaders, allowing for some incredible in-game effects. Phaser uses and contributes towards the excellent Pixi.js library for rendering.

**Preloader**

We've made the loading of assets as simple as one line of code. Images, Sounds, Sprite Sheets, Tilemaps, JSON data, XML and JavaScrtip files - all parsed and handled automatically, ready for use in game and stored in a global Cache for Sprites to share.

**Physics**

Phaser ships with our Arcade Physics system. An extremely light-weight AABB physics library perfect for low-powered devices and fast collision response. Control velocity, acceleration, bounce, drag and full collision and separation control.

**Sprites**

Sprites are the life-blood of your game. Position them, tween them, rotate them, scale them, animate them, collide them, paint them onto custom textures and so much more!
Sprites also have full Input support: click them, touch them, drag them around, snap them - even pixel perfect click detection if needed.

**Groups**

Group bundles of Sprites together for easy pooling and recycling, avoiding constant object creation. Groups can also be collided: for example a "Bullets" group checking for collision against the "Aliens" group, with a custom collision callback to handle the outcome.

**Animation**

Phaser supports classic Sprite Sheets with a fixed frame size, Texture Packer and Flash CS6/CC JSON files (both Hash and Array formats) and Starling XML files. All of these can be used to easily create animation for Sprites.

**Particles**

An Arcade Particle system is built-in, which allows you to create fun particle effects easily. Create explosions or constant streams for effects like rain or fire. Or attach the Emitter to a Sprite for a jet trail.

**Camera**

Phaser has a built-in Game World. Objects can be placed anywhere within the world and you've got access to a powerful Camera to look into that world. Pan around and follow Sprites with ease.

**Input**

Talk to a Phaser.Pointer and it doesn't matter if the input came from a touch-screen or mouse, it can even change mid-game without dropping a beat. Multi-touch, Mouse, Keyboard and lots of useful functions allow you to code custom gesture recognition.

**Sound**

Phaser supports both Web Audio and legacy HTML Audio. It automatically handles mobile device locking, easy Audio Sprite creation, looping, streaming and volume. We know how much of a pain dealing with audio on mobile is, so we did our best to resolve that!

**Tilemaps**

Phaser can load, render and collide with a tilemap with just a couple of lines of code. We support CSV and Tiled map data formats with multiple tile layers. There are lots of powerful tile manipulation functions: swap tiles, replace them, delete them, add them and update the map in realtime.

**Device Scaling**

Phaser has a built-in Scale Manager which allows you to scale your game to fit any size screen. Control aspect ratios, minimum and maximum scales and full-screen support.

**Plugin system**

We are trying hard to keep the core of Phaser limited to only essential classes, so we built a smart Plugin system to handle everything else. Create your own plugins easily and share them with the community.

**Mobile Browser**

Phaser was built specifically for Mobile web browsers. Of course it works blazingly fast on Desktop too, but unlike lots of frameworks mobile was our main focus. If it doesn't perform well on mobile then we don't add it into the Core.

**Developer Support**

We use Phaser every day on our many client projects. As a result it's constantly evolving and improving and we jump on bugs and pull requests quickly. This is a living, breathing framework maintained by a commercial company with custom feature development and support packages available. We live and breathe HTML5 games.

**Battle Tested**

Although Phaser 1.0 is a brand new release it is born from years of experience building some of the biggest HTML5 games out there. We're not saying it is 100% bug free, but we use it for our client work every day, so issues get resolved <em>fast</em> and we stay on-top of the changing browser landscape.

![FruitParty](http://www.photonstorm.com/wp-content/uploads/2013/10/phaser_fruit_particles-640x480.png)


Road Map
--------

The 1.1 release was a massive under-taking, but we're really happy with how Phaser is progressing. It's becoming more solid and versatile with each iteration. Here is what's on our road map for future versions:

Version 1.1.4 ("Kandor")

* Enhance the State Management, so you can perform non-destructive State swaps and persistence.
* More advanced tile map features. Better support for advanced Tiled features. Proper support for DAME tilemaps.

Versions 1.2 ("Saldaea")

* Integration with an advanced physics system. We've been experimenting with p2.js but have yet to conclude our research.
* A more advanced Particle system, one that can render to a single canvas (rather than spawn hundreds of Sprites), more advanced effects, etc.

Version 1.2+

* Massively enhance the audio side of Phaser. Although it does what it does well, it could do with taking more advantage of Web Audio - echo effects, positional sound, etc.
* Comprehensive testing across Firefox OS devices, CocoonJS and Ejecta.
* Integration with third party services like Google Play Game Services and Amazon JS SDK.
* Ability to control DOM elements from the core game and layer them into the game.
* Touch Gestures.
* Virtual d-pad support and also support for the Joypad API.
* Test out packaging with Node-webkit.
* Flash CC HTML5 export integration.
* Game parameters stored in Google Docs.
* Add a d-pad example (http://www.html5gamedevs.com/topic/1574-gameinputondown-question/)
* Create more touch input examples (http://www.html5gamedevs.com/topic/1556-mobile-touch-event/)
* Look at HiDPI Canvas settings.


Learn By Example
----------------

Phaser comes with an ever growing suite of Examples. Personally I feel that we learn better by looking at small refined code examples, so we created over 150 of them and create new ones to test every new feature added. Inside the `examples` folder you'll find the current set. If you write a particularly good example then please send it to us.

The examples need to be run through a local web server (in order to avoid file access permission errors from your browser). You can use your own web server, or start the included web server using grunt.

Using a locally installed web server browse to the examples folder:

    examples/index.html

Alternatively in order to start the included web server, after you've cloned the repo, run `npm install` to install all dependencies, then `grunt connect `to start a local server. After running this command you should be able to access your local webserver at `http://127.0.0.1:8000`. Then browse to the examples folder: `http://127.0.0.1:8000/examples/index.html`

There is a new 'Side View' example viewer as well. This loads all the examples into a left-hand frame for faster navigation.

You can also browse all [Phaser Examples](http://gametest.mobi/phaser/) online.


Contributing
------------

If you find a bug (highly likely!) then please report it on github or our forum.

If you have a feature request, or have written a small game or demo that shows Phaser in use, then please get in touch. We'd love to hear from you.

You can do this on the Phaser board that is part of the [HTML5 Game Devs forum](http://www.html5gamedevs.com/forum/14-phaser/) or email: rich@photonstorm.com

Before submitting a pull request, please run your code through [JSHint](http://www.jshint.com/) to check for stylistic or formatting errors. To use JSHint, first install it by running `npm install jshint`, then test your code by running `jshint src`. This isn't a requirement, we are happy to receive pull requests that haven't been JSHinted, so don't let it put you off contributing - but do know that we'll reformat your source before going live with it.


Bugs?
-----

Please add them to the [Issue Tracker][1] with as much info as possible, especially source code demonstrating the issue.

![Phaser Tilemap](http://www.photonstorm.com/wp-content/uploads/2013/04/phaser_tilemap_collision.png)

"Being negative is not how we make progress" - Larry Page, Google


License
-------

Phaser is released under the [MIT License](http://opensource.org/licenses/MIT).

[1]: https://github.com/photonstorm/phaser/issues
[phaser]: https://github.com/photonstorm/phaser