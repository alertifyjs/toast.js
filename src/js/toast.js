(function(window, document) {

    function whichTransitionEvent(){
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
            'transition':'transitionend',
            'OTransition':'oTransitionEnd',
            'MozTransition':'transitionend',
            'WebkitTransition':'webkitTransitionEnd'
        };

        for(t in transitions){
            if(transitions.hasOwnProperty(t)) {
                if( el.style[t] !== undefined ){
                    return transitions[t];
                }
            }
        }
    }

    var transitionend = whichTransitionEvent();

    var Toast = function(position) {

        this.attributes = {
            duration: 5000,
            position:  position ? position.split(" ") : ["bottom"],
            msg: "",
            msgClass: "toast-content",
            okLabel: "",
            okClass: "toast-ok",
            cancelLabel: "",
            cancelClass: "toast-cancel",
            timeoutAction: "reject",
            clickAction: "resolve",
            transition: "fade"
        };

        this.template = "";
        this.templates = {
            basic: "<span class='{{ msgClass }}'>{{ msg }}</span>",
            dialog:
                "<span class='{{ msgClass }}'>{{ msg }}</span>" +
                "<a class='{{ okClass }}'>{{ okLabel }}</a>" +
                "<a class='{{ cancelClass }}'>{{ cancelLabel }}</a>",
            alert:
                "<a class='{{ msgClass }}'>{{ msg }}</a>" +
                "<a class='{{ okClass }}'>{{ okLabel }}</a>",
            undo:
                "<a class='{{ msgClass }}'>{{ msg }}</a>" +
                "<a class='{{ cancelClass }}'>{{ cancelLabel }}</a>"
        };

    };

    Toast.prototype.position = function(position) {
        this.attributes.postion = Array.isArray(position) ?
            position : position.split(" ");
        return this;
    }

    Toast.prototype.handleTimeout = function(resolve, reject) {

        var self = this;

        if(parseInt(self.attributes.duration) > 0) {
            setTimeout(function() {
                if(self.attributes.timeoutAction === "reject") {
                    reject("timeout");
                } else {
                    resolve("timeout");
                }
                self.remove();
            }, self.attributes.duration);
        }

    };

    Toast.prototype.duration = function(duration) {
        this.attributes.duration = parseInt(duration);
        return this;
    };

    Toast.prototype.rejectOnTimeout = function() {
        this.attributes.timeoutAction = "reject";
        return this;
    };

    Toast.prototype.resolveOnTimeout = function() {
        this.attributes.timeoutAction = "resolve";
        return this;
    };

    Toast.prototype.getTemplate = function() {

        if (!! this.template) {
            return this.template;
        }

        if (!! this.attributes.okLabel && !! this.attributes.cancelLabel) {
            return this.template = this.templates.dialog;
        }

        if (!! this.attributes.okLabel) {
            return this.template = this.templates.alert;
        }

        if (!! this.attributes.cancelLabel) {
            return this.template = this.templates.undo;
        }

        return this.template = this.templates.basic;

    };

    Toast.prototype.template = function(template) {
        this.template = template;
        return this;
    };

    Toast.prototype.parse = function() {

        var str = this.getTemplate();
        for(var k in this.attributes) {
            if(this.attributes.hasOwnProperty(k)) {
                str = str.replace(new RegExp("{{ " + k + " " +
                    "}}", "gi"), this.attributes[k]);
            }
        }

        return str;

    };

    Toast.prototype.hide = function() {
        this.remove();
    };

    Toast.prototype.show = function(text) {

        var self = this;
        self.attributes.msg = text;

        // Remove all previous elements first.
        var previous = document.querySelectorAll(".alertify.toast");
        for(var i = 0; i < previous.length; i++) {

            var item = previous.item(i);
            item.classList.add("hide");
            item.classList.add(self.attributes.transition);

        }

        var promise = new Promise(function(resolve, reject) {

            self.main();

            var okayBtn = self.element.querySelector("." + self.attributes.okClass);
            if(okayBtn) {
                okayBtn.addEventListener("click", function(e) {
                    self.hide();
                    resolve(e);
                });
            }

            var cancelBtn = self.element.querySelector("." + self.attributes.cancelClass);
            if(cancelBtn) {
                cancelBtn.addEventListener("click", function(e) {
                    self.hide();
                    reject(e);
                });
            }

            if (! okayBtn && ! cancelBtn) {

                self.element.addEventListener("click", function(e) {

                    if(self.attributes.clickAction === "resolve") {
                        resolve(e);
                    } else {
                        reject(e);
                    }

                    self.hide();

                });

            }

            // okay or cancel button timeout.
            self.handleTimeout(resolve, reject);

        });

        window.promise = promise;

        return promise;

    };

    Toast.prototype.duration = function(duration) {
        this.attributes.duration = parseInt(duration);
        return this;
    };

    Toast.prototype.remove = function() {

        var self = this;

        if (!! this.element) {

            this.element.addEventListener(transitionend, function() {
                console.log("transitionDone");
                document.body.removeChild(self.element);
            });

            this.element.classList.add("hide");


        }
    };

    Toast.prototype.transition = function(transition) {
        this.attributes.transition = transition || "fade";
        return this;
    };

    Toast.prototype.create = function() {

        // Create an empty element.
        this.element = document.createElement("div");
        this.element.classList.add("alertify");
        this.element.classList.add("toast");
        this.element.classList.add("hide");
        this.element.classList.add(this.attributes.transition);

        for(var i = 0; i < this.attributes.position.length; i++) {
            this.element.classList.add(this.attributes.position[i]);
        }

        // Parse the HTML.
        this.element.innerHTML = this.parse();

        // All done, add to DOM.
        document.body.appendChild(this.element);

    };

    Toast.prototype.unHide = function() {

        var self = this;
        var onShow = function() {
            console.log("shown");
            self.element.removeEventListener(transitionend, this);
        };

        this.element.classList.remove("hide");
        this.element.addEventListener(transitionend, onShow);

    };

    Toast.prototype.main = function() {
        this.create();
        this.unHide();
    };

    Toast.prototype.content = function(text) {
        this.attributes.msg = text;
        return this;
    };

    Toast.prototype.ok = function(okLabel) {
        this.attributes.okLabel = okLabel || "Ok";
        return this;
    };

    Toast.prototype.cancel = function(cancelLabel) {
        this.attributes.cancel = cancelLabel || "Cancel";
        return this;
    };

    // Insert the style sheet here.
    Toast.prototype.sheet = (function() {

        var style = document.createElement("style");
        style.appendChild(document.createTextNode("@@style"));
        document.head.appendChild(style);

        return style.sheet;

    }());

    window.Toast = Toast;

}(window, document));
