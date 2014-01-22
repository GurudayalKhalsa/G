//A Mobile/Desktop game of Breakout (one level)

G.physics = true;
G.setCanvas();

G.event.key.on("keyup:escape", function(){G.togglePaused()});

//resize boundaries on window resize
G.event.on("resize", window, function()
{ 

    G.stage.setCanvas(window.innerWidth, window.innerHeight);
    walls.resize(0,0,G.stage.width,G.stage.height,1,0,10);

    if(ball) ball.reset();
    else
    {
        introText.get(0).pos.x = introText.get(1).pos.x = G.stage.width/2;
        introText.get(1).pos.y = G.stage.height/2;
        introText.get(0).pos.y = G.stage.height/2-50;
        introText.render();
    }
    

    //reset player
    player.reset();
    bricks.reset();
    
});

var walls = new G.Bounds(1,0,10);

var player = new (G.Rect.extend
({
    initialize:function(reset)
    {
        
        var self = this;

        this._super(G.stage.width/2, G.stage.width < 400 || G.stage.height < 400 ? G.stage.height-25 : G.stage.height-40, G.stage.width < 400 || G.stage.height < 400 ? 70 : 100, G.stage.width < 400 || G.stage.height < 400 ? 10 : 20);

        this.type = "kinematic";
        if(typeof reset !== "number")
        {
            this.score = 0;
            this.scoreText = new G.Text(function(){return "Score: " + self.score;}, 10, 10, "15px", "Helvetica Neue", "normal", "black", "left", "top");

            //when collided with ball, change ball speed to reflect angle of rebound
            this.on('collision', function(shape, mtv)
            {
                if(mtv.y < 0)
                {
                    var paddle = self;

                    if(ball.pos.x < paddle.pos.x)
                    {
                        ball.vel.x = (ball.pos.x-paddle.pos.x)/5;
                        if(ball.vel.x < -ball.maxVelX) ball.vel.x = -ball.maxVelX;
                    }    
                    else if(ball.pos.x > paddle.pos.x)
                    {
                        ball.vel.x = (ball.pos.x-paddle.pos.x)/5;  
                        if(ball.vel.x > ball.maxVelX) ball.vel.x = ball.maxVelX; 
                    }
                }
            });

            //move paddle on desktop and mobile
            G.event.mouse.on('move', function(e)
            {
                self.pos.x = G.event.mouse.state.pos.x;
            });
        }
        else this.score = reset;
    },

    reset:function()
    {
        this.remove();
        this.initialize(this.score);
    }
}));

var Ball = G.Circle.extend
({
    initialize:function(reset)
    {
        this._super(G.stage.width/2, G.stage.width < 400 || G.stage.height < 400 ? player.pos.y - 50 : player.pos.y-250, G.stage.width < 400 || G.stage.height < 400 ? 5 : 8);
        var ball = this;
        ball.restitution = 1;
        ball.maxVelX = G.stage.width < 400 || G.stage.height < 400 ? 3 : 7;
        ball.minVelX = G.stage.width < 400 || G.stage.height < 400 ? 2 : 4;
        ball.maxVelY = G.stage.width < 400 || G.stage.height < 400 ? 3 : 6;
        ball.minVelY = G.stage.width < 400 || G.stage.height < 400 ? 1 : 3;
        if(reset) clearTimeout(this._timeoutId);
        this._timeoutId = setTimeout(function()
        {
            ball.vel.x = G.random.choice([G.random(ball.maxVelX,ball.minVelX), G.random(-ball.minVelX, -ball.maxVelX)]);
            ball.vel.y = G.random(ball.maxVelY,ball.minVelY);
        }, 2000);

        //play sound on collision
        if(!reset)
        {
            this.on("collision", function()
            {
                sound.play();
            });
        }
    },

    reset:function()
    {
        this.remove();
        this.initialize(true);
    }
});

var bricks = new (G.Collection.extend
({
    initialize:function(reset)
    {
        if(!reset) this._super();

        var padding = G.stage.width < 400 || G.stage.height < 400 ? G.stage.width/10 : G.stage.width/20,
            cellWidth = G.stage.width < 400 || G.stage.height < 400 ? G.stage.width/10 : G.stage.width/20,
            cellHeight = G.stage.width < 400 || G.stage.height < 400 ? G.stage.height/12.5 : G.stage.height/25,
            rows = G.stage.width < 400 || G.stage.height < 400 ? 7 : 10,
            columns = G.stage.width < 400 || G.stage.height < 400 ? 8 : 18,
            width = cellWidth-4,
            height = cellHeight-4;

        if(reset) var current = -1;

        for(var i = 0; i < rows; i++)
        {
            for(var j = 0; j < columns; j++)
            {
                var x = padding+((j*cellWidth)+(cellWidth/2));
                var y = padding+((i*cellHeight)+(cellHeight/2));
                if(reset)
                {
                    current++;
                    var brick = this.objects[current];
                    if(!brick) continue;
                    brick.pos.x = x;
                    brick.pos.y = y;
                    brick.width = width;
                    brick.height = height;
                }
                else
                {
                    var brick = new G.Rect(x,y,width,height,G.random.color());
                    brick.type = "static";
                    this.add(brick);
                }
                
            }
        }

        if(!reset)
        {
            this.each(function(brick)
            {
                brick.on("collision", function()
                {
                    player.score++;
                    brick.remove();
                });
            });
        }
    },

    reset:function()
    {
        this.initialize(true);
    }
}));

var sound = new G.Sound("assets/bounce", ["mp3", "wav", "ogg"]);

function gameover(win)
{
    G.clearCanvas();
    new G.Text((win ? "You Win!" : "You Lose :("), G.stage.width/2, G.stage.height/2-30, "30px", "Helvetica Neue", "normal", G.random.color(), "center").render();
    G.pause();
}

var introText = new G.Collection
(
    new G.Text("Breakout", G.stage.width/2, G.stage.height/2-50, "30px", "Helvetica Neue", "normal", G.random.color(), "center", "center"),
    new G.Text((G.isMobile ? "Tap" : "Click") + " To Begin", G.stage.width/2, G.stage.height/2, "20px", "Helvetica Neue", "normal", G.random.color(), "center", "center")
)
introText.render();

var ball;

G.event.mouse.one("up", function()
{
    var i = 0;
    introText.remove(true);
    ball = new Ball();

    //start game loop
    G.animate(function()
    {
        G.update();
        G.render();

        if(bricks.length() === 0) gameover(true);
        walls.bottom.one("collision",function(){ gameover(false); });
    })
});