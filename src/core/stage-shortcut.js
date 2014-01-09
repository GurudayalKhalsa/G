
//Stage Shortcut
//--------------


G.animate = function(time)
{
    G.stage.animate(time);
    G.stage.on("animate", function()
    {
        G.framerate = G.stage.framerate;
        G.deltaFramerate = G.stage.deltaFramerate;
        G.deltaTime = G.stage.deltaTime;
        G.desiredFramerate = G.stage.desiredFramerate;
        G.trigger("animate", arguments);
    });
    return this;
};

G.pause = function()
{
    if(G.stage.pause() !== false)
    {
        G.isPaused = true;            
        G.trigger("pause", arguments);
    }
    return this;
};

G.unPause = function()
{
    G.stage.unPause();
    G.isPaused = false;
    G.trigger("unpause", arguments);
    return this;
};

G.togglePaused = function()
{
    if(G.isPaused) G.unPause();
    else G.pause();
    return this;
}

G.update = function()
{
    if(G.stage.length() === 0) return false;
    G.trigger("update");
    G.stage.update();
    _.each(G.collections, function(collection)
    {
        collection.update();
    });
    return this;
}

//renders all shapes created (in stage)
G.render = function(noClear)
{
    if(G.stage.length() === 0) return false;
    G.trigger("render");
    G.stage.render(noClear);
    return this;
}

G.setCanvas = function()
{
    if(!G.stage) 
    {
        new G.Stage();
        G.stage.event = G.event;
    }

    G.stage.setCanvas.apply(G.stage, arguments);

    this.canvas = G.stage.canvas;
    this.ctx = G.stage.ctx;

    if(G.showFramerate) G.stage.showFramerate = true;
    if(typeof G.desiredFramerate === "number") G.stage.desiredFramerate = G.desiredFramerate;
    G.framerate = G.stage.framerate;
    G.deltaFramerate = G.stage.deltaFramerate;
    G.deltaTime = G.stage.deltaTime;
    G.desiredFramerate = G.stage.desiredFramerate;
    //set root mouse event listener to canvas, and start running mouse engine
    

}

G.clearCanvas = function()
{
    this.stage.clearCanvas();
}

G.getCanvas = function()
{
    return this.canvas || (G.stage ? G.stage.canvas : false);
}

G.getContext = function()
{
    return this.ctx || (G.stage ? G.stage.canvas : false);
}