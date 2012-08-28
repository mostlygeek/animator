// Generated by CoffeeScript 1.3.3

/*
# v0.0.1
# Copyright Futdut Games, Inc 2012
*/


(function() {
  var Animation, Animator, _ref;

  if ((_ref = window.ready) == null) {
    window.ready = function(fn) {
      var check, fire;
      fire = function() {
        if (!window.ready.fired) {
          window.ready.fired = true;
          return fn();
        }
      };
      if (document.readyState === "complete") {
        return fire();
      }
      if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", fire, false);
        return window.addEventListener("load", fire, false);
      } else if (document.attachEvent) {
        check = function() {
          try {
            document.documentElement.doScroll("left");
          } catch (e) {
            setTimeout(check, 50);
            return;
          }
          return fire();
        };
        document.attachEvent("onreadystatechange", fire);
        window.attachEvent("onload", fire);
        if (document.documentElement && document.documentElement.doScroll && !window.frameElement) {
          return check();
        }
      }
    };
  }

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

    function Animation(canvasContext, time, offsetX, offsetY) {
      this.canvasContext = canvasContext;
      this.time = time;
      this.offsetX = offsetX;
      this.offsetY = offsetY;
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
      var curFrame, sSize, tile, timePassed;
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
      sSize = tile.spriteSourceSize;
      this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
      this.canvasContext.drawImage(this.img, tile.frame.x, tile.frame.y, tile.frame.w, tile.frame.h, this.offsetX + sSize.x, this.offsetY + sSize.y, tile.frame.w, tile.frame.h);
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
        var animation, _i, _len, _ref1;
        _ref1 = _this.queue;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          animation = _ref1[_i];
          animation.draw(now);
        }
        return window.requestAnimationFrame(animateFn);
      };
      window.requestAnimationFrame(animateFn);
    }

    Animator.prototype.init = function() {
      var dataX, dataY, el, elements, index, offsetX, offsetY, sprites, time, _i, _len, _results;
      elements = document.querySelectorAll("canvas.Animator");
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        el = elements[_i];
        index = el.getAttribute("data-index");
        sprites = el.getAttribute("data-sprites");
        time = parseFloat(el.getAttribute("data-time"));
        dataX = el.getAttribute("data-x");
        dataY = el.getAttribute("data-y");
        offsetX = dataX != null ? parseInt(dataX) : 0;
        offsetY = dataY != null ? parseInt(dataY) : 0;
        _results.push(this.add(el, index, sprites, time, offsetX, offsetY));
      }
      return _results;
    };

    Animator.prototype.add = function(element, jsonIndex, spriteImg, time, offsetX, offsetY) {
      var animation, ctx, img, jXHR;
      if (offsetX == null) {
        offsetX = 0;
      }
      if (offsetY == null) {
        offsetY = 0;
      }
      if (element.animation != null) {
        return;
      }
      ctx = element.getContext("2d");
      animation = new Animation(ctx, time, offsetX, offsetY);
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

  window.ready(function() {
    var ani;
    ani = new Animator;
    window.Animator = ani;
    return ani.init();
  });

}).call(this);