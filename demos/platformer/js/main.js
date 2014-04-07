var game = {util:{}};

define(function(require, exports)
{

var G = game.G = require("G"),
    SeedGenerator = game.util.SeedGenerator = require("lib/seedrandom"),
    player = game.player = require("./player");

var stage = game.stage = new G.Stage({ physics: { gravity: new G.Vector(0, 0.2) } })
                         .config({ camera: { focus: player } })
                         .setCanvas();
            
var key = stage.event.key,
    mouse = stage.event.mouse;
            
var seed = new SeedGenerator("bananas");

player = player.init(game);

console.log(player);

//add blocks
var blocks = new G.Collection;

function generateBlock()
{
   var block = new G.Rect(G.random(mapWidth, seed), G.random(-mapHeight+stage.height, stage.width, seed), G.random(100,40), G.random(70,30), G.random.color());
   block.type = "static";
   blocks.add(block);
}

G.animate(function()
{
   G.update();
   G.render();
})
    
});