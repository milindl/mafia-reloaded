ws.removeEventListener("message",dealMessage);
ws.addEventListener("message", dealDetectiveMessage);
ws.send("#LOADED_DETECTIVE_JS");
//Certain anonymous functions to make spaces in the player-panel
(function() {
  var detective_list = document.createElement("ul");
  detective_list.appendChild(document.createTextNode("Your Detective brothers are:"))
  detective_list.id = "player-names-detective";
  document.getElementById("player-type").appendChild(detective_list);
}).call(window);


var detectivePlayers = null;
function dealDetectiveMessage(e) {
  console.log("dealMafiaMessage: " + e.data);
  var message = e.data.toString()
  if(message.indexOf("#DETECTIVE_NAMES:") == 0){
    //Need to populate detective list
    detectivePlayers = message.substring("#DETECTIVE_NAMES:".length).split(",");
    for(var i=0; i!=detectivePlayers.length; i++) {
      var mplayer = document.createElement('li');
      mplayer.appendChild(document.createTextNode(detectivePlayers[i]));
      document.getElementById("player-names-detective").appendChild(mplayer);
    }
  }
}
