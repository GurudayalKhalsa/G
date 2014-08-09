//shortcut to configure root stage
G.config = function(obj)
{
    if(typeof obj !== "object") return false;

    //physics
    if(obj.physics) 
    {
        if(typeof obj.physics === "boolean") G.physics = obj.physics;
        else if(typeof obj.physics === "object")
        {
            G.physics = true;

            //gravity
            if(typeof obj.physics.gravity === "number") G.gravity = new G.Vector(G.gravity ? G.gravity.x : 0, obj.physics.gravity);
            if(typeof obj.physics.gravity === "object") G.gravity = new G.Vector(obj.physics.gravity.x, obj.physics.gravity.y);

            //hashmap bucket cellsize
            if(typeof obj.physics.cellSize === "number") G.cellSize = obj.physics.cellSize;
        }
    }

    if(typeof obj.showFramerate === "boolean") 
    {
        G.showFramerate = obj.showFramerate;
        if(G.stage) G.stage.showFramerate = obj.showFramerate;
    }
}