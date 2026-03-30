const WebSocket = require("ws")

const wss = new WebSocket.Server({
port: process.env.PORT || 3000
})

let rooms = {}

function randColor(){
return ["red","blue","green","white","black"][Math.random()*5|0]
}

wss.on("connection", ws => {

let room = null
let id = null

ws.on("message", msg => {
let m
try { m = JSON.parse(msg) } catch(e) { return }

// JOIN
if(m.type === "join"){
room = m.room
id = Math.random().toString(36).slice(2)

if(!rooms[room]){
rooms[room] = { players:{}, host:null }
}

if(Object.keys(rooms[room].players).length >= 5){
ws.send(JSON.stringify({type:"full"}))
return
}

if(m.host && !rooms[room].host){
rooms[room].host = id
}

rooms[room].players[id] = {
x:100,
y:100,
c:randColor()
}
}

// UPDATE
if(m.type === "update"){
if(!rooms[room]) return
if(!rooms[room].players[id]) return

rooms[room].players[id].x = m.data.x
rooms[room].players[id].y = m.data.y
rooms[room].players[id].c = m.data.c
}

// BROADCAST
if(rooms[room]){
for(let client of wss.clients){
if(client.readyState === 1){
client.send(JSON.stringify({
type:"state",
players: rooms[room].players || {}
}))
}
}
}

})

ws.on("close", () => {
if(!room || !rooms[room]) return

delete rooms[room].players[id]

if(rooms[room].host === id){
let keys = Object.keys(rooms[room].players)
rooms[room].host = keys[0] || null
}

if(Object.keys(rooms[room].players).length === 0){
delete rooms[room]
}
})

})

console.log("WS Server läuft")
