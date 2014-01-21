//One-Level Breakout Demo

//create stage, physics and canvas
var stage = new G.Stage({ physics:true });
stage.setCanvas(640, 480);

//create walls
var walls = new G.Bounds(0,0,stage.width,stage.height,1);

//set brick properties
var bricks = new G.Collection(),
    rows = 8,
    columns = 10,
    padding = 30, 
    cellWidth = 58,
    cellHeight = 25,
    width = cellWidth-4,
    height = cellHeight-4;

//create a brick for every column in every row, add to brick collection
for(var i = 0; i < rows; i++)
{
    for(var j = 0; j < columns; j++)
    {
        var currentX = padding+((j*cellWidth)+(cellWidth/2));
        var currentY = padding+((i*cellHeight)+(cellHeight/2));
        var brick = new G.Rect(currentX,currentY,width,height,G.random.color());
        brick.type = "static";
        brick.on("collision", function()
        {
            this.remove();
            player.score++;
        });
        bricks.add(brick);
    }
}

//Create ball
var Ball = G.Circle.extend
({
    initialize:function(reset)
    {
        //create ball in middle of screen, above player paddle, with radius of 5
        this._super(G.stage.width/2, stage.height-150, 5);

        //set ball values
        this.set
        ({
            restitution: 1,
            maxVelX: 5,
            minVelX: 3,
            maxVelY: 6,
            minVelY: 3
        });

        //set pos to center, pause for 2 seconds, and then start movement
        setTimeout(function()
        {
            this.vel.x = G.random(this.maxVelX,-this.minVelX);
            this.vel.y = G.random(this.maxVelY,this.minVelY);
        }.bind(this), 2000);

        //play bounce sound on collision
        this.sound = new G.Sound("assets/bounce", ["mp3", "wav", "ogg"]);
        this.on("collision", function(){ this.sound.play(); });
    }
});

//Create player
var player = new G.Rect(G.stage.width/2, G.stage.height-20, 100, 15)
.set
({
    type: "kinematic",
    score: 0,
    scoreText: new G.Text(function(){ return "Score: " + player.score }, 10, 10, "15px", "Helvetica Neue", "normal", "black", "left", "top")
})
//rebound angle on collision with ball
.on('collision', function(shape, mtv)
{
    if(mtv.y < 0)
    {
        ball.vel.x = (ball.pos.x-player.pos.x)/5;  
        if(ball.vel.x < -ball.maxVelX) ball.vel.x = -ball.maxVelX;
        else if(ball.vel.x > ball.maxVelX) ball.vel.x = ball.maxVelX; 
    }
});

//keep paddle x pos at mouse x pos
stage.event.mouse.on('move', function(e)
{
    player.pos.x = stage.event.mouse.state.pos.x;
});

//initialize ball on click
var ball;
var clicktext = new G.Text("Click to Start", stage.width/2, stage.height/2+20, "30px", "Helvetica Neue", "normal", G.random.color(), "center");
stage.event.mouse.on("up", function()
{
    clicktext.remove();
  //create ball instance
    ball = new Ball();
});

//Create and run game loop
stage.animate(function()
{
    stage.update();
    stage.render();

    //set gameover when either ball touches ground or all bricks gone.
    if(walls.bottom.colliding || !bricks.length())
    {
        stage.clearCanvas();
        stage.pause();
        new G.Text((!bricks.length() ? "You Win!" : "You Lose :("), stage.width/2, stage.height/2-30, "30px", "Helvetica Neue", "normal", G.random.color(), "center").render();
    }
});