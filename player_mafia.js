//ws.removeEventListener("message",dealMessage);
ws.addEventListener("message", dealMafiaMessage);
ws.send("#LOADED_MAFIA_JS");
//Certain anonymous functions to make spaces in the player-panel


var mafiaPlayers = null;

function dealMafiaMessage(e) {
  var message = e.data.toString();
  if(message.indexOf("#MAFIA_NAMES:") == 0){
    //Need to populate mafia list
    mafiaPlayers = message.substring("#MAFIA_NAMES:".length).split(",");
    for(var i=0; i!=mafiaPlayers.length; i++) {
      gs.teamNames.push(mafiaPlayers[i]);
    }
    gs.initiate();
    gs.decorate("Welcome to the MAFIA");
  }
  if(message.indexOf("#MAFIA_VOTE") == 0) {
    gs.round = "#MAFIA_VOTE";
    console.log("initiate mafia vote...")
    setupVoting(15, gs);
    gs.decorate("It's the MAFIA Vote!");
  }

}
