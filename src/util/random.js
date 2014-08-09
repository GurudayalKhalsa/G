G.random=function(max, min)
{
    var min = typeof min === "number" ? min : 0;
    var max = typeof max === "number" ? max : 1;
    return Math.round(min+(Math.random()*(max-min)));
}

G.random.float = function(max,min)
{
    var min = typeof min === "number" ? min : 0;
    var max = typeof max === "number" ? max : 1;
    return min+(Math.random()*(max-min));
};

G.random.color = function()
{
    return "rgb("+G.random(255)+","+G.random(255)+","+G.random(255)+")";
};

G.random.choice = function(arr)
{
    if(Array.isArray(arr)) return arr[G.random(arr.length-1)];
    return arguments[G.random(arguments.length-1)];
}