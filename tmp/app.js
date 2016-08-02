
window.init_kakahiaka_app = function () {
    var K = window.kakahiaka;
    var Bird = window.kakahiaka;

    var user_app = Bird.app({"fruits":["orange","grape","grape"],"user":{"name":"Anonymous","icon":"imgs/icon-user-default.png"}});
    var app = user_app;

    
    var update = Bird.deftransition(function (state,model_key,model_val) {
        return _.assoc({}, model_key, model_val)
    });
    
    var add_fruit = Bird.deftransition(function (state,fruit) {
        return { fruits: state.fruits.concat(fruit) };
                    
    });
    
    var login = Bird.deftransition(function (state,user) {
        var fruits = user.name === "Anonymous"
          ? []
          : JSON.parse(localStorage.getItem("fruits-machine-" + user.name) || "[]");
        return {
          user: user,
          fruits: fruits
        };
    });
    


    
    Bird.watch_transition(user_app, "fruits", function (state, old_state) {
        Bird.util.dom.react(
          state.fruits,
          old_state.fruits,
          function (x) { 
            return $('<span class="fruit ' + x  + '"></span>'); 
          },
          $("#fruits")
        );
        
    }, true);
    
    Bird.watch_transition(user_app, "user", function (state, old_state) {
        var logged_in = state.user.name !== "Anonymous";
        $(".user-icon").attr("src", state.user.icon);
        $(".user-name").text(state.user.name);
        $("#login").toggle(!logged_in);
        $("#logout").toggle(logged_in);
    }, true);
    
    Bird.watch_transition(user_app, "fruits", function (state, old_state) {
        if (state.user.name !== "Anonymous")
          localStorage.setItem(
            "fruits-machine-" + state.user.name,
            JSON.stringify(state.fruits)
          );
    }, true);
    
    Bird.watch_transition(user_app, "fruits", function (state, old_state) {
        $(".fruits-count").text(state.fruits.length);
    }, true);
    


    
    $(document).on("click", "#new-fruit-btn", function (e) {
        add_fruit(app, _.sample(["apple", "strawberry", "orange", "grape"]));
    });
    
    $(document).on("click", "#no-fruits-btn", function (e) {
        update(app, "fruits", []);
    });
    
    $(document).on("click", "#login", function (e) {
        $(".user-icon").attr("src", "imgs/loading.gif");
        setTimeout(function () {
          login(app, {
            name: "Mr. Bird",
            icon: "imgs/bird.png"
          });
        }, 1000);
    });
    
    $(document).on("click", "#logout", function (e) {
        $(".user-icon").attr("src", "imgs/loading.gif");
        setTimeout(function () {
          login(app, {
            name: "Anonymous",
            icon: "imgs/icon-user-default.png"
          });
        }, 1000)
    });
    
    $(document).on("click", "#share", function (e) {
        alert("I got " + Bird.deref(app).fruits.length + " fruits!");
    });
    

    return user_app;
};


    (function (win, srcs) {
    var injector = {
        win: win,
        script_els: [],
        urls: [],
        push: function (l) {
            if ( ! this.win.document.getElementById(l.id))
                this.urls.push(l);
        },
        createScriptEl: function (l) {
            var sc = this.win.document.createElement("script");
            sc.setAttribute("id", l.id);
            sc.src = l.url;
            return sc;
        },
        load: function () {
            this._load();
        },
        _load: function () {
            var _this = this;
            var l = this.urls.shift();
            if (!l) {
                this.on_last_item_loaded();
                return;
            }
            var el = this.createScriptEl(l);
            el.onload = el.onreadystatechange = function () {
                if ( ! el.readyState
                     || el.readyState == 'loaded'
                     || el.readyState == 'complete') {
                    _this._load();
                }
            };
            this.win.document.body.appendChild(el);
        },
        on_last_item_loaded: function () {}
    };

    srcs.forEach(function (src) {
        if (! src.test || ! win[src.test])
            injector.push(src);
    });
    injector.load();

    return injector;
}(window, [
  {
    "id": "a4885c53-fb77-4c2e-88db-eb278d5ae898",
    "test": "jQuery",
    "url": "http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"
  },
  {
    "id": "ace15634-aa08-4e2d-bc84-40e3222f92db",
    "test": "_",
    "url": "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js"
  },
  {
    "id": "f6a3a155-daaa-4a65-a704-37aa07047d52",
    "url": "http://proto.pilotz.jp/bird/libs/underscore-fix.js"
  },
  {
    "id": "813d733c-af09-4d11-a025-34e40f5984ec",
    "test": "kakahiaka",
    "url": "http://proto.pilotz.jp/bird/libs/kakahiaka.js"
  },
  {
    "id": "dded18a1-19e3-46b0-863a-0ccca7fe0293",
    "url": "http://proto.pilotz.jp/bird/libs/utils.js"
  }
])).on_last_item_loaded = window.init_kakahiaka_app;