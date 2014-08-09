G.rgb = function(r, g, b)
{
  if(_.isArr(r))
  {
    var arr = r;
    r = arr[0], g = arr[1], b = arr[2];
  }
  
  return "rgb("+r+","+g+","+b+")";
}