const Gamepad = require('./gamepad')
const Box2D = require('./Box2D-module')
const mapLoader = require('./mapLoader')
const map = require('../json/map.json')
const player = require('../json/player.json')
const placer = require('../json/placer.json')

var canvas, context, world, debugDraw, gamepad

const b2Vec2 = Box2D.Common.Math.b2Vec2

const FPS = 60
const delta = 1.0/FPS

const buttons = {
    button_1: false,
    shoulder_top_left: false,
    shoulder_top_right: false,
    axis_right: null,
    axis_left_x: null
}

window.addEventListener('load', init)

function init() {

    initGamepad()

    canvas = document.getElementById('canvas')
    context = canvas.getContext('2d')

    debugDraw = new Box2D.Dynamics.b2DebugDraw()
    debugDraw.SetSprite(context)
    debugDraw.SetDrawScale(45.0)
    debugDraw.SetFillAlpha(0.3)
    debugDraw.SetLineThickness(1.0)
    debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit)

    world = new Box2D.Dynamics.b2World(new b2Vec2(0, -4), true)

    world.SetDebugDraw(debugDraw)
    mapLoader(world, map)

    mapLoader(world, player, {x: 6.5, y: -11})

    setInterval(gameTick, 16.666)
}

function findName(name, world) {
    for (var bb = world.m_bodyList; bb; bb = bb.m_next){
        if (bb.name === name) return bb
    }
    return null
}

function box2dToScreenPosition(pos) {
    return {
        x: pos.x * 45,
        y: pos.y * -45
    }
}

function rotate(angle, vec) {
    return {
        x: (Math.cos(angle) * vec.x) - (Math.sin(angle) * vec.y),
        y: (Math.sin(angle) * vec.x) + (Math.cos(angle) * vec.y),
    }
}

function sum(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    }
}

function aim(arr) {
    return {
        x: buttons.axis_right[0] * 2,
        y: buttons.axis_right[1] * -2
    }
}

function updatePlayer() {
    const playerBody = findName("player1", world)
    if (!playerBody) return

    if (buttons.shoulder_top_left || buttons.button_1) {
        playerBody.ApplyImpulse(new b2Vec2(0, 0.2), playerBody.GetPosition())
    }

    if (buttons.shoulder_top_right && buttons.axis_right !== null) {
        mapLoader(world, placer, sum(playerBody.GetPosition(), aim(buttons.axis_right)))
        buttons.shoulder_top_right = false
    }

    if (buttons.axis_left_x !== null) {
        playerBody.ApplyImpulse(new b2Vec2(buttons.axis_left_x / 10, 0), playerBody.GetPosition())
    }
}

function drawPlayer() {
    const playerBody = findName("player1", world)
    if (buttons.axis_right !== null) {
        const dot = sum(playerBody.GetPosition(), aim(buttons.axis_right))
        const pos = box2dToScreenPosition(dot)
        context.fillStyle = "red"
        context.fillRect(pos.x, pos.y, 3, 3)
    }
}

function gameTick() {
    world.Step(delta, 4, 4)

    updatePlayer()

    context.fillStyle = "lightgray"
    context.fillRect(0, 0, 1024, 768)

    context.save()
    context.scale(1, -1)
    world.DrawDebugData()
    context.restore()

    drawPlayer()
}

function initGamepad() {
    gamepad = new Gamepad()

    gamepad.on('connect', e => console.log(`controller ${e.index} connected!`))

    gamepad.on('hold',    'shoulder_top_left ', () => buttons.shoulder_top_left = true)
    gamepad.on('release', 'shoulder_top_left ', () => buttons.shoulder_top_left = false)

    gamepad.on('hold',    'shoulder_top_right ', () => buttons.shoulder_top_right = true)
    gamepad.on('release', 'shoulder_top_right ', () => buttons.shoulder_top_right = false)

    gamepad.on('hold',    'button_1', () => buttons.button_1 = true)
    gamepad.on('release', 'button_1', () => buttons.button_1 = false)

    gamepad.on('hold',    'stick_axis_left', e => buttons.axis_left_x = e.value[0])
    gamepad.on('release', 'stick_axis_left', () => buttons.axis_left_x = null)

    gamepad.on('hold',    'stick_axis_right', e => buttons.axis_right = e.value)
    gamepad.on('release', 'stick_axis_right', () => buttons.axis_right = null)

    /*
    gamepad.on('hold', 'd_pad_left', () => buttons.left = true)
    gamepad.on('release', 'd_pad_left', () => buttons.left = false)

    gamepad.on('hold', 'd_pad_right', () => buttons.right = true)
    gamepad.on('release', 'd_pad_right', () => buttons.right = false)

    gamepad.on('hold', 'd_pad_left', () => buttons.left = true)
    gamepad.on('release', 'd_pad_left', () => buttons.left = false)
    */
    //gamepad.on('hold', 'stick_axis_right', e => buttons.axis_left = e.value[0])
    //gamepad.on('release', 'd_pad_right', () => buttons.right = false)

}
