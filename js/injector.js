window.ympbyc_kakahiakaide_inject = function () {
    window.ympbyc_kakahiakaide_injector = window.ympbyc_kakahiakaide_inject_(
        document.getElementById("user-app-iframe").contentWindow,
        [
            /*{test: "jQuery",
             url:  "http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"},
            {test: "_",
             url:  "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js"},
            {test: "_",
             url:  "../../bower_components/underscore-fix/underscore-fix.js"},
            {test: "kakahiaka",
             url:  "../../bower_components/kakahiaka/kakahiaka.js"}*/
        ]);
};

window.ympbyc_kakahiakaide_inject_ = function (win, srcs) {
    var injector = {
        win: win,
        script_els: [],
        urls: [],
        index: 0,
        push: function (l) {
            if ( ! this.win.document.getElementById(l.id))
                this.urls.push(l);
        },
        inject: function (l) {
            var sc = this.win.document.createElement("script");
            sc.setAttribute("id", l.id);
            sc.src = l.url;
            this.win.document.body.appendChild(sc);
            return sc;
        },
        load: function () {
            var l = this.urls[this.index];
            if (!l) {
                this.index = 0;
                this.urls = [];
                this.on_last_item_loaded();
                return;
            }
            var el = this.inject(l);
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
        if (! src.test || ! win[src.test])
            injector.push(src);
    });
    injector.load();

    return injector;
};
window.addEventListener("load", window.ympbyc_kakahiakaide_inject);
