//ws.removeEventListener("message",dealMessage);
ws.addEventListener("message", dealDetectiveMessage);
ws.send("#LOADED_DETECTIVE_JS");
//Certain anonymous functions to make spaces in the player-panel
var detectivePlayers;
function dealDetectiveMessage(e) {
  var message=e.data.toString();
  if(message.indexOf("#DETECTIVE_NAMES:") == 0){
    //Need to populate detective list
    detectivePlayers = message.substring("#DETECTIVE_NAMES:".length).split(",");
    for(var i=0; i!=detectivePlayers.length; i++) {
      gs.teamNames.push(detectivePlayers[i]);
    }
    gs.initiate();
    gs.decorate("Nice, you're a detective");
  }
  if(message.indexOf("#DETECTIVE_VOTE") == 0) {
    gs.round = "#DETECTIVE_VOTE";
    setupVoting(15, gs);
    gs.decorate("It's the Detective Vote");
  }

  if(message.indexOf("#DETECTION_RESULT:") == 0) {
    var dr = message.split(":");
    if(dr[2]=="True"){
      document.getElementById("detection-result").lastChild.innerHTML = dr[1] + " was indeed a mafia as per detection result. <br>";
    } else {
      document.getElementById("detection-result").lastChild.innerHTML = dr[1] + " was not a mafia as per detection result.<br>";
    }
  }
  if(message.indexOf("#DISCUSSION")==0) {
    document.getElementById("detection-result").lastChild.innerHTML = "[unavailable]";
  }

}
