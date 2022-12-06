let socket = io();
let form = document.querySelector('form');
let player;
let opponent;
let room;
let selected;
socket.on('cant',()=>{
    document.querySelector('.alert').classList.remove('d-none');
});
socket.on('GameEnd', ()=>{
    alert('Az ellenfeled kilépett!');
    $('#gameitems').fadeOut();
})
socket.on('can', async ()=>{
    let htmldata = await (fetch('http://localhost:8080/game').then(r=>r.text()).then(data=>{return data}));
    document.querySelector('main').innerHTML = htmldata;
    SetUp();
    SetFunction();
});
socket.on('Users', (data)=>{
    opponent = data.opponent == player ? data.player : data.opponent;
    $('#messageText').text(opponent);
    document.querySelector('#player').innerHTML = data.player;
    if (data.opponent==undefined){
        document.querySelector('#opponent').innerHTML = "Várakozás ellenfélre...";
    }
    else{
        $('#opponent').fadeOut(()=>{
            document.querySelector('#opponent').innerHTML = data.opponent;
            document.querySelector('#OpponentName').innerHTML = opponent;
            $('#opponent').fadeIn(()=>{
                $('#gameitems').fadeIn();
            });
        });
    }
})
socket.on('announce', (data)=>{
    $('#pick').fadeIn();
    $('#message').fadeOut();
    document.querySelector('#OpponentPick').src = `/img/${data.choosen.filter(e=>e!=selected).length==0 ? selected.toLowerCase() : data.choosen.filter(e=>e!=selected)[0].toLowerCase()}.png`
    if (data.score[0]!=$('#player1').text()){
        $('#player1').fadeOut(220, ()=>{
            document.querySelector('#player1').innerHTML = data.score[0];
            $('#player1').fadeIn();
        })
    }
    if (data.score[1]!=$('#player2').text()){
        $('#player2').fadeOut(220, ()=>{
            document.querySelector('#player2').innerHTML = data.score[1];
            $('#player2').fadeIn();
        })
    }
    document.querySelector('#OpponentPick').innerHTML = `${data.choosen.filter(e=>e!=selected)[0]==undefined?'':(player==document.querySelector('#opponent').innerHTML?document.querySelector('#player').innerHTML+'-':document.querySelector('#opponent').innerHTML+'-')}${data.choosen.filter(e=>e!=selected)[0]==undefined?"Döntetlen":data.choosen.filter(e=>e!=selected)[0]}`;
    
})
document.querySelector('#join').addEventListener('click', ()=>{
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
    document.querySelector('#rock').addEventListener('click', ()=>{
        $('#message').fadeIn();
        $('#pick').fadeOut();
        SendToServer('Rock');
        document.querySelector('#rock').classList.add('current');
        ClearSelections('rock')
        selected = "Rock"
    });
    document.querySelector('#paper').addEventListener('click', ()=>{
        $('#pick').fadeOut();
        $('#message').fadeIn();
        SendToServer('Paper');
        document.querySelector('#paper').classList.add('current');
        ClearSelections('paper')
        selected = "Paper"
    });
    document.querySelector('#scissors').addEventListener('click', ()=>{
        $('#message').fadeIn();
        $('#pick').fadeOut();
        SendToServer('Scissors');
        ClearSelections('scissors')
        selected = "Scissors"
    });
    document.querySelector('#quit').addEventListener('click', ()=>{
        if (confirm('Biztos ki akarsz lépni?')){
            window.location.reload();
        }
    })
}





function ClearSelections(whichtoactivate){
    whichtoactivate == 'scissors' ? document.querySelector('#scissors').classList.add('current') : document.querySelector('#scissors').classList.remove('current');
    whichtoactivate == 'rock' ? document.querySelector('#rock').classList.add('current') : document.querySelector('#rock').classList.remove('current');
    whichtoactivate == 'paper' ? document.querySelector('#paper').classList.add('current') : document.querySelector('#paper').classList.remove('current');
}