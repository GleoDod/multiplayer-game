let ws = new WebSocket("wss://DEIN-SERVER.onrender.com")

c.width = innerWidth
c.height = innerHeight
let d = c.getContext("2d")

let mode = prompt("Host oder Join?").toLowerCase()
let room = prompt("Room Code:")

let me = {
x: innerWidth / 2,
y: innerHeight / 2,
c: rand()
}

let players = {}

ws.onopen = () => {
ws.send(JSON.stringify({
type: "join",
room,
host: mode === "host"
}))
}

ws.onmessage = e => {
let m = JSON.parse(e.data)

if (m.type === "state") {
players = m.players
}

if (m.type === "full") {
alert("Room voll (max 5 Spieler)")
location.reload()
}
}

function rand() {
return ["red", "blue", "green", "white", "black"][Math.random() * 5 | 0]
}

function send() {
ws.send(JSON.stringify({
type: "update",
room,
data: me
}))
}

/* 🎮 TOUCH */
ontouchmove = e => {
me.x = e.touches[0].clientX
me.y = e.touches[0].clientY
send()
}

/* 🖱️ MOUSE */
onmousemove = e => {
me.x = e.clientX
me.y = e.clientY
send()
}

/* 🎮 GAMEPAD */
function input() {
let g = navigator.getGamepads()[0]
if (!g) return

me.x += g.axes[0] * 5
me.y += g.axes[1] * 5
send()
}

/* 🎨 RENDER LOOP */
function loop() {
input()

d.fillStyle = "#111"
d.fillRect(0, 0, c.width, c.height)

for (let id in players) {
let p = players[id]
d.fillStyle = p.c
d.fillRect(p.x, p.y, 20, 20)
}

requestAnimationFrame(loop)
}

loop()
