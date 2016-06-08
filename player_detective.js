ws.removeEventListener("message",dealMessage);
ws.addEventListener("message", dealDetectiveMessage);
ws.send("#LOADED_DETECTIVE_JS");
//Certain anonymous functions to make spaces in the player-panel
(function() {
  var detectiveList = document.createElement("ul");
  detectiveList.appendChild(document.createTextNode("Your Detective brothers are:"))
  detectiveList.id = "player-names-detective";
  document.getElementById("player-type").appendChild(detectiveList);
  var detectiveResult = document.createElement("span");
  detectiveResult.id = "detective-result";
  document.getElementById("player-panel").appendChild(detectiveResult);
}).call(window);

var detectivePlayers = null;
function dealDetectiveMessage(e) {
  console.log("dealMafiaMessage: " + e.data);
  var message=e.data.toString();
  if(message.indexOf("#DETECTIVE_NAMES:") == 0){
    //Need to populate detective list
    detectivePlayers = message.substring("#DETECTIVE_NAMES:".length).split(",");
    for(var i=0; i!=detectivePlayers.length; i++) {
      var mplayer = document.createElement('li');
      mplayer.appendChild(document.createTextNode(detectivePlayers[i]));
      document.getElementById("player-names-detective").appendChild(mplayer);
    }
  }
  if(message.indexOf("#DETECTIVE_VOTE") == 0) {
    setupVoting(7);
  }
  if(message.indexOf("#VOTE:")==0) {
    var ms = message.split(":");
    voter = ms[1];
    votee = ms[2];
    voteBank[voter] = votee;
    document.getElementById("voting-for").innerHTML = "" + voteBankString(voteBank);
  }
  if(message.indexOf("#DETECTION_RESULT:") == 0) {
    var dr = message.split(":");
    if(dr[2]=="True"){
      document.getElementById("detective-result").innerHTML = dr[1] + " was indeed a mafia. <br>";
    } else {
      document.getElementById("detective-result").innerHTML = dr[1] + " was not a mafia. <br>";
    }
  }


}
