const Gamepad = require('./gamepad')
const Box2D = require('./Box2D-module')
const mapLoader = require('./mapLoader')
const map = require('../json/map.json')
const player = require('../json/player.json')

var canvas, context, world, debugDraw, gamepad

const b2Vec2 = Box2D.Common.Math.b2Vec2

const FPS = 60
const delta = 1.0/FPS

const buttonState = {
    shoulder_top_right: false,
    axis_left_x: null
}

window.addEventListener('load', init)

function init() {

    initGamepad()

    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    debugDraw = new Box2D.Dynamics.b2DebugDraw();
    debugDraw.SetSprite(context);
    debugDraw.SetDrawScale(45.0);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);

    world = new Box2D.Dynamics.b2World(new b2Vec2(0, -4), true);

    world.SetDebugDraw(debugDraw);
    mapLoader(world, map);

    mapLoader(world, player, {x: 6.5, y: -11})

    setInterval(gameTick, 16.666)
}

function findName(name, world) {
    for (var bb = world.m_bodyList; bb; bb = bb.m_next){
        if (bb.name === name) return bb
    }
    return null
}

function updatePlayer() {
    const playerBody = findName("player1", world)
    if (!playerBody) return

    if (buttonState.shoulder_top_right) {
        playerBody.ApplyImpulse(new b2Vec2(0, 0.2), playerBody.GetPosition())
    }

    if (buttonState.axis_left_x !== null) {
        playerBody.ApplyImpulse(new b2Vec2(buttonState.axis_left_x / 10, 0), playerBody.GetPosition())
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
}

function initGamepad() {
    gamepad = new Gamepad()

    gamepad.on('connect', e => console.log(`controller ${e.index} connected!`))

    gamepad.on('hold',    'shoulder_top_right ', () => buttonState.shoulder_top_right = true)
    gamepad.on('release', 'shoulder_top_right ', () => buttonState.shoulder_top_right = false)

    gamepad.on('hold',    'stick_axis_left', e => buttonState.axis_left_x = e.value[0])
    gamepad.on('release', 'stick_axis_left', () => buttonState.axis_left_x = null)

    /*
    gamepad.on('hold', 'd_pad_left', () => buttonState.left = true)
    gamepad.on('release', 'd_pad_left', () => buttonState.left = false)

    gamepad.on('hold', 'd_pad_right', () => buttonState.right = true)
    gamepad.on('release', 'd_pad_right', () => buttonState.right = false)

    gamepad.on('hold', 'd_pad_left', () => buttonState.left = true)
    gamepad.on('release', 'd_pad_left', () => buttonState.left = false)
    */
    //gamepad.on('hold', 'stick_axis_right', e => buttonState.axis_left = e.value[0])
    //gamepad.on('release', 'd_pad_right', () => buttonState.right = false)

}
