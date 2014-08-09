<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Apps</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">

        <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

        <style>
            .container{
                text-align: center;
            }
            h4{
                color:#555;
                font-family:"Helvetica Neue";
            }
            a{
                color:#666;
                text-decoration: none;
                padding: 20px;
            }
            a:hover{
                color: #000;
            }
        </style>
    </head>
    <body>
        <div class="container">
<?php

    $dirs = array();

    $dir = scandir("./");

    foreach($dir as $file)
    {

        if(is_dir($file) && $file[strlen($file)-1] != "." && $file != "assets")
        {
            $file = ucwords(array_pop(explode("/",$file)));
            array_push($dirs, $file);
        }
    }

    foreach($dirs as $dir)
    {
        
        echo "<div class='app'><div><h4><a href='".strtolower($dir)."'>$dir</a></h4></div></div>";
        
    }?>
        </div>
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    </body>
</html>