(function (K) {
    K.util = {};
    K.util.dom = {};
    K.util.dom.render_collection_change = function (coll, old_coll, f, el, $) {
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

        var diff = K.util.difference(coll, old_coll);
        console.info("Rendering "
                     + (diff.inserted.length + diff.removed.length)
                     + " items based on calculated diff: " + JSON.stringify(diff));
        var applied = K.util.apply_difference(diff, old_coll, {
            inserted: function (d) {
                var $new = f(d.item);
                if (children[d.at])
                    $(children[d.at]).before($new);
                else
                    children[d.at] = $new.appendTo($el);

                if (window.ympbyc_kakahiakaide)
                    K.util.setTimeoutTry(function () {
                        window.ympbyc_kakahiakaide.exposed.show_highlight($new, "whatever", 40, 1000, "#45A1CF");
                    }, 600);
            },
            removed: function (d) {
                $(children[d.from]).remove();
                children[d.from] = undefined;
                if (window.ympbyc_kakahiakaide)
                    K.util.setTimeoutTry(function () {
                        window.ympbyc_kakahiakaide.exposed.show_highlight($el, "whatever", 40, 1000, "#45A1CF");
                    }, 600);
            },
            compact: function () {
                children = _.compact(children);
            }
        });
        setTimeout(function () {
            if ( ! _.isEqual(applied, coll))
                throw new Error(
                    "BUG(K.util.render_collection_change) Please report to KakahiakaIDE team : "
                        + JSON.stringify([applied, coll, old_coll], null, "  ")
                );
        }, 0);
    };

    K.util.difference = function (xs, ys) {
        var ws = xs;
        var diff = {
            inserted: [],
            removed:  []
        };
        if (xs.length < ys.length)
            ws = xs.concat(_.range(0, ys.length - xs.length).map(function () {
                return undefined;
            }));

        ws.forEach(function (x, i) {
            if (x !== ys[i]) {
                if (ys[i]) diff.removed.push({from: i, item: ys[i]});
                if (x) diff.inserted.push({at: i, item: x});
            }
        });

        return diff;
    };


    K.util.apply_difference = function (diff, xs, actions) {
        actions = actions || {};
        var zs = _.clone(xs);
        diff.removed.forEach(function (d) {
            zs[d.from] = undefined;
            if (actions.removed)
                actions.removed(d);
        });
        if (actions.compact) actions.compact();
        diff.inserted.forEach(function (d) {
            zs[d.at] = d.item;
            if (actions.inserted)
                actions.inserted(d);
        });
        return _.compact(zs);
    };

    K.util.test_eq = function (x, y) {
        console.log("" + JSON.stringify(x) + " equal " + JSON.stringify(y) + " ? " + _.isEqual(x, y));
    };

    K.util.test_utils = function () {
        var before = ["a","b","c","c"];
        var after  = ["e","c","b","c"];
        return K.util.test_eq(K.util.apply_difference(K.util.difference(after, before), before), after);
    };

    K.util.setTimeoutTry = function (f, time) {
        setTimeout(function () {
            try { f(); } catch (err) {}
        }, time);
    };
}(window.kakahiaka));
