window.user_app = (function () {
    $(function () {
        $("#preview").on("mouseover", "*", function () {
            //console.log($(this).get(0).className);
        });
    });

    var s = {};
    var app = kakahiaka.app({}, function (state) {
        window.ympbyc_kakahiakaide_old_userapp_state = s;
        s = state;
    });

    return app;
}());
