//watches ide's model and
//manipulates the app in development

(function () {
    "use strict";

    var K = kakahiaka;
    var user_app = window.user_app;
    var app = window.ympbyc_kakahiakaide.app;
    var exposed = window.ympbyc_kakahiakaide.exposed;


    //caution:: union doesn't seem like a perfect solution.

    K.watch_transition(app, "models", function (s, os, keys) {
        if (s.no_propagation_to_child) return;
        //addition + update
        _.each(s.models, function (m, k) {
            if ( ! _.isEqual(m, os[k]))
                K.simple_update(user_app, k, m);
        });
    });


    K.watch_transition(app, "model_watches", function (s, os) {
        _.each(_.difference(s.model_watches, os.model_watches), function (w) {
            var wbody = "var $ = this.$;\n"
                      + "var document = this.document;\n"
                      + w.watch_body;
            var f = new Function("state", "old_state", wbody);
            var g = function (s, os) {
                try {
                    f.call(document.getElementById('user-app-iframe').contentWindow, s, os);
                } catch (err) { ympbyc_kakahiakaide_notify(err.message, '#E06A3B'); }
            };
            g.watch_id = w.id;

            var idx = _.map(user_app._watchers[w.watch_key] || [],
                            att("watch_id")).indexOf(w.id);

            if (idx < 0)
                K.watch_transition(user_app, w.watch_key, g, true);

            else {
                //! use of unsupported feature !
                user_app._watchers[w.watch_key][idx] = g;
                setTimeout(function () {
                    g(K.deref(user_app), K.deref(user_app));
                }, 0);
            }
        });
        //delete
        _.each(difference(os.model_watches, s.model_watches), function (w) {
            var idx = _.map(user_app._watchers[w.watch_key] || [],
                            att("watch_id")).indexOf(w.id);
            //! use of unsupported feature !
            user_app._watchers[w.watch_key][idx] = function () {};
        });
    }, true);


    K.watch_transition(app, "transitions", function (s, os) {
        //no need to delete
        //just handles update and addition
        _.each(s.transitions, function (t) {
            window[t.name] = K.deftransition(function (state /*args*/) {
                var patch = new Function(t.args, t.body).apply(null, _.toArray(arguments));
                exposed.notify_child_model_change(app, _.merge(state, patch));
                return patch;
            });
        });
    }, true);



    function att (k) {
        return _.flippar(_.at, k);
    }

    var listeners = {}; //id: f
    K.watch_transition(app, "dom_listeners", function (s, os) {
        var $doc = $("#user-app-iframe").contents();
        _.each(s.dom_listeners, function (l) {
            var f = new Function("e", l.body);

            if (_.has(listeners, l.id)) //update
                $doc.off(l.event, listeners[l.id]);

            listeners[l.id] = f;
            $doc.on(l.event, l.selector, f);
        });

        //delete
        _.each(difference(os.dom_listeners, s.dom_listeners), function (l) {
            $doc.off(l.event, listeners[l.id]);
            delete(listeners[l.id]);
        });
    });

    K.watch_transition(app, "libraries", function (s, os) {
        if (s.refreshing) return;
        _.difference(s.libraries, os.libraries).forEach(function (l) {
            window.ympbyc_kakahiakaide_injector.push(l);
        });
        window.ympbyc_kakahiakaide_injector.load();
    });

    function difference (xs, ys) {
        var xsids = _.map(xs, att("id"));
        var ysids = _.map(ys, att("id"));
        return _.map(_.difference(xsids, ysids), function (id) {
            return _.find(xs, _.compose(_.eq(id), att("id")));
        });
    }
}());
