window.ympbyc_kakahiakaide_injector = function () {
    var preview = document.getElementById("user-app-iframe").contentWindow;

    if ( ! preview.jQuery)
        inject(preview, "http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js");
    if ( ! preview._) {
        var sc = inject(preview,
               "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js");

        sc.onload = function () {
            inject(preview,
                   "../../bower_components/underscore-fix/underscore-fix.js");
        };
    }


    function inject (win, cdnurl) {
        var sc = win.document.createElement("script");
        sc.src = cdnurl;
        win.document.body.appendChild(sc);
        return sc;
    }
};
window.addEventListener("load", ympbyc_kakahiakaide_injector);
