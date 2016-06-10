//ws.removeEventListener("message",dealMessage);
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
  var message = e.data.toString();
  if(message.indexOf("#MAFIA_NAMES:") == 0){
    //Need to populate mafia list
    mafiaPlayers = message.substring("#MAFIA_NAMES:".length).split(",");
    for(var i=0; i!=mafiaPlayers.length; i++) {
      gs.teamNames.push(mafiaPlayers[i]);
      var mplayer = document.createElement('li');
      mplayer.appendChild(document.createTextNode(mafiaPlayers[i]));
      document.getElementById("player-names-mafia").appendChild(mplayer);
    }
  }
  if(message.indexOf("#MAFIA_VOTE") == 0) {
    gs.round = "#MAFIA_VOTE";
    document.getElementById("round-name").innerHTML = "Mafia voting round is on <br>";
    setupVoting(15);
  }

}
