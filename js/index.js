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
            $("<span>").addClass("transition-pill pill")
                .attr("data-id", t.id)
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
            $("<span>").addClass("dom-listener-pill pill")
                .attr("data-id", l.id)
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


    $("#user-app-iframe").get(0).onload = function () {
        window.ympbyc_kakahiakaide_injector();
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
        if (e.keyCode !== 13 || e.ctrlKey) return;
        exposed.add_transition(app,
                               $transition_name.val(),
                               $transition_args.val(),
                               $transition_body.val());
        [$transition_name, $transition_args, $transition_body].forEach(empty);
        $transition_edit.addClass("hidden");
    });

    $transitions.on("click", ".transition-pill", function (e) {
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


    $undo.click(function () {
        exposed.undo(app);
    });
    $redo.click(function () {
        exposed.redo(app);
    });
    $reload.click(function () {
        $("#user-app-iframe").get(0).contentWindow.location.reload();
    });


    var code_template = _.template($("#code-generation-template").html());

    $(".ide-export-app").click(function () {
        var $p = $("#preview");
        $p.html('<pre><code class="javascript hljs">'
                + code_template(K.deref(app))
                + '</code></pre>');
        hljs.highlightBlock($p.find("pre code").get(0));
    });

    $(".ide-export-project").click(function () {
        var $p = $("#preview");
        $p.html('<pre><code class="javascript hljs">'
                + JSON.stringify(K.deref(app), null, "  ")
                + '</code></pre>');
        hljs.highlightBlock($p.find("pre code").get(0));
    });


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
});



window.kideapp = window.ympbyc_kakahiakaide.app;
window.kide_ex = window.ympbyc_kakahiakaide.exposed;
