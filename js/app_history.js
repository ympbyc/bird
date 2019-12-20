window.app_history = {
    index: -1,
    hist:  [],
    push: function (x) {
        this.index++;
        this.hist = this.hist.slice(0, this.index);
        this.hist.push(x);
    },
    undo: function () {
        return this.hist[this.index-- - 1];
    },
    redo: function () {
        return this.hist[this.index++ + 1];
    }
};
