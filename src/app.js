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
    x: false
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
    var body = world.m_bodyList
    var counter = 0
    while (body.name !== name && counter < 100) {
        counter++
        body = body.m_next
    }
    if (counter > 90) {
        console.error('To many stuff')
    }
    return body  
}

function gameTick() {
    world.Step(delta, 4, 4);

    if (buttonState.x) {
        const playerBody = findName("player1", world)
        playerBody.ApplyImpulse(new b2Vec2(0, 0.2), playerBody.GetPosition())
    }

    context.fillStyle = "lightgray"
    context.fillRect(0, 0, 1024, 768)

    context.save()
    context.scale(1, -1);
    world.DrawDebugData();
    context.restore();
}

function initGamepad() {
    gamepad = new Gamepad()

    gamepad.on('connect', e => {
        console.log(`controller ${e.index} connected!`)
    })

    gamepad.on('press', 'button_1', () => {
        console.log('button 1 was pressed!')
    })

    gamepad.on('hold', 'button_1', () => {
        console.log('button 1 is being held!');
        buttonState.x = true
    });

    gamepad.on('release', 'button_1', () => {
        console.log('button 1 was released!');
        buttonState.x = false
    });
}
