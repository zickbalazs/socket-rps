let ejs = require('ejs'), express = require('express'), path = require('path'), app = express(), server = require('http').createServer(app), io = require('socket.io')(server);

app.use(require('express-session')({
    resave:true,
    saveUninitialized:true,
    secret:'secret'
}))
app.use(express.urlencoded({extended:false}));
app.use('/img', express.static(path.join(__dirname, './frontend/assets/img')))
app.use('/css', express.static(path.join(__dirname, './frontend/assets/css')))
app.use('/js', express.static(path.join(__dirname, './frontend/assets/js')))
app.use('/bootstrap', express.static(path.join(__dirname, './node_modules/bootstrap/dist/')));
app.use('/socketio', express.static(path.join(__dirname, './node_modules/socket.io/client-dist')));
app.use('/jquery', express.static(path.join(__dirname, './node_modules/jquery/dist')))

app.get('/game', (req,res)=>{
    res.status(200).sendFile(path.join(__dirname, './frontend/assets/html/game.html'));
})
app.get('/', (req,res)=>{
    ejs.renderFile('./frontend/views/pages/page.ejs', {needsSocket:true, p: 'index'},(err,data)=>{
        if (err) res.status(500).send(err.message);
        else res.status(200).send(data);
    })
})
let RoomsData = new Map();
//io.sockets.adapter.rooms.get(data.room) <- szobák lekérdezése
io.on('connection', (socket)=>{
    socket.on('roomRequest', (data)=>{
        if (io.sockets.adapter.rooms.get(data.room)==undefined || Array.from(io.sockets.adapter.rooms.get(data.room)).length<2){
            socket.join(data.room);
            socket.data = {
                usr: data.user,
                room: data.room
            };
            RoomsData.set(socket.data.room, {
                choosen: [],
                score: [0,0]
            })
            console.log(RoomsData.get(socket.data.room))
            console.log('room:',socket.data.room,'=>', Array.from(io.sockets.adapter.rooms.get(data.room)));
            socket.emit('can');
        }
        else socket.emit('cant')
    });
    socket.on('GetUsers', ()=>{
        socket.emit('Users', GetRoomUsers(socket.data.room));
        socket.to(socket.data.room).emit('Users', GetRoomUsers(socket.data.room));
    })
    socket.on('Choose', (which)=>{
        let chosen = RoomsData.get(socket.data.room)==undefined?[]:RoomsData.get(socket.data.room).choosen;
        let score = RoomsData.get(socket.data.room)==undefined?[0, 0]:RoomsData.get(socket.data.room).score;
        chosen[Array.from(io.sockets.adapter.rooms.get(socket.data.room)).findIndex(e=>e==socket.id)] = which;
        if (RoomsData.get(socket.data.room).choosen.filter(e=>e).length==2){
            RoomsData.set(socket.data.room, {
                choosen:chosen,
                score: EvalScore(chosen, score)
            })
            socket.to(socket.data.room).emit('announce', RoomsData.get(socket.data.room));
            socket.emit('announce', RoomsData.get(socket.data.room));
            RoomsData.set(socket.data.room, {
                choosen: [],
                score: RoomsData.get(socket.data.room).score
            });
        }
        else{
            RoomsData.set(socket.data.room, {
                choosen:chosen,
                score: score
            })
        }
    })
    socket.on('disconnect', ()=>{
        RoomsData.delete(socket.data.room);
        socket.to(socket.data.room).emit('GameEnd');
    });
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
function EvalScore(array, score){
    switch (true){
        case array[0]==array[1]: return [score[0], score[1]];
        //p1 conditions
        case array[0]=='Rock'&&array[1]=='Paper': return [score[0], score[1]+1];
        case array[0]=='Paper'&&array[1]=='Rock': return [score[0], score[1]+1];
        case array[0]=='Scissors'&&array[1]=='Rock': return [score[0], score[1]+1];
        case array[0]=='Paper'&&array[1]=='Scissors':return [score[0], score[1]+1];
        //p2 conditions
        case array[1]=='Rock'&&array[0]=='Paper': return [score[0]+1, score[1]];
        case array[1]=='Paper'&&array[0]=='Rock': return [score[0]+1, score[1]];
        case array[1]=='Scissors'&&array[0]=='Rock': return [score[0]+1, score[1]];
        case array[1]=='Paper'&&array[0]=='Scissors':return [score[0]+1, score[1]];
        //errors
        default: return score;
    }
}
server.listen(8080);