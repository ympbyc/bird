$(function () {
    var $area = $("#mouse-tracker");
    var area_w = $area.outerWidth();
    var screen_w = $(document).width();
    var screen_h = $(document).height();
    var magnifier = area_w / screen_w;
    var bar_w = 10;
    var num_bars = Math.floor(area_w / bar_w);
    _.range(num_bars).forEach(function (i) {
        $("<div class='sound-bar'>")
            .attr("id", "sb-" + i)
            .css({left: i * bar_w}).appendTo($area);
    });

    function stabilize ($bar, speed) {
        return function () {
            $bar.animate({height: 10}, speed, function () {
                $bar.removeClass("click-sound");
            });
        };
    };

    function play (e, speed) {
        var X = e.screenX;
        var Y = e.screenY;
        var id = Math.floor(magnifier * X / bar_w);
        var i;
        for (i = Math.max(0, id-2); i <= Math.min(num_bars, id+2); ++i) {
            var $bar = $("#sb-" + i);
            $bar.animate({height: Math.max(10, (screen_h - Y + 40) / 5 - (Math.abs(id -i) * 10))},
                         speed || 700, stabilize($bar, speed || 700));
            if ( ! speed) $bar.addClass("click-sound");
        }
    }

    //onclick
    $(document).on("click", play);
    setTimeout(function () {
        window.ympbyc_kakahiakaide.exposed.user_app_context().$("html").on("click", play);
    }, 3000);

    //heartbeat
    setInterval(function () {
        play({screenX: Math.random() * screen_w, screenY: 660}, 2000);
    }, 4500);

    //keydown
    var key_idx = 0;
    $(".ide").on("keydown", function (e) {
        play({screenX: key_idx * bar_w / magnifier, screenY: 550}, 200);
        if (e.keyCode === 8) //backspace
            key_idx = key_idx <= 0 ? num_bars : key_idx - 1;
        else
            key_idx = key_idx >= num_bars ? 0 : key_idx + 1;
    });
});
