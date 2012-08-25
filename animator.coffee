#
# an animation holds the state for a particular animation
#
class Animation
    constructor: (@id, @canvasContext) ->

    onready: (fn) ->
        @readyFn = fn

    ready: (@index, @img)->
        @readyFn() if @readyFn?
            

#
# the Animator controls a set/group of animations
#
class Animator


    constructor: ->
    
    onError: null
    onStateChange: null
    
    add: (id, jsonIndex, spriteImg, options) ->
        ctx = document.getElementById(id)?.getContext "2d"

        animation = new Animation(id, ctx)

        # attempt to fetch the Json Sprite index
        jXHR = new XMLHttpRequest
        jXHR.open "GET", jsonIndex, true
        jXHR.send null
        jXHR.onreadystatechange = (event) ->
            t = event.currentTarget
            return unless t.readyState == 4 # done

            index = JSON.parse t.responseText
            
            # if we have our image ready... start the animation
            if img?
                animation.ready(index, img)

            
        # attempt to fetch the spriteImg
        img = new Image
        img.src = spriteImg
        img.onload = ->
            # if the index data is also ready...
            if index? 
                animation.ready(index, img)

        return animation

    stop: (id) ->

window.Animator = Animator
