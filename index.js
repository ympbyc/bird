$(function () {
    _.each(_.range(1,4), function (i) {
        $(_.template($("#state-row").html(), {
            key: "ranking",
            val: "[{}]",
            listeners: _.range(i),
            row_num: i
        })).appendTo(".ide-state-table tbody");
    });

    $(".ide").on("click", ".state-listener", function () {
        $(".ide-watcher-edit-wrap").removeClass("hidden");
    });

    $(".ide").on("keydown", ".ide-watcher-edit", function (e) {
        if (e.keyCode === 13)
            $(".ide-watcher-edit-wrap").addClass("hidden");
    });
});
