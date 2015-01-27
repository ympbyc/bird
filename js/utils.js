(function (K) {
    K.util = {};
    K.util.dom = {};
    K.util.dom.commit_collection_change = function (coll, old_coll, f, el, $) {
        var $el = $(el);
        var $children = $(el).children();
        var children  = $children.get();

        if (children.length !== old_coll.length) {
            console.warn("DOM state and app state appears to be inconsistent. Re-rendering everything in the element");
            $el.html("");
            coll.forEach(function (item) {
                $(f(item)).appendTo($el);
            });
            return;
        }


        //todo check here
        var diff = K.util.difference(coll, old_coll);
        var applied = K.util.apply_difference(diff, old_coll, {
            added: function (d) {
                if (children[d.at])
                    $(children[d.at]).replaceWith(f(d.item));
                else
                    $el.appendTo(f(d.item));
            },
            removed: function (d) {
                $(children[d.from]).remove();
            },
            shifted: function (d) {
                $(children[d.to]).replaceWith(f(d.item));
            }
        });
        setTimeout(function () {
            if ( ! _.isEqual(applied, coll))
                throw new Error(
                    "BUG(K.util.commit_collection_change) Please report to KakahiakaIDE team : "
                        + JSON.stringify([applied, coll, old_coll], null, "  ")
                );
        }, 0);
    };


    K.util.difference = function (xs, ys) {
        var diff =  {
            added: [],
            removed: [],
            shifted: []
        };

        xs.forEach(function (x, i) {
            var idx = ys.indexOf(x);
            if (idx < 0)
                diff.added.push({at: i, item: x});
            else if (idx !== i)
                diff.shifted.push({from: idx, to: i, item: x});
        });
        _.difference(ys, xs).forEach(function (y) {
            diff.removed.push({from: ys.indexOf(y), item: y});
        });

        return diff;
    };

    K.util.apply_difference = function (diff, xs, actions) {
        var ys = _.clone(xs);
        diff.removed.forEach(function (d) {
            delete(ys[d.from]);
            if (actions.removed) actions.removed(d.item);
        });
        diff.shifted.forEach(function (d) {
            ys[d.to] = d.item;
            if (actions.shifted) actions.shifted(d.item);
        });
        diff.added.forEach(function (d) {
            ys[d.at] = d.item;
            if (actions.added) actions.added(d.item);
        });
        return ys;
    };
}(window.kakahiaka));
