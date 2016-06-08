

function main ()
{

    var url = window.location.href;

    // Create our own DOM
    $("body").html("");
    $("body").addClass("viewer-body");
    $("body").append('<img draggable="false" class="image" src="'+url+'">');
    $("body").append('<div class="zoom-tooltip"></div>');
    $("body").append('<div id="btn1" class="round-button"></div>');
    $("body").append('<div id="btn2" class="round-button"></div>');
    $("body").append('<div id="btn3" class="round-button"></div>');
    $("body").append('<div id="stats" class="box"></div>');


    var tag_body = document.getElementsByTagName('body')[0];
    var tag_img = document.getElementsByTagName('img')[0];
    var zoom_tooltip = document.getElementsByClassName('zoom-tooltip')[0];

    // TODO:
    // + Hover on image to get it's stats: WxH, name, size.
    // + Move with mouse
    // + Resize with scroll wheel
    // + Popup with current % size, option for pixel size and option for both
    // - Multiplicative scroll (as option)
    // + Button icons
    // - Settings panel
    // + Transfer to extension
    // + Support for other formats
    // - Hotkeys for buttons


    // Get image actual size
    var w = tag_img.naturalWidth;
    var h = tag_img.naturalHeight;
    var w2 = w/2;
    var h2 = h/2;
    var zoom = 1.00;
    var zoomPower = 0.05;
    var zoomCache = 0.0;
    var offset = {x:0,y:0};


    function UpdatePosition ()
    {
        var sw = tag_body.clientWidth/2;
        var sh = tag_body.clientHeight/2;

        // And calculate offset, to center image.
        tag_img.style.left = offset.x + sw - zoom*(w/2);
        tag_img.style.top = offset.y + sh - zoom*(h/2);


        //zoom_tooltip.style.left = offset.x + sw - zoom_tooltip.clientWidth/2;
        //zoom_tooltip.style.top = offset.y + sh - zoom_tooltip.clientHeight/2;
    }

    function UpdatePositionAndZoom ()
    {
        // Set starting size (from settings)
        tag_img.style.width = w*zoom;
        tag_img.style.height = h*zoom;
        zoom_tooltip.innerHTML = (parseInt(zoom*1000)/10.0)+"%";

        // Animate zoom fade out
        $(".zoom-tooltip").stop(true).css("opacity",1).css("display","block");
        $(".zoom-tooltip").delay(500).fadeOut(1000);

        UpdatePosition();
    }

    function smoothZoom (z)
    {
        if( zoom >= 0.01 ) {
            zoom = zoom + z;
            if (zoom < 0.01)
                zoom = 0.01;
        } else {
            z = 0;
            zoom = 0.01;
        }

        UpdatePositionAndZoom();

        if( Math.abs(z) > 0.005 )
        {
            setTimeout(function (){
                smoothZoom(z*0.8);
            },100);
        }
        else
        {
            // Stick to 25% 50% 100% 150%
            // 0.25 0.5 1.0
            // 1 2 3 4
            var a = (zoom/0.25);
            if( zoom > 0.98 && zoom < 1.02 ) {
                zoom = 1;
                UpdatePositionAndZoom();
            }
        }
    }

    // function zoomCycle ()
    // {
    //     if( Math.abs(zoomCache) > 0.005 ) {
    //         zoom = zoom + zoomCache;
    //         zoomCache = zoomCache * 0.6;

    //         UpdatePositionAndZoom();
    //     }
    // }

    // setInterval(zoomCycle, 100);

    // Addaptive zoom
    var z = ($(window).width()*0.8)/w;
    if(w/$(window).width() < 0.8 && z < 1) {
        zoom = z;
    }



    // Write information into stats box
    $("#stats").html(w + "x" + h);


    // Setting initial zoom and position
    UpdatePositionAndZoom();


    //
    // Mouse Scroll
    //
    tag_body.addEventListener("wheel", function(e) {

        if(e.wheelDelta > 0)
            //zoomCache = zoomCache + zoomPower;
            smoothZoom(0.03);
        else
            //zoomCache = zoomCache - zoomPower;
            smoothZoom(-0.03);
        // if(e.wheelDelta > 0)
        // {
        //     zoom = zoom * (1.00 + zoomPower);
        // }

        // if(e.wheelDelta < 0)
        // {
        //     if(tag_img.clientHeight > 10)
        //         zoom = zoom * (1.00 - zoomPower);
        // }


        // // Snap zoom to 100% when near.
        // if(zoom > 0.95 && zoom < 1.05)
        // {
        //     zoom = 1.00
        // }

        //UpdatePositionAndZoom();
    });


    // Image dragging with mouse
    var isMouseDown = false;
    var lastPosition = {x:0,y:0};

    tag_body.addEventListener("mousedown",function(e) {
        isMouseDown = true;
        lastPosition.x = e.clientX;
        lastPosition.y = e.clientY;
        //console.log(lastPosition);
    });
    tag_body.addEventListener("mouseup",function() {
        isMouseDown = false;
    });
    tag_body.addEventListener("mouseout",function() {
        isMouseDown = false;
    });
    tag_body.addEventListener("mousemove",function(e) {
        if(isMouseDown)
        {
            // Setting new offset
            offset.x = offset.x + (e.clientX - lastPosition.x);
            offset.y = offset.y + (e.clientY - lastPosition.y);

            // 
            lastPosition.x = e.clientX;
            lastPosition.y = e.clientY;

            UpdatePosition();
        }
    });


    //
    // Side buttons functionality
    //

    $("#btn1").css("background-image","url(" + chrome.extension.getURL("icons/btn1.png")+")");
    console.log( chrome.extension.getURL("icons/btn1.png") );

    // Stats
    $("#btn1").hover(function(){
        $("#stats").show();
    },
    function(){
        $("#stats").hide();
    });


    // 1:1 Ration | 100% zoom
    $("#btn2").click(function(){
        zoom = 1;
        UpdatePositionAndZoom();
    }).css("background-image","url(" + chrome.extension.getURL("icons/btn2.png")+")");


    // Reset position
    $("#btn3").click(function(){
        offset = {x:0,y:0};
        UpdatePosition();
    }).css("background-image","url(" + chrome.extension.getURL("icons/btn3.png")+")");
}


// Check if this page is google's image viewer :p
if( $("body").children().length == 1 && $("body > img").length == 1)
{
    main();
}