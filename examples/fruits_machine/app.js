
window.init_kakahiaka_app = function () {
    var K = window.kakahiaka;

    var user_app = K.app({"fruits":["orange","orange","orange","strawberry","strawberry","orange","strawberry","orange","orange","apple"],"user":{"name":"佐倉千代","icon":"imgs/chiyo.png"}});

    
    var add_fruit = K.deftransition(function (state,f) {
        return { fruits: state.fruits.concat([f]) };
    });
    
    var clear_fruits = K.deftransition(function (state) {
        return {fruits: []}
    });
    
    var login = K.deftransition(function (state,user) {
        var fs = localStorage.getItem("fruits_machine_"+user.name) || "[]";
        return {user: user, 
                fruits: JSON.parse(fs)};
    });
    


    
    K.watch_transition(user_app, "fruits", function (state, old_state) {
        kakahiaka.util.dom.render_collection_change(
          state.fruits, 
          old_state.fruits || [],
          function (item) {
              return $("<div></div>")
                     .addClass(item)
                     .addClass("fruit");
          }, 
          $("#fruits"), $);
        $(".fruits-count").text(state.fruits.length);
        
    }, true);
    
    K.watch_transition(user_app, "user", function (state, old_state) {
        var is_anonymous = state.user.name !== "Anonymous";
        $(".user-icon").attr("src", state.user.icon);
        $(".user-name").text(state.user.name);
        $("#login").toggleClass("hidden", is_anonymous);
        $("#logout").toggleClass("hidden", ! is_anonymous);
    }, true);
    
    K.watch_transition(user_app, "fruits", function (state, old_state) {
        if (state.user.name !== "Anonymous")
          localStorage.setItem(
            "fruits_machine_"+state.user.name,
            JSON.stringify(state.fruits)
          );
        
    }, true);
    


    
    $(document).on("click", "#new-fruit-btn", function (e) {
        add_fruit(user_app, _.sample([
            "apple", "orange", "grape", "strawberry"
        ]));
    });
    
    $(document).on("click", "#no-fruits-btn", function (e) {
        clear_fruits(user_app);
    });
    
    $(document).on("click", "#login", function (e) {
        setTimeout(function () {
          login(user_app, {
            name: "佐倉千代", 
            icon: "imgs/chiyo.png"
          });
        }, 1000);
        $(".user-icon").attr("src", "imgs/loading.gif");
    });
    
    $(document).on("click", "#logout", function (e) {
        setTimeout(function () {
          login(user_app, {
            name:"Anonymous", icon: "imgs/icon-user-default.png"
          }, []);
        }, 1000);
        $(".user-icon").attr("src", "imgs/loading.gif");
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
        inject: function (l) {
            var sc = this.win.document.createElement("script");
            sc.setAttribute("id", l.id);
            sc.src = l.url;
            this.win.document.body.appendChild(sc);
            return sc;
        },
        load: function () {
            this._load();
        },
        _load: function () {
            var l = this.urls.shift();
            if (!l) {
                this.on_last_item_loaded();
                return;
            }
            var el = this.inject(l);
            this.script_els.push(el);
            this._load();
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
    "id": "7d9d47d4-fc57-437d-8dee-45af71dfa024",
    "test": "jQuery",
    "url": "http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"
  },
  {
    "id": "135dd5ab-14e5-4213-8710-70a9fcaf36ae",
    "test": "_",
    "url": "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js"
  },
  {
    "id": "1cc70f9c-aea6-48ac-8e3d-6aeb4ccf1cb4",
    "test": "_",
    "url": "../../bower_components/underscore-fix/underscore-fix.js"
  },
  {
    "id": "8890f1fa-5a41-4a31-8092-5b2e10125b9b",
    "test": "kakahiaka",
    "url": "../../bower_components/kakahiaka/kakahiaka.js"
  },
  {
    "id": "acbc019c-24a2-44a4-ac26-30e616572e89",
    "url": "../../js/utils.js"
  }
])).on_last_item_loaded = window.init_kakahiaka_app;