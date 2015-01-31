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
        console.info("Rendering " + diff.num_changes + " items based on calculated diff: " + JSON.stringify(diff));
        var applied = K.util.apply_difference(diff, old_coll, {
            added: function (d) {
                if (children[d.at])
                    $(children[d.at]).replaceWith(f(d.item));
                else
                    children[d.at] = f(d.item).appendTo($el);
            },
            removed: function (d) {
                $(children[d.from]).remove();
            },
            shifted: function (d) {
                if (children[d.to])
                    $(children[d.to]).replaceWith(f(d.item));
                //else
                //    children[d.at] = f(d.item).appendTo($el);
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
        if (_.uniq(ys).length !== ys.length
           || _.uniq(xs).length !== xs.length)
            return K.util.difference_complicated(xs, ys);
        return K.util.difference_simple(xs, ys);
    };


    K.util.difference_simple = function (xs, ys) {
        //works iff contents of ys are all different
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

        diff.num_changes = diff.added.length + diff.removed.length + diff.shifted.length;

        return diff;
    };


    //f*ckin expensive :(
    K.util.difference_complicated = function (xs, ys) {
        var diff =  {
            added: [],
            removed: [],
            shifted: []
        };

        //[[v, [i, j, ...]]]
        var xindexes = K.util.indexes(xs);
        var yindexes = K.util.indexes(ys);
        xs.forEach(function (x, i) {
            var idx = _.find(yindexes, function (idx) { return idx[0] === x; });
            if ( ! idx || _.last(idx[1]) < i )
                diff.added.push({at: i, item: x});
            else
                idx[1].forEach(function (prevI) {
                    if (prevI !== i)
                        diff.shifted.push({from: prevI, to: i, item: x});
                });
        });
        ys.forEach(function (y, i) {
            var idx = _.find(xindexes, function (idx) { return idx[0] === y; });
            if ( ! idx)
                diff.removed.push({from: i, item: y});
        });
        diff.shifted = _.chain(diff.shifted)
            .uniq(function (d) { return d.to; })
            .uniq(function (d) { return d.from; })
            .value();
        diff.shifted = _.filter(diff.shifted, function (d) {
            return ! _.find(diff.shifted, function (e) {
                return e.item === d.item
                    && e.to   === d.from
                    && e.from === d.to;
            });
        });

        diff.num_changes = diff.added.length + diff.removed.length + diff.shifted.length;

        return diff;
    };

    K.util.indexes = function (xs) {
        return xs.reduce(function (idxs, y, i) {
            var idx = _.find(idxs, function (idx) { return idx[0] === y; });
            if (idx) idx[1].push(i);
            else idxs.push([y, [i]]);
            return idxs;
        }, []);
    };

    K.util.apply_difference = function (diff, xs, actions) {
        actions = actions || {};
        var ys = _.clone(xs);
        diff.removed.forEach(function (d) {
            delete(ys[d.from]);
            if (actions.removed) actions.removed(d);
        });
        diff.shifted.forEach(function (d) {
            ys[d.to] = d.item;
            if (actions.shifted) actions.shifted(d);
        });
        diff.added.forEach(function (d) {
            ys[d.at] = d.item;
            if (actions.added) actions.added(d);
        });
        return _.compact(ys);
    };

    K.util.test_eq = function (x, y) {
        console.log("" + JSON.stringify(x) + " equal " + JSON.stringify(y) + " ? " + _.isEqual(x, y));
    };

    K.util.test_utils = function () {
        var before = ["a","b","c","c"];
        var after  = ["e","c","b","c"];
        return K.util.test_eq(K.util.apply_difference(K.util.difference(after, before), before), after);
    };
}(window.kakahiaka));
