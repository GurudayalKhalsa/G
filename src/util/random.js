G.random=function(max, min)
{
    //optionally set custom random function (pass in arguments)
    var ran = Math.random;
    for(var i in arguments) if(typeof arguments[i] === "function") ran = arguments[i];
    
    var min = typeof min === "number" ? min : 0;
    var max = typeof max === "number" ? max : 1;
    return Math.round(min+(ran()*(max-min)));
}

G.random.float = function(max,min)
{
    //optionally set custom random function (pass in arguments)
    var ran = Math.random;
    for(var i in arguments) if(typeof arguments[i] === "function") ran = arguments[i];
    
    var min = typeof min === "number" ? min : 0;
    var max = typeof max === "number" ? max : 1;
    return min+(ran()*(max-min));
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