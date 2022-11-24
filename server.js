let ejs = require('ejs'), express = require('express'), path = require('path'), app = express(), server = require('http').createServer(app), io = require('socket.io')(server);


app.use(require('express-session')({
    resave:true,
    saveUninitialized:true,
    secret:'secret'
}))
app.use(express.urlencoded({extended:false}));
app.use('/css', express.static(path.join(__dirname, './frontend/assets/css')))
app.use('/js', express.static(path.join(__dirname, './frontend/assets/js')))
app.use('/bootstrap', express.static(path.join(__dirname, './node_modules/bootstrap/dist/')));
app.use('/socketio', express.static(path.join(__dirname, './node_modules/socket.io/client-dist')));

app.get('/game', (req,res)=>{
    res.status(200).sendFile(path.join(__dirname, './frontend/assets/html/game.html'));
})
app.get('/', (req,res)=>{
    ejs.renderFile('./frontend/views/pages/page.ejs', {needsSocket:true, p: 'index'},(err,data)=>{
        if (err) res.status(500).send(err.message);
        else res.status(200).send(data);
    })
})
//io.sockets.adapter.rooms.get(data.room) <- szobák lekérdezése
io.on('connection', (socket)=>{
    socket.on('roomRequest', (data)=>{
        if (io.sockets.adapter.rooms.get(data.room)==undefined || Array.from(io.sockets.adapter.rooms.get(data.room)).length<2){
            socket.join(data.room);
            socket.data = {
                usr: data.user,
                room: data.room
            };
            console.log('room:',socket.id,'=>', Array.from(io.sockets.adapter.rooms.get(data.room)));
            socket.emit('can');
        }
        else socket.emit('cant')
    });
    socket.on('GetUsers', ()=>{
        socket.emit('Users', GetRoomUsers(socket.data.room));
        socket.to(socket.data.room).emit('Users', GetRoomUsers(socket.data.room));
    })
    socket.on('disconnect', (socket)=>{});
});
function GetRoomUsers(roomID){
    let names = [];
    Array.from(io.sockets.adapter.rooms.get(roomID)).forEach(e=>{
        names.push(io.sockets.sockets.get(e).data.usr);
    })
    return {
        player: names[0],
        opponent: names[1]
    };
}
server.listen(8080);