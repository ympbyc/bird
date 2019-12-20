$(function () {
    if (! window.process || window.process.title !== "node") return;

    var K = window.kakahiaka;
    var app = window.ympbyc_kakahiakaide.app;
    var exposed = window.ympbyc_kakahiakaide.exposed;
    var fs = require("fs");
    var gui = require("nw.gui");
    var win = gui.Window.get();

    gui.App.addOriginAccessWhitelistEntry("~/", "http://localhost/", "file:///", true);

    var nativeMenuBar = new gui.Menu({ type: "menubar" });
    try {
        nativeMenuBar.createMacBuiltin("My App");
        win.menu = nativeMenuBar;
    } catch (ex) {
        console.log(ex.message);
    }

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
	console.log(e);
        K.simple_update(app, "target_html", this.value);
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

    /*
    win.showDevTools('', true);
    win.on("devtools-opened", function(url) {
        console.log(url);
        $("<iframe nodejs></iframe>").attr("src", url)
            .attr("node-remote", "*localhost*")
            .addClass("devtools")
            .appendTo("body");
    });
     */
});
