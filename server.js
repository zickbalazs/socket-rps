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


app.get('/', (req,res)=>{
    ejs.renderFile('./frontend/views/pages/page.ejs', {needsSocket:false, p: 'index'},(err,data)=>{
        if (err) res.status(500).send(err.message);
        else res.status(200).send(data);
    })
})

app.post('/game', (req,res)=>{
    if (Object.values(req.body).includes('')){
        res.redirect('/')
    }
    else {
        req.session.room = req.body.room;
        req.session.user = req.body.player;
        ejs.renderFile('./frontend/views/pages/page.ejs', {needsSocket:true, p:'game', game: req.session}, (err,data)=>{
            if (err) res.status(500).send(err.message);
            else{
                

                res.status(200).send(data);
            } 
        })
    }
})

//io.sockets.adapter.rooms.get(data.room) <- szobák lekérdezése


io.on('connection', (socket)=>{
    socket.on('roomRequest', (data)=>{
        
    });
    socket.on('disconnect', (socket)=>{});
})


server.listen(8080);





