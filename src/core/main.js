//add event methods to G
Emit.mixin(G);
Emit.mixin(G.Class);

G.events = true;

G.stages = [];
G.collections = [];

G.isMobile = (function() 
{
        //from Modernizr
        try 
        {  
            document.createEvent("TouchEvent");  
            return true;  
        } 
        catch (e) 
        {  
            return false;  
        } 
})();

//add root stage events
G.event = new Event();

//prevent mouse and only allow touch events if on mobile, disable default browser touch events (includes annoying zooming when clicked)
if(G.isMobile) G.event.mouse.onlyTouch().on('touchstart,touchend,touchmove', function(e){ e.preventDefault(); })

return G;
