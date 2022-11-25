let socket = io();
let form = document.querySelector('form');
let player;
let room;
socket.on('cant',()=>{
    document.querySelector('.alert').classList.remove('d-none');
});
socket.on('can', async ()=>{
    let htmldata = await (fetch('http://localhost:8080/game').then(r=>r.text()).then(data=>{return data}));
    document.querySelector('main').innerHTML = htmldata;
    SetUp();
    SetFunction();
});
socket.on('Users', (data)=>{
    document.querySelector('#player').innerHTML = data.player;
    document.querySelector('#opponent').innerHTML = data.opponent==undefined?"Várakozás ellenfélre...":data.opponent;
})
socket.on('announce', (data)=>{
    console.log(data);
    document.querySelector('#player1').innerHTML = data.score[0];
    document.querySelector('#player2').innerHTML = data.score[1];
    document.querySelector('#OpponentPick').innerHTML = data
})

document.querySelector('#join').addEventListener('click', ()=>{
    console.log('trying to emit')
    socket.emit('roomRequest', {
        user: form.player.value,
        room: form.room.value
    });
    player = form.player.value;
    room = form.room.value;
})

function SetUp(){
    socket.emit('GetUsers');
}
function SendToServer(which){
    socket.emit('Choose', which);
}
function SetFunction(){
    document.querySelector('#rock').addEventListener('click', ()=>{SendToServer('Rock'); document.querySelector('#rock').classList.add('current')});
    document.querySelector('#paper').addEventListener('click', ()=>{SendToServer('Paper'); document.querySelector('#paper').classList.add('current')});
    document.querySelector('#scissors').addEventListener('click', ()=>{SendToServer('Scissors'); document.querySelector('#scissors').classList.add('current')});
    document.querySelector('#left').addEventListener('click', ()=>{
        socket.emit('dc', room);
        window.location.reload();        
    })
}