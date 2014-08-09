// The following code is dependent on jQuery
if(typeof window.jQuery !== "undefined")
{
    (function($){

    /*
     * *********************
     * ****** Buttons ******
     * *********************
     * - 
     */ 
    var radio = $("[data-toggle='button-radio'] .button");
    radio.click(function()
    {
        var active = $(this);
        active.parent().children().each(function(i,e)
        {
            $(e).removeClass("active");
        });
        active.addClass("active");
    });

    })(window.jQuery);


}





