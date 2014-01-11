#G Engine
#### Created By Gurudayal Khalsa

___

G is an html5 game engine for making games with the html canvas element, coding in javascript.

The javascript source for the engine is in "Engine src" in the repository source, with an uncompressed version and a minified version.

To understand this engine fully, it may help to view the demos' source code in the "demos" folder of the source, as they all use different methods in different ways in G.

#Getting Started

**Please read "G's main functions" at the bottom of this page for more info on functions and their parameters.**

To create a new canvas, call **G.createCanvas(width, height)**. This searches the dom for a canvas, and if not found creates one. It then sets the dimensions of the canvas to the inputted dimensions. **Note: This function creates global variables canvas (html5 canvas element) and ctx (2d context for canvas)**.

	G.createCanvas(960,540);
	
Calling the above code will create a canvas in the browser window with a width of 960px and a height of 540px.

Let's say we want to have a game where a box is created in the middle of the screen, and falls to the floor due to gravity. 

First, we will create a canvas as above, the we will create a wall on the bottom of the canvas to act as a floor.

	new G.Shape.Wall({
        wallSide:"bottom",
        pos:{
            x:0,
            y:canvas.height
        },
        width:canvas.width,
        height:0
    });

Note that in html5 canvas, the top left part of the canvas has coordinates (0,0) and the bottom right has coordinates (canvas.width, canvas.height), meaning that as you go down and right, the x and y coordinates increase, and as you go up and left, the x and y coordinates decrease.

Next, we would make a new **G.Box()** which is our falling box.

	var myBox = new G.Shape.Box({
	    pos:{
	        x:canvas.width/2,
	        y:canvas.height/2
	    },
	    width:20,
	    height:20,
	    color:"rgb(255,0,0)",
	    type: "kinetic"
	});
	
	myBox.draw();
	
The above code makes a red box of width 20px and height 20px, with a position in the middle of the screen. It's type is "kinetic", meaning it can move. All shapes, if their type is not specified, are "static" and cannot move.

All G.Shape shapes have a built in draw() function, and their positions are located in the very middle of their bounds, as opposed to the top left. Note that the box has been drawn, but it is not falling. **In order to make a game start, animation happen and G's built in simple physics engine to work, you must call G.Game.Create()**. But first, we must create the gameloop we want to include in **G.Game**'s built-in gameloop, **G.Game.Gameloop()**. This means that we should get rid of the myBox.draw() above, and put it in our gameloop to make it continuously be drawn in the gameloop with its own updated position for animation purposes.

	var myGameLoop = function()
	{
		myBox.draw();
	} 
	
This makes sure that in the gameloop, myBox's updated position is being drawn every frame, which means it is animating.
	
Now, after we have created all our game objects and want to start a game, we call **G.Game.Create()**. This takes in an object literal, and basically sets up the stage, physics, and gameloop to run the game based on the G objects that we have created. **G.Game.Create() must be called after you have created all objects that need to be created**. 

So this next code makes the box falling animation start, using G's physics engine to simulate gravity on the box.

	G.Game.Create({
		gravity: 9.8,
		gameLoop: myGameLoop
	});
	
Now, when opening up the browser page, the box should start in the middle of the canvas and fall to the bottom of the canvas, stopping.
	
Here is all the code from this example.
	
	G.createCanvas(960,540);
	
	new G.Shape.Wall({
	    wallSide:"bottom",
	    pos:{
	        x:0,
	        y:canvas.height
	    },
	    width:canvas.width,
	    height:0
	});
	
	var myBox = new G.Shape.Box({
	    pos:{
	        x:canvas.width/2,
	        y:canvas.height/2
	    },
	    width:20,
	    height:20,
	    color:"rgb(255,0,0)",
	    type: "kinetic"
	});
	
	var myGameLoop = function()
	{
	    myBox.draw();
	}   
	
	G.Game.Create({
	    gravity: 9.8,
	    gameLoop: myGameLoop
	});

##G's Main Functions
###G.createCanavas

**createCanvas(width, height)** - Basically, this looks in the dom for any canvas elements with id "canvas", or any canvas elements at all, and finally, if not present, creates a canvas element if none present in dom. It sets the canvas's dimensions to width and height specified.

Takes in object literal as parameter, with canvas object inside, having width and height keys. This example creates a canvas filling the entire window.
	
	G.createCanvas(window.innerWidth, window.innerHeight);
	
**Note: After calling this function, canvas (the canvas element) and ctx (the canvas 2d context) are declared as global variables**

###G.Input
G.Input initializes and starts detecting mouse and keyboard input immediately when the Engine's javascript is loaded in the browser. 


**G.Input.keys.pressed**  stores a boolean of all key pressed values. For example, if you want to check if the "a" key is currently pressed, you could write:

	if(G.Input.keys.pressed.a) doSomething;

All Characters are left, right, up, down, esc, shift, spacebar, w, a, s, d

**G.Input.mouse** has variables for clicked, down, moving, and pos. Clicked, down and moving are booleans, and pos is an object with x,y,inGame{x,y} (stores the position relative to the canvas's xy coordinates, and changes coordinates to camera's coordinates if camera has moved from starting position), and isInGame boolean.

	if(G.Input.mouse.down) doSomething;
	if(G.Input.mouse.pos.x>0) doSomething;
	if(G.Input.mouse.pos.isInGame && G.Input.mouse.pos.inGame.x < 20) doSomething;

**Methods:**

- init() - Starts receiving input by calling window.addEventListener for keydown, keyup, mousemove, mousedown, mouseup, and click. It appropriately changes the values of all keys and mouse positions etc. in the G.Input.keys.pressed and G.Input.mouse objects.

- reset() - Resets all mouse booleans to false

- getMousePos(e) given an event, returns the mouse position inside window, and if mouse is in canvas, returns relative canvas mouse position also 


###G.Image

    var image = new G.Image({
        src:"path/to/image.png",
        pos:{
            x:0,
            y:canvas.height-540
        },
        width: 200,
        height: 100
    });
    
- width and height are optional, will set default dimensions if not entered.

- All possible parameters: (defaults) {src:0,pos:{x:0,y:0},width:0,height:0,draw:false,clip:{x:0,y:0,width:0,height:0}}

**Methods:** 

- **image.draw()**. When calling G.Image.draw, the image will be drawn after it has loaded, based on its current dimensions and position.

- **image.changePos(obj)**.  When calling G.Image.changePos, you input an object with a mandatory pos{x,y} object. The image will then be repositioned and redrawn.
 
###G.SpriteSheet

	var spriteSheet = new G.SpriteSheet({
        src:"path/to/mario.png",
        pos:{
        	x:10,
        	y:20
        },
        clip:{
            x:0,
            y:0,
            width:30,
            height:50
        },
        columns:4,
        rows:3
    });

- All possible parameters: (default) {src:0,pos:{x:0,y:0},clip:{x:0,y:0,width:0,height:0},stepSize:{x:0,y:0},width:0,height:0,rows:1,columns:1}

- Pos is the current sprite's position on the screen. Clip is the size and position individual sprites inside the sheet. The x and y indicate the starting pos of sprites in the sheet. All sprites must have the same width and height, or else some chopping may occur. Columns indicate how many columns of sprite images there are, and rows indicate the amount of rows of images there are. 

Here's what the spritesheet above looks like:

!["Mario"](https://dl.dropboxusercontent.com/u/103707041/Random%20Files/mario.png "Mario")

**Methods:** 

- **image.draw(sprite)**. When calling G.SpriteSheet.draw, the image will be drawn at the specified image index (if you inputted 0 for the image above it would be the top left sprite, 1 would be the second from left on top, and so on).
- **image.iterate(obj)**.  When calling G.SpriteSheet.iterate, you can iterate from a given from sprite index, to a given to index. You can repeat each index to make the sprite change slower, useful for when game is at a high fps, and character sprite is running too fast. You can put repeat:3 to slow down 3x.

Example code for image.iterate

	sheet.iterate({from:4,to:7,repeat:3}); 
	
###G.Camera

A G.Camera will follow a focus inputted into it, and when the focus comes near the bounds of the level (levelBounds), the camera will stop moving. If there is no focus, the camera will not move unless you tell it to.

When you run G.Game.Create, the game creates a camera for your game as G.Game.camera. When, in the G.Game.Create object parameter you enter, you include a cameraFocus, the Game's camera sets the cameraFocus to this object. Here is an example of what G.Game.Create creates when you input a cameraFocus in G.Game.Create:

	G.Game.camera = new G.Camera({
        focus:obj.cameraFocus,
        pos:{x:obj.cameraFocus.pos.x-(canvas.width)/2,y:0},
        levelBounds:G.Game.levelBounds
    });  
	
- All possible params: (default) {pos:{x:0,y:0},vel:{x:0,y:0},scrollRatio:{x:2,y:2},focus:0,frame:{left:0,right:canvas.width,top:0,bottom:canvas.height},levelBounds:{left:0,right:canvas.width,top:0,bottom:canvas.height}};

- If there is no cameraFocus inputted in G.Game.Create, the camera object will not move unless you explicity tell it to. In order to do this, in G.Game.Create, put in a cameraUpdate:someFunction where someFunction is the function that updates the camera every frame. Here is an example of what is done to the camera in a Falldown! like game.
___

	function updateCameraPos()
	{
	    G.Game.camera.pos.y+=0.1;
	}
	
	G.Game.Create({
	    gravity: 9.8,
	    gameLoop: myGameLoop,
	    cameraUpdate:updateCameraPos,
	    levelBounds:game.bounds
	});
	
- Ignore gravity and gameLoop. This updateCameraPos function makes the camera slowly scroll downwards to levelBounds.bottom.

###G.Shape
G.Shape has 3 sub-shapes (as of now). These are circle, box and wall. The physics engine in G will automatically detect and resolve collisions, and simulate other physical properties like gravity, friction and restitution. 

- **Note that the pos of all G.Shape.Circles' and all G.Shape.Boxs' are directly in the middle of the shape's bounds**
  
**Variables:**

All G.Shapes' have a pos, vel, width, height, gravity, restitution, mass, friction, type, collisionSides and color. All of these properties can be entered when creating a new shape. 

Default values: {pos:{x:0,y:0},vel:{x:0,y:0},width:0,height:0,gravity:0,restitution:0,mass:1,friction:0,type:"static",color:"#000",collisionSides:{bottom:true,left:true,right:true,top:true}}

Variables added after shape is created are bounds, collisions, and acc.

**Methods:**

**isMoving()** - returns boolean of if current object is moving in either x or y plane.

**applyForce(obj)** - accepts {x,y} as input, applies force to object. Beware for continuously aplying force every frame as the object starts to speed up fast.

**setBounds(obj)** - Sets shape position based on new input bounds. obj input in form of {top,left,bottom,right}

**resetBounds()** - Resets bounds of shape, based on pos and dimensions.

**resetCollisions()** - Sets all collision bools to be false

**draw()** - draws the shape at its current position.

---

**G.Shape.Circle**

Example: 

	var ball = new G.Shape.Circle({
        pos:{
            x:canvas.width/2,
            y:30
        },
        radius:15,
        color:"#08c",
        type: "kinetic"
    });
    
The above creates a blue colored circle at the middle of canvas x, and 30 y. The radius is 15px (so width and height are automatically 30 and 30), and the type is kinetic. This means that it can move around. If the type was static it could not move around, and would stay stationary no matter what. If no type is specified, the type of shape is automatically static.

**G.Shape.Box**

Example: 

	var box = new G.Shape.Box({
        pos:{
            x:canvas.width/2,
            y:canvas.height/2
        },
        width: 20,
        height: 40
    });
    
The above creates a stationary black box in the middle of the screen, of width 20 and height 40px.
    
**G.Shape.Wall**

Walls are usually used for the bounds of the level. In a simple bouncing ball physics game, there would be four walls: top, left, right and bottom. 

Example of declaring a new Wall:

	var bottom = new G.Shape.Wall({
        wallSide:"bottom",
        pos:{
            x:0,
            y:canvas.height
        },
        width:canvas.width,
        height:0
    })
    
	var bottom=new G.Shape.Wall({wallSide:"bottom"});

Both of the snippets above declare the same thing, as when you enter a wallSide without any other parameters, G.Shape.Wall automatically picks the wallside relative th the canvas dimensions based on the wallSide you entered. If you want to change the wall's placement, this is where the pos, width and height properties come in handy.

G.Shape.Wall does not have a built in draw function. This is because it is mainly used for the outer bounds of the game, and does not usually require one. If you would like a wall with a draw function, make a G.Shape.Box instead.

###G.Game

**G.Game.Create(obj)** - create a new game. Possible parameters are ({gravity, cameraFocus, cameraUpdate, levelBounds, gameLoop}, callback). The callback is called after everything is initiated, and is not mandatory. In fact, no parameters are mandatory.

Example:

	G.Game.Create({
	    gravity:9.8,
	    cameraFocus:ball,
	    levelBounds:{
	    	top:0,
	    	left:0,
	    	right:2000,
	    	bottom:0
	    },
	    gameLoop:game.gameLoop
	}, someFunction);

**G.Game.framerate** - The current framerate

**G.Game.gameLoop(obj)** - Is started when G.Game.Create is called. Here is what the gameloop does.

1. Clears the screen for game objects to be able to be redrawn.
2. Call user's cameraUpdate function inputted in G.Game.Create if there is one.
3. Translate the camera to it's focus' coordinates.
4. Call user's gameloop entered in in G.Game.Create.
5. Handles game physics.
6. Reset the camera's translation.
7. Get the game's framerate.
8. Reset mouse Input.
9. If game is not paused, Request an animation frame from the window.

##G's Constants and Helper Functions
**G.isMobile** - Boolean based on if using a mobile device.

**G.random.number(max,min)** Both max and min are optional, returning a min of 0 and max of the max value entered if min parameter not entered, and a random number between 0 and 1 if neither parameters are entered.

**G.random.color()** - Returns a random rgb-based color.

**G.degrees(radians)** - Convert from radians to degrees

**radians(degrees)** - Convert from degrees to radians

**G.Vector(x, y)** - A vector object produced from xy coordinates. Contains some special functions like dot() for calculating dot product, length for calculating hypotenuse, normalize for calculating the normal, multiply(s) for multiplying x and y by s.



























