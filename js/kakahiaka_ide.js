window.ympbyc_kakahiakaide = (function () {
    "use strict";

    var app_history = window.app_history;
    var K = kakahiaka;

    var app = K.app({
        app_id:        "kakahiaka_ide.sample.fruits_machine",
        models:        {},
        transitions:   [{
            id:   uniqId(),
            name: "update",
            args: ["state", "model_key", "model_val"],
            body: "return _.assoc({}, model_key, model_val)"
        }],
        model_watches: [],
        dom_listeners: [],
        libraries: [
            {id:   uniqId(),
             test: "jQuery",
             url:  "http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"},
            {id:   uniqId(),
             test: "_",
             url:  "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js"},
            {id:   uniqId(),
             test: "_",
             url:  "../../bower_components/underscore-fix/underscore-fix.js"},
            {id:   uniqId(),
             test: "kakahiaka",
             url:  "../../bower_components/kakahiaka/kakahiaka.js"}
        ],
        target_html: "examples/fruits_machine/index.html",

        selected_model_watch_id: null,
        selected_transition_id: null,
        selected_dom_listener_id: null,
        theme: "theme-hidamari"
    }, persist, recover);

    var exposed = {};

    exposed.add_model = K.deftransition(function (state, key, val) {
        return {models: _.assoc(state.models, key, val)};
    });

    //called when user_app changes its state
    exposed.notify_child_model_change = K.deftransition(function (state, new_models) {
        return K.meta({models: new_models}, {no_propagation_to_child: true});
    });


    exposed.add_model_watch = K.deftransition(function (state, key, fbody) {
        //add
        if ( ! state.selected_model_watch_id) {
            var w = make_model_watch(key, fbody);
            return {model_watches: _.conj(state.model_watches, w)};
        }


        //update
        return { model_watches: state_arr_patch_matching(state, "model_watch",
                                                         {watch_body: fbody}, "es"),
                 selected_model_watch_id: null};
    });


    exposed.add_transition = K.deftransition(function (state, name, args, fbody) {
        var ags = ["state"].concat(args.split(/,\s*/).filter(_.identity));
        if ( ! state.selected_transition_id)
            return {transitions: _.conj(state.transitions, {
                id: uniqId(),
                name: name,
                args: ags,
                body: fbody
            })};

        return { transitions:
                 state_arr_patch_matching(state, "transition", {body: fbody, args: ags}),
                 selected_transition_id: null };
    });


    exposed.add_dom_listener = K.deftransition(function (state, ev, sel, fbody) {
        if ( ! state.selected_dom_listener_id)
            return {dom_listeners: _.conj(state.dom_listeners,
                                          {id: uniqId(), event: ev, selector: sel, body: fbody})};

        return { dom_listeners:
                 state_arr_patch_matching(state, "dom_listener", {body: fbody}),
                 selected_dom_listener_id: null };
    });


    exposed.remove_selected_code = K.deftransition(function (state, name, plural) {
        var arr_name = name + (plural || "s");
        return _.assoc({}, arr_name, _.reject(state[arr_name], function (x) {
            return x.id === state["selected_"+name+"_id"];
        }), "selected_"+name+"_id", null);
    });

    exposed.add_library = K.deftransition(function (state, url) {
        return {libraries: state.libraries.concat({
            id:  uniqId(),
            url: url
        }) };
    });

    exposed.remove_library = K.deftransition(function (state, id) {
        return {libraries: _.reject(state.libraries, _.compose(_.eq(id), _.flippar(_.at, "id"))) };
    });


    exposed.undo = K.deftransition(function (state) {
        return K.meta(app_history.undo(), {undoing: true});
    });

    exposed.redo = K.deftransition(function (state) {
        return K.meta(app_history.redo(), {undoing: true});
    });

    var refresh_execute = K.deftransition(function (empty_st, st) {
        return K.meta({dom_listeners: st.dom_listeners,
                       models:        st.models,
                       libraries:     st.libraries}, {refreshed: true});
    });

    exposed.refresh = K.deftransition(function (state) {
        //! slight violation !
        setTimeout(function () {
            refresh_execute(app, state);
        }, 0);
        return K.meta({dom_listeners: [],
                       models:        {},
                       libraries:     []},
                      {refreshing: true});
    });

    exposed.swap_entire_state = K.deftransition(function (state, newstate) {
        return newstate;
    });

    function make_model_watch (key, fbody) {
        return {
            id:         uniqId(),
            watch_key:  key,
            watch_body: fbody
        };
    }

    function uniqId () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    function persist (state) {
        if (state.refreshing) return;
        var data = _.pick(state, "models", "transitions", "theme",
                          "model_watches", "dom_listeners", "libraries");
        if ( ! state.undoing)
            app_history.push(data);
        localStorage.setItem("ympbyc_kakahiakaide_state",
                             JSON.stringify(data));

        //shouldn't be here
        $(".ide-undo").attr("disabled", app_history.index < 1);
        $(".ide-redo").attr("disabled", window.app_history.hist.length <= window.app_history.index + 1);
    }

    function recover (state) {
        return JSON.parse(localStorage.getItem("ympbyc_kakahiakaide_state") || "{}");
    }


    exposed.format_body = function format_body (body) {
        return body.split(/\n/).map(function (line, i) {
            if (i === 0) return line;
            return "        " + line;
        }).join("\n");
    };

    function state_arr_patch_matching (state, type, patch, plural) {
        return _.update_many(state[type + (plural || "s")], function (x) {
            return x.id === state["selected_"+type+"_id"];
        }, patch, _.merge);
    }



    function state_arr_find_selected (state, type, plural) {
        var k = "selected_"+type+"_id";
        return _.find(state[type+(plural || "s")], function (x) {
        return x.id === state[k];
        });
    }
    exposed.state_arr_find_selected = state_arr_find_selected;

    exposed.user_app_context = function user_app_context () {
        return document.getElementById('user-app-iframe').contentWindow;
    };

    return {app: app, exposed: exposed};
}());
