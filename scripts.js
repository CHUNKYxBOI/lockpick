var minRot = -90,
    maxRot = 90,
    solveDeg = (Math.random() * 180) - 90,
    solvePadding = 4,
    maxDistFromSolve = 45,
    pinRot = 0,
    cylRot = 0,
    lastMousePos = 0,
    mouseSmoothing = 2,
    keyRepeatRate = 25,
    cylRotSpeed = 3,
    pinDamage = 20,
    pinHealth = 100,
    pinDamageInterval = 150,
    numPins = 1,
    userPushingCyl = false,
    gameOver = false,
    gamePaused = false,
    pin, cyl, driver, cylRotationInterval, pinLastDamaged;

$(function(){
  pin = $('#pin');
  cyl = $('#cylinder');
  driver = $('#driver');

  $('body').on('mousemove', function(e){
    if (lastMousePos && !gameOver && !gamePaused) {
      var pinRotChange = (e.clientX - lastMousePos) / mouseSmoothing;
      pinRot += pinRotChange;
      pinRot = Util.clamp(pinRot, maxRot, minRot);
      pin.css({
        transform: "rotateZ(" + pinRot + "deg)"
      });
    }
    lastMousePos = e.clientX;
  });

  $('body').on('mouseleave', function(e){
    lastMousePos = 0;
  });

  $('body').on('keydown', function(e){  
    if ((e.keyCode == 87 || e.keyCode == 65 || e.keyCode == 83 || e.keyCode == 68 || e.keyCode == 37 || e.keyCode == 39) && !userPushingCyl && !gameOver && !gamePaused) {
      pushCyl();
    }
  });

  $('body').on('keyup', function(e){
    if ((e.keyCode == 87 || e.keyCode == 65 || e.keyCode == 83 || e.keyCode == 68 || e.keyCode == 37 || e.keyCode == 39) && !gameOver) {
      unpushCyl();
    }
  });

  //TOUCH HANDLERS
  $('body').on('touchstart', function(e){
    console.log('touchStart', e);
  });

  $('#modal').on('click', '#refresh', function(){
    location.reload();
  });
});

function pushCyl() {
  var distFromSolve, cylRotationAllowance;
  clearInterval(cylRotationInterval);
  userPushingCyl = true;

  distFromSolve = Math.abs(pinRot - solveDeg) - solvePadding;
  distFromSolve =
  Util.clamp(distFromSolve, maxDistFromSolve, 0);

  cylRotationAllowance = Util.convertRanges(distFromSolve, 0, maxDistFromSolve, 1, 0.02);
  cylRotationAllowance = cylRotationAllowance * maxRot;

  cylRotationInterval = setInterval(function(){
    cylRot += cylRotSpeed;
    if (cylRot >= maxRot) {
      cylRot = maxRot;
      clearInterval(cylRotationInterval);
      unlock();
    } else if (cylRot >= cylRotationAllowance) {
      cylRot = cylRotationAllowance;
      damagePin();
    }

    cyl.css({
      transform: "rotateZ(" + cylRot + "deg)"
    });
    driver.css({
      transform: "rotateZ(" + cylRot + "deg)"
    });
  }, keyRepeatRate);
}

function unpushCyl(){
  userPushingCyl = false;
  clearInterval(cylRotationInterval);
  cylRotationInterval = setInterval(function(){
    cylRot -= cylRotSpeed;
    cylRot = Math.max(cylRot, 0);
    cyl.css({
      transform: "rotateZ(" + cylRot + "deg)"
    });
    driver.css({
      transform: "rotateZ(" + cylRot + "deg)"
    });
    if (cylRot <= 0) {
      cylRot = 0;
      clearInterval(cylRotationInterval);
    }
  }, keyRepeatRate);
}

function damagePin() {
  if (!pinLastDamaged || Date.now() - pinLastDamaged > pinDamageInterval) {
    var tl = gsap.timeline();
    pinHealth -= pinDamage;
    console.log('damagePin, pinHealth=', pinHealth);
    pinLastDamaged = Date.now();

    tl.to(pin, (pinDamageInterval / 4) / 1000, {
      rotationZ: pinRot - 2
    });
    tl.to(pin, (pinDamageInterval / 4) / 1000, {
      rotationZ: pinRot
    });
    if (pinHealth <= 0) {
      breakPin();
    }
  }
}

function breakPin() {
  var tl, pinTop, pinBott;
  gamePaused = true;
  clearInterval(cylRotationInterval);
  numPins--;
  $('span').text(numPins);
  pinTop = pin.find('.top');
  pinBott = pin.find('.bott');
  tl = gsap.timeline();
  tl.to(pinTop, 0.7, {
    rotationZ: -400,
    x: -200,
    y: -100,
    opacity: 0
  });
  tl.to(pinBott, 0.7, {
    rotationZ: 400,
    x: 200,
    y: 100,
    opacity: 0,
    onComplete: function(){
      if (numPins > 0) {
        gamePaused = false; 
        reset();
      } else {
        outOfPins();
      }
    }
  }, 0);
  tl.play();       
}

function reset() {
  cylRot = 0;
  pinHealth = 100;
  pinRot = 0;
  pin.css({
    transform: "rotateZ(" + pinRot + "deg)"
  });  
  cyl.css({
    transform: "rotateZ(" + cylRot + "deg)"
  });  
  driver.css({
    transform: "rotateZ(" + cylRot + "deg)"
  });  
  gsap.to(pin.find('.top'), 0, {
    rotationZ: 0,
    x: 0,
    y: 0,
    opacity: 1
  });
  gsap.to(pin.find('.bott'), 0, {
    rotationZ: 0,
    x: 0,
    y: 0,
    opacity: 1
  });
}

function outOfPins() {
    gameOver = true;
    $('#win').hide(); // ซ่อน div ที่มี id="win"
    $('#lose').show(); // แสดง div ที่มี id="lose"
    $('#lose').find('#refresh').show(); // แสดงปุ่ม refresh
    $('#modal').show();
  }
  
  function unlock() {
    gameOver = true;
    $('#lose').hide(); // ซ่อน div ที่มี id="lose"
    $('#win').show(); // แสดง div ที่มี id="win"
    $('#win').find('#refresh').show(); // แสดงปุ่ม refresh
    $('#modal').show();
  }
  
  
var Util = {
  clamp: function(val, max, min) {
    return Math.min(Math.max(val, min), max);
  },
  convertRanges: function(OldValue, OldMin, OldMax, NewMin, NewMax) {
    return (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin;
  }
};
