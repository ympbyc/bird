(function () {
    var K = window.kakahiaka;

    var tabs = K.app({
        apps: [],
        current_tab: -1
    });


    var add_tab = K.deftransition(function (state, app) {
        if (_.find(state.apps, _.compose(_.eq(app.name), _.flippar(_.at, "app_id"))))
            throw "app exists";
        return { apps: state.apps.concat([app]) };
    });

    $(function () {
        K.watch_transition(tabs, "apps", function (s, os) {
            K.util.dom.render_collection_change(
                s.apps,
                os.apps || [],
                function (app) {
                    return $('<div class="tab box">')
                        .attr("data-app-id", app.app_id)
                        .text(app.app_id);
                },
                $(".tabs"),
                $
            );
        });


        add_tab(tabs, {app_id: "kakahiaka.sample.fruits_machine"});


        $(".new-tab").click(function () {
            var name = window.prompt("Name your app:");
            if (name)
                try {
                    add_tab(tabs, {app_id: name});
                } catch (err) {
                    window.ympbyc_kakahiakaide_notify("An app with the same name exists", '#F7614B');
                }
        });
    });
}());
