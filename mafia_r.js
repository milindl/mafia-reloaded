// This contains a collection of some oft used functions

function loadScript(location) {                  // Dynamically loads a javascript file for use
  js = document.createElement("script");
  js.src = location;
  js.id = "sandboxScript";
  document.body.appendChild(js);
}
function timer(interval, callbackEnd, callPerSecond) { //Timer function
  /*
  Usage: timer(intervalInSeconds, functionToBeCalledWhenTimeUp, functionToBeCalledPerSecond(timeElapsed))
  */
  var initialTime = Date.now();
  // Interval should be in seconds
  //Call per second gets the diff as well
  var _timer = setInterval(function() {
    var diff = Date.now() - initialTime;
    callPerSecond.call(this, Math.floor(diff/1000));
    if((diff/1000)>=interval) {
      clearInterval(_timer);
      callbackEnd.call(this);
    }
  }, 900);
}
