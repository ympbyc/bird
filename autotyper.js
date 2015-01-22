function Autotype (el, interval) {
    this.$t = $(el).text("");
    this.tmpl = $("#" + this.$t.data("autotyper")).html().split("");
    this.cursor = 0;
    this.interval = interval;
};

Autotype.prototype.step = function () {
    if (this.cursor >= this.tmpl.length)
        this.end();
    else if (this.tmpl[this.cursor] === "#")
        this.wait();
    else
        this.type();
};


Autotype.prototype.type = function () {
    console.log("typing " + this.tmpl[this.cursor]);
    var self = this;
    this.$t.text(this.$t.text() + this.tmpl[this.cursor]);
    this.cursor++;
    setTimeout(function () {
        self.step();
    }, this.interval);
};

Autotype.prototype.wait = function () {
    var self = this;
    this.cursor++;
    var input_type = this.tmpl[this.cursor];
    this.cursor++;
    this.cursor++;

    (input_type === "i"
     ? $('<input class="autotyper-input">')
     : $('<textarea class="autotyper-textarea">'))
        .appendTo(this.$t)
        .focus()
        .on("keydown", function (e) {
            if (e.keyCode !== 13) return;
            self.$t.text(self.$t.text() + $(this).val());
            $(this).remove();
            self.step();
        });
};

Autotype.prototype.end = function () {
    var txt = this.$t.text();
    $("<pre>").html(txt).appendTo(this.$t.html(""));
};
