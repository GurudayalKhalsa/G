G.setCanvas();

var mouse = G.event.mouse;

var introText = new G.Text
({
    text:"Click and drag to draw lines.", 
    pos:{x:G.stage.width/2, y:G.stage.height/2},
    align:"center",
    size:"25px"
}).render();

//remove intro text
mouse.one('down', function()
{
    G.clearCanvas();
    introText.remove();
})

mouse.on('down', function(e)
{
    if(mouse.state.right) return;
    
    var thickness = G.random(25,5);
    var endStyle = "round";
    var color = G.random.color();

    function moveListener(e2)
    {
        var line = new G.Line(mouse.state.pos.last.x, mouse.state.pos.last.y, mouse.state.pos.x, mouse.state.pos.y, color, thickness);
        line.endStyle = "round";
        line.render();
    }

    mouse.on("move", moveListener);
    mouse.one("up", true, function(e)
    {
        mouse.off("move", moveListener);
    });
});