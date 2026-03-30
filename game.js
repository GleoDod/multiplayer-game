// ===== CONNECT =====
let ws = new WebSocket("wss://multiplayer-game-po6d.onrender.com")

// ===== CANVAS =====
let c = document.getElementById("c")
let d = c.getContext("2d")

c.width = innerWidth
c.height = innerHeight

// ===== UI =====
let mode = prompt("Host oder Join?").toLowerCase()
let room = prompt("Room Code:")

// ===== PLAYER =====
let me = {
x: innerWidth / 2,
y: innerHeight / 2,
c: rand()
}

let players = {}

// ===== SAFE SEND =====
function send(){
if(!ws || ws.readyState !== 1) return

ws.send(JSON.stringify({
type:"update",
room,
data:me
}))
}

// ===== WS =====
ws.onopen = () => {
ws.send(JSON.stringify({
type:"join",
room,
host: mode === "host"
}))
}

ws.onmessage = e => {
let m
try { m = JSON.parse(e.data) } catch(e) { return }

if(m.type === "state"){
players = m.players || {}
}

if(m.type === "full"){
alert("Room voll (max 5)")
location.reload()
}
}

// ===== INPUT =====
function rand(){
return ["red","blue","green","white","black"][Math.random()*5|0]
}

ontouchmove = e => {
me.x = e.touches[0].clientX
me.y = e.touches[0].clientY
send()
}

onmousemove = e => {
me.x = e.clientX
me.y = e.clientY
send()
}

function input(){
let g = navigator.getGamepads()[0]
if(!g) return

me.x += g.axes[0] * 5
me.y += g.axes[1] * 5
send()
}

// ===== LOOP =====
function loop(){
input()

d.fillStyle = "#111"
d.fillRect(0,0,c.width,c.height)

for(let id in players){
let p = players[id]
if(!p) continue

d.fillStyle = p.c || "white"
d.fillRect(p.x || 0, p.y || 0, 20, 20)
}

requestAnimationFrame(loop)
}

loop()
