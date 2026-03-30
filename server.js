const WebSocket = require("ws")
const wss = new WebSocket.Server({ port: 3000 })

let rooms = {}

function randColor(){
return ["red","blue","green","white","black"][Math.floor(Math.random()*5)]
}

wss.on("connection", ws => {

let room = null
let id = null

ws.on("message", msg => {
let m = JSON.parse(msg)

// 🟢 JOIN ROOM
if(m.type === "join"){
room = m.room
id = Math.random().toString(36).slice(2)

if(!rooms[room]){
rooms[room] = {
players: {},
host: null
}
}

// HOST setzen (erste Person oder explizit Host)
if(m.host && !rooms[room].host){
rooms[room].host = id
}

// MAX 5 SPIELER
let count = Object.keys(rooms[room].players).length
if(count >= 5){
ws.send(JSON.stringify({type:"full"}))
return
}

// Spieler hinzufügen
rooms[room].players[id] = {
x:100,
y:100,
c:randColor()
}
}

// 🟡 UPDATE POSITION
if(m.type === "update"){
if(!rooms[room])return
if(!rooms[room].players[id])return

rooms[room].players[id].x = m.data.x
rooms[room].players[id].y = m.data.y
rooms[room].players[id].c = m.data.c
}

// 🔵 BROADCAST STATE
if(rooms[room]){
for(let client of wss.clients){
if(client.readyState === 1){
client.send(JSON.stringify({
type:"state",
room,
players: rooms[room].players,
host: rooms[room].host
}))
}
}
}

})

// ❌ DISCONNECT
ws.on("close", () => {
if(!room || !rooms[room])return

delete rooms[room].players[id]

// wenn host geht → neuer host
if(rooms[room].host === id){
let keys = Object.keys(rooms[room].players)
rooms[room].host = keys.length ? keys[0] : null
}

// room cleanup
if(Object.keys(rooms[room].players).length === 0){
delete rooms[room]
}
})
})

console.log("Server läuft auf ws://localhost:3000")
