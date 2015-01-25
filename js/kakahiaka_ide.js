window.ympbyc_kakahiakaide = (function () {
    "use strict";

    var app_history = window.app_history;
    var K = kakahiaka;

    var app = K.app({
        models:        {},
        transitions:   [{
            id:   uniqId(),
            name: "update",
            args: ["state", "model_key", "model_val"],
            body: "return _.assoc({}, model_key, model_val)"
        }],
        model_watches: [],
        dom_listeners: [],

        selected_model_watch_id: null,
        selected_transition_id: null,
        selected_dom_listener_id: null
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



    exposed.undo = K.deftransition(function (state) {
        return K.meta(app_history.undo(), {undoing: true});
    });

    exposed.redo = K.deftransition(function (state) {
        return K.meta(app_history.redo(), {undoing: true});
    });

    var refresh_execute = K.deftransition(function (empty_st, st) {
        return {dom_listeners: st.dom_listeners,
                models:        st.models};
    });

    exposed.refresh = K.deftransition(function (state) {
        //! slight violation !
        setTimeout(function () {
            refresh_execute(app, state);
        }, 0);
        return {dom_listeners: [],
                models:        []};
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
        if ( ! state.undoing) app_history.push(state);
        localStorage.setItem("ympbyc_kakahiakaide_state",
                             JSON.stringify(_.pick(state, "models", "transitions",
                                                   "model_watches", "dom_listeners")));
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


    return {app: app, exposed: exposed};
}());
