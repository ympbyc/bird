//dom dependent
//watches ide's state and render it on the dom;
//call transitions based on  user interactions

$(function () {
    var K = kakahiaka;
    var app = window.ympbyc_kakahiakaide.app;
    var exposed = window.ympbyc_kakahiakaide.exposed;


    var $undo = $(".ide-undo");
    var $redo = $(".ide-redo");
    var $reload = $("#btn-user-app-reload");
    var $state_tbody = $(".ide-state-table tbody");
    var $watch_edit = $("#ide-watch-edit");
    var $watch_key  = $("#ide-watch-key");
    var $watch_body = $("#ide-watch-body");
    var $watch_delete = $("#ide-watch-edit .delete-snippet");
    var $model_create = $("#ide-model-create");
    var $model_create_key = $("#ide-model-create-key");
    var $model_create_val = $("#ide-model-create-val");
    var $transitions      = $("#ide-transitions");
    var $transition_edit  = $("#ide-transition-edit");
    var $transition_name  = $("#ide-transition-name");
    var $transition_args  = $("#ide-transition-args");
    var $transition_body  = $("#ide-transition-body");
    var $transition_delete = $("#ide-transition-edit .delete-snippet");
    var $dom_listener_edit  = $("#ide-dom-listener-edit");
    var $dom_listener_ev    = $("#ide-dom-listener-ev");
    var $dom_listener_sel   = $("#ide-dom-listener-sel");
    var $dom_listener_body  = $("#ide-dom-listener-body");
    var $dom_listeners      = $("#ide-dom-listeners");
    var $dom_listener_delete = $("#ide-dom-listener-edit .delete-snippet");
    var $libraries = $("#ide-libraries");
    var state_row_template   = _.template($("#state-row").html());


    K.watch_transition(app, "selected_model_watch_id", function (s) {
        if ( ! s.selected_model_watch_id) {
            $watch_key.attr("disabled", false);
            $watch_delete.addClass("hidden");
            return ;
        }
        show_edit($watch_edit);
        $watch_delete.removeClass("hidden");
        var w = exposed.state_arr_find_selected(s, "model_watch", "es");
        $watch_key.attr("disabled", true);

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
            $("<span>").addClass("transition-pill pill code")
                .attr("data-id", t.id)
                .attr("data-model", "transitions")
                .text(t.name)
                .hover(function () {
                    $(this).text(make_signature(t));
                }, function () {
                    $(this).text(t.name);
                })
                .appendTo($transitions);
        });
        $('<button class="btn-new-transition btn btn-green">+</button>')
            .appendTo($transitions);
    }, true);

    K.watch_transition(app, "selected_transition_id", function (s) {
        if ( ! s.selected_transition_id) {
            $transition_name.attr("disabled", false);
            $transition_delete.addClass("hidden");
            return;
        }
        show_edit($transition_edit);
        $transition_delete.removeClass("hidden");
        var t = exposed.state_arr_find_selected(s, "transition");
        $transition_name.attr("disabled", true).val(t.name);
        $transition_args.val(_.rest(t.args).join(","));
        $transition_body.val(t.body);
    });

    K.watch_transition(app, "dom_listeners", function (s) {
        $dom_listeners.html("");
        _.each(s.dom_listeners, function (l) {
            $("<span>").addClass("dom-listener-pill pill code")
                .attr("data-id", l.id)
                .attr("data-model", "dom_listeners")
                .text(l.selector + "  " + l.event)
                .appendTo($dom_listeners);
        });
        $('<button class="btn-new-dom-listener btn btn-green">+</button>')
            .appendTo($dom_listeners);
    });

    K.watch_transition(app, "selected_dom_listener_id", function (s) {
        if ( ! s.selected_dom_listener_id) {
            $dom_listener_ev.attr("disabled", false);
            $dom_listener_sel.attr("disabled", false);
            $dom_listener_delete.addClass("hidden");
            return;
        }
        show_edit($dom_listener_edit);
        $dom_listener_delete.removeClass("hidden");
        var l = exposed.state_arr_find_selected(s, "dom_listener");
        $dom_listener_ev.attr("disabled", true).val(l.event);
        $dom_listener_sel.attr("disabled", true).val(l.selector);
        $dom_listener_body.val(l.body);
    });
    // -- //


    //libraries
    K.watch_transition(app, "libraries", function (s) {
        $libraries.html("");
        _.each(s.libraries, function (l) {
            $("<li>").html('<a href="'+l.url+'">'+l.url+'</a>'
                           + '<button data-id="'+l.id+'" class="lib-remove icon-bin btn btn-red"></button>').appendTo($libraries);
        });
    });


    $("#user-app-iframe").get(0).onload = function () {
        //window.ympbyc_kakahiakaide_inject();
        exposed.refresh(app);
    };


    $($watch_body).on("keydown", function (e) {
        if (e.keyCode !== 13 || e.ctrlKey) return;
        var $el = $(this);
        exposed.add_model_watch(app, $watch_key.val(), $el.val());
        $watch_key.val("");
        $el.val("");
        $watch_edit.addClass("hidden");
    });


    $("#ide-model-add").on("click", function () {
        toggle_edit($model_create);
        $model_create_key.focus();
    });

    $("#ide-model-create input").on("keydown", function (e) {
        if (e.keyCode !== 13 || e.ctrlKey) return;
        exposed.add_model(app, $model_create_key.val(), eval("("+$model_create_val.val()+")"));
        $("#ide-model-create input").val("");
        $model_create.addClass("hidden");
    });


    //edit model
    $state_tbody.on("click", ".state-val", function () {
        var $this = $(this);
        $this.parent().addClass("hidden");
        $model_create.removeClass("hidden");
        $model_create_val.val($this.text());
        $model_create_key.val($this.parent().find(".state-key").text());
    });

    $state_tbody.on("click", ".btn-new-watch", function () {
        $watch_key.val($(this).parent().siblings(".state-key").text());
        $watch_edit.toggleClass("hidden");
    });

    $transition_body.on("keydown", function (e) {
        if (e.keyCode !== 13 ) return;

        exposed.add_transition(app,
                               $transition_name.val(),
                               $transition_args.val(),
                               $transition_body.val());
        [$transition_name, $transition_args, $transition_body].forEach(empty);
        $transition_edit.addClass("hidden");
    });

    $transitions.on("click", ".transition-pill", function (e) {
        e.preventDefault();
        K.simple_update(app, "selected_transition_id", $(this).data("id"));
    });

    $transitions.on("click", ".btn-new-transition", function () {
        toggle_edit($transition_edit);
    });


    $dom_listener_body.on("keydown", function (e) {
        if (e.keyCode !== 13 || e.ctrlKey) return;
        exposed.add_dom_listener(app,
                                 $dom_listener_ev.val(),
                                 $dom_listener_sel.val(),
                                 $dom_listener_body.val());
        [$dom_listener_ev,
         $dom_listener_sel,
         $dom_listener_body].forEach(empty);
        $dom_listener_edit.addClass("hidden");
    });

    $dom_listeners.on("click", ".dom-listener-pill", function (e) {
        e.preventDefault();
        K.simple_update(app, "selected_dom_listener_id", $(this).data("id"));
    });

    $dom_listeners.on("click", ".btn-new-dom-listener", function () {
        toggle_edit($dom_listener_edit);
    });


    //delete buttons
    $watch_delete.click(function () {
        exposed.remove_selected_code(app, "model_watch", "es");
        [$watch_key, $watch_body].forEach(empty);
        $watch_edit.addClass("hidden");
    });

    $transition_delete.click(function () {
        exposed.remove_selected_code(app, "transition");
        [$transition_name, $transition_args, $transition_body].forEach(empty);
        $transition_edit.addClass("hidden");
    });

    $dom_listener_delete.click(function () {
        exposed.remove_selected_code(app, "dom_listener");
        [$dom_listener_ev,
         $dom_listener_sel,
         $dom_listener_body].forEach(empty);
        $dom_listener_edit.addClass("hidden");
    });

    $("#ide-new-library").on("keydown", function (e) {
        if (e.keyCode !== 13) return;
        exposed.add_library(app, $(this).val());
        $(this).val("");
    });

    $libraries.on("click", ".lib-remove", function () {
        exposed.remove_library(app, $(this).data("id"));
    });

    $("#ide").on("mouseover", ".pill,.ball", function (e) {
        var $this = $(this);
        var id = $this.data("id");
        var model = $this.data("model");
        var code;
        if (model)
            code = to_code(_.find(K.deref(app)[model],
                                  _.compose(_.eq(id), _.flippar(_.at, "id"))),
                           model);
        else code = window[$this.text()].toString();
        code_preview(code, true, $this);
    }).on("mouseout", ".pill", function () {
        code_preview("", false);
    });

    /*
    $(".pill-wrapper").on("click", ".pill", function (e) {
        var $focused = $("input:focus,textarea:focus");
        var focused = $focused.get(0);
        if ( ! focused) return true;
        var pos = focused.selectionStart;
        var txt = $focused.val();
        var pill_txt = $(this).text();
        console.log(pos);
        $focused.val("");
        $focused.val(txt.substr(0,pos) + pill_txt + txt.substr(pos));
        if (focused.setSelectionRange)
            focused.setSelectionRange(pos + pill_txt.length, pos + pill_txt.length);
        return false;
    });
     */

    $undo.click(function () {
        exposed.undo(app);
    });
    $redo.click(function () {
        exposed.redo(app);
    });
    $reload.click(function () {
        var cur_src = $("#user-app-iframe").attr("src");
        var new_src = $("#user-app-html-href").val();
        if (cur_src !== new_src)
            $("#user-app-iframe").attr("src", new_src);
        else
            $("#user-app-iframe").get(0).contentWindow.location.reload();
    });


    _.chain(window).keys()
        .reject(function (x) {
            return _.contains(window.__default_window_properties, x);
        })
        .without("__default_window_properties", "ympbyc_kakahiakaide_inject",
                 "ympbyc_kakahiakaide_inject_", "app_history", "kideapp", "kide_ex")
        .each(function (x) {
            var $el = $("<span>")
                .text(x)
                .addClass("pill code")
                .appendTo("#ide-other-objects");
            if (_.contains(["kakahiaka", "user_app",
                            "$", "jQuery", "_"], x))
                $el.addClass("pill-blue");
            else
                $el.addClass("transcluent");
        });


    var code_template = _.template($("#code-generation-template").html());

    $(".ide-export-app").click(function () {
        code_preview(code_template(K.deref(app))
                     + "("
                     + window.ympbyc_kakahiakaide_inject_.toString()
                     + "(window, "
                     + JSON.stringify(K.deref(app).libraries, null, "  ")
                     + ")).on_last_item_loaded = window.init_kakahiaka_app;",
                    true);
    });

    $(".ide-export-project").click(function () {
        code_preview('<pre><code class="javascript hljs">'
                     + JSON.stringify(K.deref(app), null, "  ")
                     + '</code></pre>',
                    true);
    });

    var code_gens = {
        transitions: function (item) {
            return "var " + item.name + " = K.deftransition(function ("
                + item.args.join(",") + ") {"
                + "\n    " + item.body.replace(/\n/g, "\n    ") + "\n});";
        },
        model_watches: function (item) {
            return "K.watch_transition(user_app, '" + item.watch_key + "', function (state, old_state) {"
                + "\n    " + item.watch_body.replace(/\n/g, "\n    ") + "\n});";
        },
        dom_listeners: function (item) {
            return "$(document).on('" + item.event + "', '" + item.selector + "', function (e) {"
                + "\n    " +  item.body.replace(/\n/g, "\n    ") + "\n});";
        }
    };

    function to_code (item, model) {
        return code_gens[model](item);
    }

    function code_preview (code, toggle, $el) {
        var $p = $("#ide-code-preview");
        $p.html('<code class="javascript hljs">' + code + '</pre>').toggleClass("hidden", ! toggle);
        hljs.highlightBlock($p.find("code").get(0));
        $("#preview-overlay").toggleClass("hidden", !toggle);

        if (! $el) {
            $p.css({top: 0, width: "100%"});
            return;
        }
        $p.css({top: $el.offset().top - 50, width: "60%"});
    }

    function make_signature (transition) {
        return transition.name + "(app, " + transition.args.slice(1).join(", ") + ")";
    }

    function empty ($el) { $el.val(""); }

    function toggle_edit ($edit) {
        $edit.toggleClass("hidden");
        setTimeout(function () {
            $edit.find("input:enabled,textarea:enabled").get(0).focus();
        }, 0);
    }
    function show_edit ($edit) {
        $edit.removeClass("hidden");
        setTimeout(function () {
            $edit.find("input:enabled,textarea:enabled").get(0).focus();
        }, 0);
    }

    function insert_textarea ($ta, in_txt) {
        var $focused = $ta || $("input:focus,textarea:focus");
        var focused = $focused.get(0);
        if ( ! focused) return true;
        var pos = focused.selectionStart;
        var txt = $focused.val();
        $focused.val(txt.substr(0,pos) + in_txt + txt.substr(pos));
        if (focused.setSelectionRange)
            focused.setSelectionRange(pos + in_txt.length, pos + in_txt.length);
        return false;
    }
});



window.kideapp = window.ympbyc_kakahiakaide.app;
window.kide_ex = window.ympbyc_kakahiakaide.exposed;
