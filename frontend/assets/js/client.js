let socket = io();

document.onload = ()=>{
    socket.emit('roomRequest', )
}


socket.on('success', ()=>{
    alert('Sikeres csatlakozás');
});
socket.on('unauthorized', ()=>{
    window.location.href='localhost:8080/';
})
function GetReq(){
    return {
        player: document.querySelector('form').player.value,
        room: document.querySelector('form').room.value
    }
}