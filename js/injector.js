window.ympbyc_kakahiakaide_inject = function () {
    window.ympbyc_kakahiakaide_injector = window.ympbyc_kakahiakaide_inject_(
        document.getElementById("user-app-iframe").contentWindow,
        [["http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js", "jQuery"],
         ["http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js", "_"],
         ["../../bower_components/underscore-fix/underscore-fix.js", "_"]]);
};

window.ympbyc_kakahiakaide_inject_ = function (win, srcs) {
    var injector = {
        win: win,
        script_els: [],
        urls: [],
        index: 0,
        push: function (url) {
            this.urls.push(url);
        },
        inject: function (cdnurl) {
            var sc = this.win.document.createElement("script");
            sc.src = cdnurl;
            this.win.document.body.appendChild(sc);
            return sc;
        },
        load: function () {
            var url = this.urls[this.index];
            if (!url) {
                this.on_last_item_loaded();
                return;
            }
            var el = this.inject(url);
            this.script_els.push(el);
            this.load_next_on_loaded(el);
        },
        load_next_on_loaded: function (el) {
            if (el.readyState === "complete") {
                this.index++;
                this.load();
            }
            else {
                this.index++;
                el.onload = this.load.bind(this);
            }
        },
        on_last_item_loaded: function () {}
    };

    srcs.forEach(function (src) {
        if ( ! win[src[1]])
            injector.push(src[0]);
    });
    injector.load();

    return injector;
};
window.addEventListener("load", window.ympbyc_kakahiakaide_inject);
