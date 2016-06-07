ws.removeEventListener("message",dealMessage);
ws.addEventListener("message", dealMafiaMessage);
ws.send("#LOADED_MAFIA_JS");
//Certain anonymous functions to make spaces in the player-panel
(function() {
  var mafia_list = document.createElement("ul");
  mafia_list.appendChild(document.createTextNode("Your Mafia brothers are:"))
  mafia_list.id = "player-names-mafia";
  document.getElementById("player-type").appendChild(mafia_list);
}).call(window);


var mafiaPlayers = null;
function dealMafiaMessage(e) {
  console.log("dealMafiaMessage: " + e.data);
  var message = e.data.toString()
  if(message.indexOf("#MAFIA_NAMES:") == 0){
    //Need to populate mafia list
    mafiaPlayers = message.substring("#MAFIA_NAMES:".length).split(",");
    for(var i=0; i!=mafiaPlayers.length; i++) {
      var mplayer = document.createElement('li');
      mplayer.appendChild(document.createTextNode(mafiaPlayers[i]));
      document.getElementById("player-names-mafia").appendChild(mplayer);
    }
  }
  if(message.indexOf("#MAFIA_VOTE") == 0) {
    console.log("Recvd vote");
    ws.send("#VOTE_HELLO");
    for(var i=4; i!=1000; i++) var j = Math.sqrt(1234.5623123); 
    ws.send("#DONE_VOTING");
  }
}
