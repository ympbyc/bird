$(function () {
    if (! window.process || window.process.title !== "node") return;

    var K = window.kakahiaka;
    var app = window.ympbyc_kakahiakaide.app;
    var exposed = window.ympbyc_kakahiakaide.exposed;
    var fs = require("fs");
    var gui = require("nw.gui");

    gui.App.addOriginAccessWhitelistEntry("~/", "http://localhost/", "file:///", true);

    function write_file (name, str) {
        fs.writeFile(name, str, function () {
            window.ympbyc_kakahiakaide_notify(
                'Done generating your file. '
                    + '<a download href="'+name+'" class="btn btn-blue">DOWNLOAD</a>',
                "#F9DB57", "#3c3c3c", true);
        });
    }

    $(".ide-export-app").click(function () {
        var name = "./tmp/app.js";
        write_file(name, exposed.generate_app());
    });

    $(".ide-export-project").click(function () {
        var name = "./tmp/app.json";
        write_file(name, JSON.stringify(K.deref(app), null, "  "));
    });


    $("#btn-user-app-reload").removeClass("hidden").on("change", function (e) {
        var cur_src = $("#user-app-iframe").attr("src");
        var new_src = this.value;
        if (cur_src !== new_src) {
            $("#user-app-iframe").attr("src", new_src);
            $("#user-app-html-href").val(new_src);
        } else
            exposed.user_app_context().location.reload();

        return false;
    });

    $(".ide-import-project").removeClass("hidden").on("click", function () {
        $("#project-import-file").click();
    });

    $("#project-import-file").on("change", function () {
        var path = this.value;
        fs.readFile(path, {encoding: "utf8"}, function (err, data) {
            if (err) throw err;
            exposed.swap_entire_state(app, JSON.parse(data));
        });
    });

    $("<button>DEVTOOLS</button>").addClass("btn btn-blue").appendTo(".nav-left-control")
        .on("click", function () {
            gui.Window.get().showDevTools();
        });
});
