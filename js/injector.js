window.ympbyc_kakahiakaide_inject_ = function (win, srcs) {
    var injector = {
        win: win,
        script_els: [],
        urls: [],
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
            this._load();
        },
        _load: function () {
            var l = this.urls.shift();
            if (!l) {
                this.on_last_item_loaded();
                return;
            }
            var el = this.inject(l);
            this.script_els.push(el);
            this._load();
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

window.ympbyc_kakahiakaide_injector = window.ympbyc_kakahiakaide_inject_(
    document.getElementById("user-app-iframe").contentWindow, []);
