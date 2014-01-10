G.setCanvas();

var assets = new G.Collection();

assets.add(new G.Image("assets/1.jpg", 250, 210, 500));
assets.add(new G.Image("assets/2.jpg", 770, 210, 500));
assets.add(new G.Image("assets/3.jpg", 250, 550, 500));
assets.add(new G.Image("assets/4.jpg", 770, 550, 500));

var loadingText = new G.Text("Loading...", 20, 20);
loadingText.align = "left";

assets.on("loading", function(loading, loaded, assets) 
{
    loadingText.text = "Loaded " + loaded.length() + " of " + assets.length() + " assets.";
});

assets.on("load", function(assets) 
{
    loadingText.text = "Loaded " + assets.length() + " of " + assets.length() + " assets.";
});

assets.each(function(asset)
{
    if (!asset.loaded) asset.text = new G.Text("Loading...", asset.pos.x, asset.pos.y);

    asset.on("load", function()
    {
        asset.text.remove();
    })
});

G.animate(function()
{
    G.render();
})