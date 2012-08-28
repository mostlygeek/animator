###
# v0.0.2
# Copyright Futdut Games, Inc 2012
###

# DOM ready
# source: https://raw.github.com/gist/2477661/6f91e98d167d904e5f4b77743d8fe6dbe615938a/stuff.coffee
window.ready ?= (fn) ->
  fire = ->
    unless window.ready.fired
      window.ready.fired = true
      fn()

  return fire() if document.readyState is "complete"

  # Mozilla, Opera, WebKit
  if document.addEventListener
    document.addEventListener "DOMContentLoaded", fire, false
    window.addEventListener "load", fire, false

  # IE
  else if document.attachEvent
    check = ->
      try
        # the IE hack to check if we can scroll... which fails if dom is not
        # ready
        document.documentElement.doScroll "left"
      catch e
        setTimeout check, 50
        return
      fire()
    document.attachEvent "onreadystatechange", fire
    window.attachEvent "onload", fire
    check() if document.documentElement and document.documentElement.doScroll and !window.frameElement


# polyfill for request animation time... 
# credit: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
do ->
    # hey, there's no point if it already exists... 
    return if window.requestAnimationFrame

    lastTime = 0
    vendors = ["ms", "moz", "webkit", "o"]
    for vendor in vendors 
        break if window.requestAnimationFrame?
        window.requestAnimationFrame = window["#{vendor}RequestAnimationFrame"]
        window.cancelAnimationFrame  = window["#{vendor}CancelAnimationFrame"] || window["#{vendor}CancelRequestAnimationFrame"]
  
    # let's do something really crazy! 
    if !window.requestAnimationFrame? 
        window.requestAnimationFrame = (callback, element) ->
            curTime = new Date().getTime()
            timeToCall = Math.max 0, 16 - (curTime - lastTime)
            id = window.setTimeout -> 
                callback curTime + timeToCall
            , timeToCall

            lastTime = curTime + timeToCall
            id

    if !window.cancelAnimationFrame
        window.cancelAnimationFrame = (id) ->
            clearTimeout id

    null

#
# an animation holds the state for a particular animation
#
class Animation
    # used for controlling which frame to play
    curFrame: 0
    lastFrame: 0
    ready: false

    # @canvasContext    - the 2D canvas context to draw this animation into
    # @time             - how long it takes to play all frames
    # @options          - options to control the animation 
    constructor: (indexURL, spriteURL, @canvasContext, @time, @offsetX, @offsetY) ->
        @startTime = Date.now()
        @lastFrame = 0

        jXHR = new XMLHttpRequest
        jXHR.open "GET", indexURL, true
        jXHR.send null
        jXHR.onreadystatechange = (event) =>
            t = event.currentTarget
            return unless t.readyState == 4 # done

            @index = JSON.parse t.responseText
            @ready() if @img?
            
        # attempt to fetch the spriteImg
        img = new Image
        img.src = spriteURL
        img.onload = =>
            @img = img
            @ready() if @index? 
   
    # record a callback for when the animation is ready to go...
    onready: (fn) ->
        @readyFn = fn

    # provide the index/img and trigger that the animation is ready to go
    ready: ->
        @frameCount = @index.frames.length
        @frameDelay = @time * 1000 / @frameCount  # how many ms each frame should be shown for
        @ready = true
        @readyFn() if @readyFn?

    draw: (now = Date.now() )->
        return unless @ready == true
        
        timePassed = Math.floor (now - @startTime) / @frameDelay
        curFrame = timePassed % @frameCount

        return if curFrame == @lastFrame
    
        @lastFrame = curFrame
        tile = @index.frames[curFrame]
        sSize = tile.spriteSourceSize
        @canvasContext.clearRect 0,0, @canvasContext.canvas.width, @canvasContext.canvas.height
        @canvasContext.drawImage @img,
            tile.frame.x, tile.frame.y,    # where to clip from @img
            tile.frame.w, tile.frame.h,    # size of the tile x/y
            @offsetX+sSize.x,              # where to position it
            @offsetY+sSize.y,
            tile.frame.w, tile.frame.h     # the size of the tile to draw

        null

#
# the Animator controls a set/group of animations
#
class Animator
    constructor: ->

        # initialize the queue
        @queue = []
        
        animateFn = (now) =>
            animation.draw(now) for animation in @queue

            # loop it...
            window.requestAnimationFrame animateFn
        
        window.requestAnimationFrame animateFn

    # find all canvas tags w/ the animator class, parse out the options and bind
    # the animation to it
    init: ->
        elements = document.querySelectorAll "canvas.Animator"
        for el in elements
            index   = el.getAttribute "data-index"
            sprites = el.getAttribute "data-sprites"
            time    = parseFloat(el.getAttribute("data-time"))
            dataX = el.getAttribute("data-x")
            dataY = el.getAttribute("data-y")
            offsetX = if dataX? then parseInt dataX else 0
            offsetY = if dataY? then parseInt dataY else 0

            @add(el, index, sprites, time, offsetX, offsetY)

    # add an animation to a canvas tag 
    add: (element, jsonIndex, spriteImg, time, offsetX=0, offsetY=0) ->
        # the animation object created here is bound to the element... 
        # makes it easier to determine if we're adding the same thing over
        return if element.animation?
        
        ctx = element.getContext "2d"

        animation = new Animation(jsonIndex, spriteImg, ctx, time, offsetX, offsetY)

        
        element.animation = animation
        @queue.push animation
        return animation

    stop: (id) ->

# automatically bind and run when the DOM is ready
window.ready ->
    ani = new Animator
    window.Animator = ani
    ani.init()
