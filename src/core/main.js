//G Main / initialize

//add event methods to G
Emit.mixin(G);
Emit.mixin(G.Class);

G.events = true;

G.stages = [];
G.collections = [];

G.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//add root stage events
G.event = new Event();

//prevent mouse and only allow touch events if on mobile, disable default browser touch events (includes annoying zooming when clicked)
// if(G.isMobile) G.event.mouse.onlyTouch().on('touchstart,touchend,touchmove', function(e){ e.preventDefault(); })

return G;
