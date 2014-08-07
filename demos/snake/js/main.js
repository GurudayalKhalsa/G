//Simple Snake Game
//a different method of initializing, instead of calling G.setCanvas
var stage = new G.Stage().setCanvas(960, 540);
var canvas = stage.canvas, ctx = stage.ctx;
stage.desiredFramerate = 10;

var key = G.event.key;

stage.event.key.on("keyup:escape", function(){G.togglePaused()})

//cells are 48x27 (960x540 of 20px width and height)
var cells={
    columns:stage.width/20,
    rows:stage.height/20,
    width:20,
    height:20
};

var x = cells.width, y = cells.height;

//create food
var food = new G.Rect(x/2+G.random(cells.columns-1)*cells.width, y/2+G.random(cells.rows-1)*cells.height, cells.width-2, cells.height-2, "red"
);

food.respawn=function()
{
    this.pos.set(x/2+G.random(cells.columns-2)*cells.width, y/2+G.random(cells.rows-2)*cells.height);
};

//create snake
var snake = new G.Class
({
    direction:"right",
    score:0,
    scoreDisplay:new G.Text(function(){return "Score: "+snake.score}, stage.width-10, 10, "15px", "Helvetica", "normal", "black", "right", "top"),
    width:cells.width-2,
    height:cells.width-2,
    cells:[],

    initialize:function()
    {
        var self = this;
        for(var i = 4; i >= -1; i--) this.cells.push( new G.Rect(x/2+i*cells.width, y/2, this.width, this.height) );
        
        key.on("left", function(){ if(self.direction !== "right") self.direction = "left" });
        key.on("right", function(){ if(self.direction !== "left") self.direction = "right" });
        key.on("up", function(){ if(self.direction !== "down") self.direction = "up" });
        key.on("down", function(){ if(self.direction !== "up") self.direction = "down" });
    },
    grow:function()
    {
        return new G.Rect(this.cells[0].pos.x, this.cells[0].pos.y, this.width, this.height);      
    },
    update:function()
    {
        if(G.Physics.intersecting(this.cells[0], food))
        {
            this.score++;
            var tail = this.grow();
            food.respawn();
        }

        else
        {
            var tail = this.cells.pop();
            tail.pos.set(this.cells[0].pos);
        }
        this.cells.unshift(tail);

        if(this.direction==="up") this.cells[0].pos.y-=y;
        if(this.direction==="left") this.cells[0].pos.x-=x;
        if(this.direction==="right") this.cells[0].pos.x+=x;
        if(this.direction==="down") this.cells[0].pos.y+=y;   

        //Trigger Game Over
        
        //if snake overlaps with itself
        if(G.Physics.intersecting(this.cells)) gameover();

        //if out of bounds
        if(this.cells[0].pos.x > stage.width || this.cells[0].pos.x < 0 || this.cells[0].pos.y > stage.height || this.cells[0].pos.y < 0) gameover();
    }
})

function gameover()
{
    new G.Text("Game Over :(", stage.width/2, stage.height/2, "30px", "Helvetica Neue", "normal", G.random.color(), "center", "bottom").render();
    stage.pause();
}

stage.animate(function()
{
    snake.update();
    stage.render();
});