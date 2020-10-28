var canvas;

var canvasCtx;



var canvasBuffer;

var bufferCtx;



var playerUnit = {}; //Player Unit Property

var threadSpeed = 10;     //Gap of Thread

var keyPressOn = {};//pressed - true

var spaceShipSprit;

var gameLoopThread;  //animation Thread ID



window.addEventListener("load", init, false);



function init() {

  canvas = document.getElementById("canvas");

  canvasCtx = canvas.getContext("2d");

  canvasBuffer = document.createElement("canvas");

  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
  
  canvasBuffer.width = canvas.width;

  canvasBuffer.height = canvas.height;

  bufferCtx = canvasBuffer.getContext("2d");



  playerUnit = {

    x: canvas.width / 2 - 18, y: canvas.height / 2 - 18,

    width: 36, height: 36, speed: 3
  }; //UserUnit Property

  document.addEventListener("keydown", getKeyDown, false);

  document.addEventListener("keyup", getKeyUp, false);

  setImage();



  gameLoopThread = setInterval(gameLoop, threadSpeed);

}



function setImage() {

  spaceShipSprit = new Image();

  spaceShipSprit.src = "https://t1.daumcdn.net/cfile/tistory/2564F54054D0952830";

}



function getKeyDown(event) {

  var keyValue;

  if (event == null) {

    return;

  }

  else {

    keyValue = event.keyCode;

    event.preventDefault();

  }

  if (keyValue == "87") keyValue = "38";       //up

  else if (keyValue == "83") keyValue = "40";  //down

  else if (keyValue == "65") keyValue = "37";  //left

  else if (keyValue == "68") keyValue = "39";  //right

  keyPressOn[keyValue] = true;

}



function getKeyUp(event) {

  var keyValue;

  if (event == null) {

    keyValue = window.event.keyCode;

    window.event.preventDefault();

  }

  else {

    keyValue = event.keyCode;

    event.preventDefault();

  }

  if (keyValue == "87") keyValue = "38";       //up

  else if (keyValue == "83") keyValue = "40";  //down

  else if (keyValue == "65") keyValue = "37";  //left

  else if (keyValue == "68") keyValue = "39";  //right

  keyPressOn[keyValue] = false;

}



function gameLoop() {

  calcKeyInnput();

  displayAll();

}



function calcKeyInnput() {

  if (keyPressOn["38"] && playerUnit.y >= -playerUnit.height / 2)

    playerUnit.y -= playerUnit.speed;  //up

  if (keyPressOn["40"] && playerUnit.y <= canvas.height - playerUnit.height / 2)

    playerUnit.y += playerUnit.speed;  //down

  if (keyPressOn["37"] && playerUnit.x >= -playerUnit.width / 2)

    playerUnit.x -= playerUnit.speed;  //left

  if (keyPressOn["39"] && playerUnit.x <= canvas.width - playerUnit.width / 2)

    playerUnit.x += playerUnit.speed;  //right

}



function displayAll() {

  /**this code use only one layer. Change to Double-Buffer

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  canvasCtx.drawImage(spaceShipSprit, //Source Image

    405, 180, //X, Y Position on spaceShipSprit

    playerUnit.width, playerUnit.height,  //Cut Size from spaceShipSprit

    playerUnit.x, playerUnit.y, //View Position

    playerUnit.width, playerUnit.height //View Size

    );

  */



  bufferCtx.fillStyle = "#ccf";

  bufferCtx.fillRect(0, 0, canvas.width, canvas.height);

  bufferCtx.drawImage(spaceShipSprit, //Source Image

    405, 180, //X, Y Position on spaceShipSprit

    playerUnit.width, playerUnit.height,  //Cut Size from spaceShipSprit

    playerUnit.x, playerUnit.y, //View Position

    playerUnit.width, playerUnit.height //View Size

  );

  canvasCtx.drawImage(canvasBuffer, 0, 0);

}
