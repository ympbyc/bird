window.user_app = (function () {
    $(function () {
        $("#preview").on("mouseover", "*", function () {
            //console.log($(this).get(0).className);
        });
    });

    var app = kakahiaka.app({});

    return app;
}());
