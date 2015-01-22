window.user_app = (function () {
    $(function () {
        $("#preview").on("mouseover", "*", function () {
            //console.log($(this).get(0).className);
        });
    });

    var app = kakahiaka.app({});

    return app;
}());

window.ympbyc_kakahiakaide = (function () {
    var user_app = window.user_app;
    var K = kakahiaka;
    var app = K.app({
        models:        {},
        transitions:   [{
            name: "update",
            args: ["state", "model_key", "model_val"],
            body: "return _.assoc({}, model_key, model_val)"
        }],
        model_watches: [],
        dom_listeners: [],

        selected_model_watch_id: null
    }, persist, recover);
    var exposed = {};

    exposed.add_model = K.deftransition(function (state, key, val) {
        return {models: _.assoc(state.models, key, val)};
    });


    exposed.add_model_watch = K.deftransition(function (state, key, fbody) {
        //add
        if ( ! state.selected_model_watch_id) {
            console.log("add");
            var w = make_model_watch(key, fbody);
            return {model_watches: _.conj(state.model_watches, w)};
        }


        //update
        console.log("update");
        var w = _.find(state.model_watches, function (w) {
            return w.id === state.selected_model_watch_id;
        });
        console.log(JSON.stringify(w));
        w.watch_key  = key;
        w.watch_body = fbody;
        return {model_watches: state.model_watches,
                selected_model_watch_id: null};
    });


    exposed.add_transition = K.deftransition(function (state, name, args, fbody) {
        var t = {
            name: name,
            args: ["state"].concat(args.split(/,\s*/)),
            body: fbody
        };
        return {
            transitions: _.conj(state.transitions, t)
        };
    });


    exposed.add_dom_listener = K.deftransition(function (state, ev, sel, fbody) {
        var l = {event: ev, selector: sel, body:     fbody};
        return {dom_listeners: _.conj(state.dom_listeners, l)};
    });




    K.watch_transition(app, "models", function (s, os) {
        //addition + update
        _.each(_.difference(_.keys(s.models), _.keys(os.models)), function (k) {
            K.simple_update(user_app, k, s.models[k]);
        });
    });


    K.watch_transition(app, "model_watches", function (s, os) {
        _.each(_.difference(s.model_watches, os.model_watches), function (w) {
            var f = new Function("state", "old_state", w.watch_body);
            f.watch_id = w.id;

            var idx = _.map(user_app._watchers[w.watch_key] || [],
                            _.flippar(_.at, "watch_id")).indexOf(w.id);

            if (idx < 0)
                K.watch_transition(user_app, w.watch_key, f, true);

            else {
                //! use of unsupported feature !
                user_app._watchers[w.watch_key][idx] = f;
            }
        });
    });


    K.watch_transition(app, "transitions", function (s, os) {
        _.each(_.difference(s.transitions, (os || {}).transitions), function (t) {
            window[t.name] = K.deftransition(function (state /*args*/) {
                var patch = new Function(t.args, t.body).apply(null, _.toArray(arguments));
                K.simple_update(app, 'models', _.merge(state, patch));
                return patch;
            });
        });
    }, true);


    K.watch_transition(app, "dom_listeners", function (s, os) {
        _.each(_.difference(s.dom_listeners, os.dom_listeners), function (l) {
            $("#preview").on(l.event, l.selector, new Function("e", l.body));
        });
    });


    $(function () {
        var $state_tbody = $(".ide-state-table tbody");
        var $watch_key  = $("#ide-watch-key");
        var $watch_body = $("#ide-watch-body");
        var $model_create = $("#ide-model-create");
        var $model_create_key = $("#ide-model-create-key");
        var $model_create_val = $("#ide-model-create-val");
        var $transitions      = $("#ide-transitions");
        var $transition_name  = $("#ide-transition-name");
        var $transition_args  = $("#ide-transition-args");
        var $transition_body  = $("#ide-transition-body");
        var $dom_listener_ev    = $("#ide-dom-listener-ev");
        var $dom_listener_sel   = $("#ide-dom-listener-sel");
        var $dom_listener_body  = $("#ide-dom-listener-body");
        var $dom_listeners      = $("#ide-dom-listeners");
        var state_row_template  = _.template($("#state-row").html());


        K.watch_transition(app, "selected_model_watch_id", function (s) {
            if ( ! s.selected_model_watch_id) return;
            var w = _.find(s.model_watches, function (w) {
                return w.id === s.selected_model_watch_id; });
            $watch_key.val(w.watch_key);
            $watch_body.val(w.watch_body);
        });


        function update_state_table (s) {
            $state_tbody.html(""); //!optimize
            var i = 0;
            _.each(s.models, function (v, k) {
                $(state_row_template({
                    key: k,
                    val: JSON.stringify(v),
                    listeners: _.filter(s.model_watches, function (w) { return w.watch_key === k; }),
                    row_num: i
                })).appendTo($state_tbody)
                    .find(".state-listener")
                    .on("click", function () {
                        K.simple_update(app, "selected_model_watch_id", $(this).data("id"));
                    });
                ++i;
            });
        }
        K.watch_transition(app, "models", update_state_table);
        K.watch_transition(app, "model_watches", update_state_table);



        //---
        K.watch_transition(app, "transitions", function (s) {
            $transitions.html("");
            _.each(s.transitions, function (t) {
                $("<span>").addClass("transition-pill pill")
                    .text(t.name)
                    .hover(function () {
                        $(this).text(make_signature(t));
                    }, function () {
                        $(this).text(t.name);
                    })
                    .appendTo($transitions);
            });
        }, true);

        K.watch_transition(app, "dom_listeners", function (s) {
            $dom_listeners.html("");
            _.each(s.dom_listeners, function (l) {
                $("<span>").addClass("dom-listener-pill pill")
                    .text(l.selector + "  " + l.event)
                    .appendTo($dom_listeners);
            });
        });
        // -- //



        $($watch_body).on("keydown", function (e) {
            if (e.keyCode !== 13) return;
            var $el = $(this);
            exposed.add_model_watch(app, $watch_key.val(), $el.val());
            $watch_key.val("");
            $el.val("");
        });


        $("#ide-model-add").on("click", function () {
            $model_create.toggleClass("hidden");
            $model_create_key.focus();
        });

        $("#ide-model-create input").on("keydown", function (e) {
            if (e.keyCode !== 13) return;
            exposed.add_model(app, $model_create_key.val(), eval($model_create_val.val()));
            $("#ide-model-create input").val("");
            $model_create.addClass("hidden");
        });


        $($transition_body).on("keydown", function (e) {
            if (e.keyCode !== 13) return;
            exposed.add_transition(app,
                                   $transition_name.val(),
                                   $transition_args.val(),
                                   $transition_body.val());
            [$transition_name, $transition_args, $transition_body].forEach(empty);
        });


        $($dom_listener_body).on("keydown", function (e) {
            if (e.keyCode !== 13) return;
            exposed.add_dom_listener(app,
                                     $dom_listener_ev.val(),
                                     $dom_listener_sel.val(),
                                     $dom_listener_body.val());
            [$dom_listener_ev,
             $dom_listener_sel,
             $dom_listener_body].forEach(empty);
        });
    });





    function make_model_watch (key, fbody) {
        return {
            id:         uuid(),
            watch_key:  key,
            watch_body: fbody
        };
    }

    function uuid () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    function make_signature (transition) {
        return transition.name + "(app, " + transition.args.slice(1).join(", ") + ")";
    }


    function empty ($el) { $el.val(""); }


    function persist (state) {
        localStorage.setItem("ympbyc_kakahiakaide_state", JSON.stringify(state));
    }

    function recover (state) {
        return JSON.parse(localStorage.getItem("ympbyc_kakahiakaide_state") || "{}");
    }

    return {app: app, exposed: exposed};
}());


window.kideapp = window.ympbyc_kakahiakaide.app;
window.kide_ex = window.ympbyc_kakahiakaide.exposed;
