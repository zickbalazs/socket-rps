let socket = io();
let form = document.querySelector('form');
let player;
socket.on('cant',()=>{
    document.querySelector('.alert').classList.remove('d-none');
});
socket.on('can', async ()=>{
    let htmldata = await (fetch('http://localhost:8080/game').then(r=>r.text()).then(data=>{return data}));
    document.querySelector('main').innerHTML = htmldata;
    SetUp();
});
socket.on('Users', (data)=>{
    document.querySelector('#player').innerHTML = data.player;
    document.querySelector('#opponent').innerHTML = data.opponent==undefined?"Várakozás ellenfélre...":data.opponent;
})

document.querySelector('#join').addEventListener('click', ()=>{
    console.log('trying to emit')
    socket.emit('roomRequest', {
        user: form.player.value,
        room: form.room.value
    });
    player = form.player.value;
})

function SetUp(){
    socket.emit('GetUsers');
}