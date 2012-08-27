// Generated by CoffeeScript 1.3.3
(function() {
  var Animation, Animator;

  (function() {
    var lastTime, vendor, vendors, _i, _len;
    if (window.requestAnimationFrame) {
      return;
    }
    lastTime = 0;
    vendors = ["ms", "moz", "webkit", "o"];
    for (_i = 0, _len = vendors.length; _i < _len; _i++) {
      vendor = vendors[_i];
      if (window.requestAnimationFrame != null) {
        break;
      }
      window.requestAnimationFrame = window["" + vendor + "RequestAnimationFrame"];
      window.cancelAnimationFrame = window["" + vendor + "CancelAnimationFrame"] || window["" + vendor + "CancelRequestAnimationFrame"];
    }
    if (!(window.requestAnimationFrame != null)) {
      window.requestAnimationFrame = function(callback, element) {
        var curTime, id, timeToCall;
        curTime = new Date().getTime();
        timeToCall = Math.max(0, 16 - (curTime - lastTime));
        id = window.setTimeout(function() {
          return callback(curTime + timeToCall);
        }, timeToCall);
        lastTime = curTime + timeToCall;
        return id;
      };
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        return clearTimeout(id);
      };
    }
    return null;
  })();

  Animation = (function() {

    Animation.prototype.curFrame = 0;

    Animation.prototype.lastFrame = 0;

    Animation.prototype.ready = false;

    function Animation(canvasContext, time) {
      this.canvasContext = canvasContext;
      this.time = time;
      this.startTime = Date.now();
      this.lastFrame = 0;
    }

    Animation.prototype.onready = function(fn) {
      return this.readyFn = fn;
    };

    Animation.prototype.ready = function(index, img) {
      this.index = index;
      this.img = img;
      this.frameCount = this.index.frames.length;
      this.frameDelay = this.time * 1000 / this.frameCount;
      this.ready = true;
      if (this.readyFn != null) {
        return this.readyFn();
      }
    };

    Animation.prototype.draw = function(now) {
      var curFrame, tile, timePassed;
      if (now == null) {
        now = Date.now();
      }
      if (this.ready !== true) {
        return;
      }
      timePassed = Math.floor((now - this.startTime) / this.frameDelay);
      curFrame = timePassed % this.frameCount;
      if (curFrame === this.lastFrame) {
        return;
      }
      this.lastFrame = curFrame;
      tile = this.index.frames[curFrame];
      this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
      this.canvasContext.drawImage(this.img, tile.frame.x, tile.frame.y, tile.frame.w, tile.frame.h, 0, 0, tile.frame.w, tile.frame.h);
      return null;
    };

    return Animation;

  })();

  Animator = (function() {

    function Animator() {
      var animateFn,
        _this = this;
      this.queue = [];
      animateFn = function(now) {
        var animation, _i, _len, _ref;
        _ref = _this.queue;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          animation = _ref[_i];
          animation.draw(now);
        }
        return window.requestAnimationFrame(animateFn);
      };
      window.requestAnimationFrame(animateFn);
    }

    Animator.prototype.init = function() {
      var element, elements, index, sprites, time, _i, _len, _results;
      elements = document.querySelectorAll("canvas.Animator");
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        index = element.getAttribute("data-index");
        sprites = element.getAttribute("data-sprites");
        time = parseFloat(element.getAttribute("data-time"));
        _results.push(this.add(element, index, sprites, time));
      }
      return _results;
    };

    Animator.prototype.add = function(element, jsonIndex, spriteImg, time) {
      var animation, ctx, img, jXHR;
      if (element.animation != null) {
        return;
      }
      ctx = element.getContext("2d");
      animation = new Animation(ctx, time);
      jXHR = new XMLHttpRequest;
      jXHR.open("GET", jsonIndex, true);
      jXHR.send(null);
      jXHR.onreadystatechange = function(event) {
        var index, t;
        t = event.currentTarget;
        if (t.readyState !== 4) {
          return;
        }
        index = JSON.parse(t.responseText);
        if (typeof img !== "undefined" && img !== null) {
          return animation.ready(index, img);
        }
      };
      img = new Image;
      img.src = spriteImg;
      img.onload = function() {
        if (typeof index !== "undefined" && index !== null) {
          return animation.ready(index, img);
        }
      };
      element.animation = animation;
      this.queue.push(animation);
      return animation;
    };

    Animator.prototype.stop = function(id) {};

    return Animator;

  })();

  window.Animator = new Animator;

}).call(this);