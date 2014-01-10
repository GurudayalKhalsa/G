//A Mobile/Desktop 2-player game of Pong

G.physics = true;
G.setCanvas();

G.event.key.on("keyup:escape", function(){G.togglePaused()})


//resize boundaries on window resize
G.event.on("resize", window, function()
{ 
    G.stage.setCanvas(window.innerWidth, window.innerHeight);
    walls.resize(0,0,G.stage.width,G.stage.height,1,0,10);

    //reset player wall collision event
    var score1 = player1.score;
    var score2 = player2.score;
    player1.remove(true);
    player2.remove(true);
    player1 = new Player("Player 1",50,G.stage.height/2,"w","s",walls.left);
    player2 = new Player("Player 2",G.stage.width-50,G.stage.height/2,"up","down",walls.right);
    player1.enemy = player2;
    player1.score = score1;
    player2.enemy = player1;
    player2.score = score2;
    ball.reset();
});

var maxScore = 11;
var walls = new G.Bounds(1,0,10);

var Player = G.Collection.extend
({
    initialize:function(name,x,y,upKey,downKey,wall)
    {
        this._super();
        var self = this;
        this.name = name;

        //paddle
        var w = 15;
        var h = G.isMobile ? 60 : G.stage.height/8;
        var paddle = this.paddle = new G.Rect(x,y,w,h);
        paddle.type = "kinematic";
        paddle.speed = 12;
        paddle.upKey = upKey;
        paddle.downKey = downKey;
        this.add(this.paddle);

        //when collided with ball, change ball speed to reflect angle of rebound
        paddle.on('collision', function(shape, mtv)
        {
            //make sure shape is ball and front of paddle is collided
            if(shape === ball && (wall.pos.x < paddle.pos.x ? mtv.x > 0 : mtv.x < 0))
            {
                if(ball.pos.y < paddle.pos.y)
                {
                    ball.vel.y = (ball.pos.y-paddle.pos.y);
                    if(ball.vel.y < -ball.maxVelY) ball.vel.y = -ball.maxVelY;
                    // if(ball.vel.y > -ball.minVelY) ball.vel.y = -ball.minVelY;
                }    
                else if(ball.pos.y > paddle.pos.y)
                {
                    ball.vel.y = (ball.pos.y-paddle.pos.y);  
                    if(ball.vel.y > ball.maxVelY) ball.vel.y = ball.maxVelY; 
                    // if(ball.vel.y < ball.minVelY) ball.vel.y = ball.minVelY;
                }
            }
        });

        //multitouch paddle move for mobile
        if(G.isMobile)
        {
            G.event.mouse.on('move', function(e)
            {
                var touches = e.changedTouches;
                for(var i = 0; i < touches.length; i++)
                {
                    if(paddle.pos.x < G.stage.width/2 ? touches[i].clientX < G.stage.width/2 : touches[i].clientX > G.stage.width/2) paddle.pos.y = touches[i].clientY;
                }
            });
        }

        //wall
        this.wall = wall;
        this.add(this.wall);
        //when paddle collided with ball, change ball speed to reflect angle of rebound
        this.wall.on('collision', function(){self.wallCollision.apply(self, arguments)});

        //player values
        this.score = 0;
        var padding = 10;
        this.scoreDisplay = new G.Text("Score: "+this.score, wall === walls.left ? wall.pos.x+padding : wall.pos.x-padding, padding, "15px", "Helvetica", "normal", "black", wall === walls.left ? "left" : "right", "top");

        this.add(this.scoreDisplay);
    },

    wallCollision:function(shape, mtv)
    {
        //make sure shape is ball and front of paddle is collided
        if(shape === ball && this.enemy)
        {
            ball.reset();
            this.enemy.score++;
        }
    },

    update:function()
    {
        if(!G.isMobile)
        {
            if(G.event.key.isDown(this.paddle.upKey) && this.paddle.pos.y-this.paddle.height/2 > 0) this.paddle.vel.y = -this.paddle.speed;
            else if(G.event.key.isDown(this.paddle.downKey) && this.paddle.pos.y+this.paddle.height/2 < G.stage.height) this.paddle.vel.y = this.paddle.speed;
            else this.paddle.vel.y = 0;
        }

        //render score
        this.scoreDisplay.text = "Score: "+this.score;
    }

});

var player1 = new Player("Player 1",50,G.stage.height/2,"w","s",walls.left);
var player2 = new Player("Player 2",G.stage.width-50,G.stage.height/2,"up","down",walls.right);

player1.enemy = player2;
player2.enemy = player1;

var ball = new (G.Circle.extend
({
    initialize:function()
    {
        this._super(G.stage.width/2, G.stage.height/2, 8);
        var ball = this;
        ball.restitution = 1;
        ball.maxVelX = G.isMobile ? 5 : 10;
        ball.minVelX = G.isMobile ? 3 : 7;
        ball.maxVelY = G.isMobile ? 4 : 8;
        ball.minVelY = G.isMobile ? 2 : 4;
        ball.vel.x = G.random.choice([G.random(ball.maxVelX,ball.minVelX), G.random(-ball.minVelX, -ball.maxVelX)]);
        ball.vel.y = G.random.choice([G.random(ball.maxVelY,ball.minVelY), G.random(-ball.minVelY, -ball.maxVelY)]);
    },

    reset:function()
    {
        this.remove();
        this.initialize();
    }
}));

function gameover(winner)
{
    G.pause();
    G.clearCanvas();
    new G.Text(winner.name + " Wins!", G.stage.width/2, G.stage.height/2, "30px", "Helvetica Neue", "normal", G.random.color(), "center", "center").render();
}

var intro = new G.Collection
(
    new G.Text("Pong", G.stage.width/2, G.stage.height/2-50, "30px", "Helvetica Neue", "normal", G.random.color(), "center", "center"),
    new G.Text((G.isMobile ? "Tap" : "Click") + " To Begin", G.stage.width/2, G.stage.height/2, "20px", "Helvetica Neue", "normal", G.random.color(), "center", "center")
)
intro.render();

G.event.mouse.one("up", function()
{
    var i = 0;
    intro.remove(true);

    //start game loop
    G.animate(function()
    {
        G.update();
        G.render();

        if(ball.pos.y < 0) ball.pos.y = 0+ball.radius;
        if(ball.pos.y > G.stage.height) ball.pos.y = G.stage.height-ball.radius;

        if(player1.score >= maxScore) gameover(player1);
        else if(player2.score >= maxScore) gameover(player2);
    })
});