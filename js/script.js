$(function(){
  
//document.preventDefault();
  var APIKey = 'DAK00068abf414f4e6fa818a123a1f3fd4d'; 
  var username = 'sender'; 
  var password = 'k5p9q6vv4x35504352';
  var usernameToCall, callId;

   var $audioRingIn = $('<audio>', { loop: 'loop', id: 'ring-in' });
   var $audioRingOut = $('<audio>', { loop: 'loop', id: 'ring-out' });
      
      // Load audio source to DOM to indicate call events
      var audioSource = {
        ringIn: [
          { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.mp3', type: 'audio/mp3' },
          { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.ogg', type: 'audio/ogg' }
          ],
        ringOut: [
          { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.mp3', type: 'audio/mp3' },
          { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.ogg', type: 'audio/ogg' }]
      };
      
      audioSource.ringIn.forEach(function(entry) {
        var $source = $('<source>').attr('src', entry.src);
        $audioRingIn.append($source);
      });
      
      audioSource.ringOut.forEach(function(entry) {
        var $source = $('<source>').attr('src', entry.src);
        $audioRingOut.append($source);
      });


   kandy.setup({
     remoteVideoContainer: $('#incoming-video')[0],

     listeners: {
       callinitiated: onCallInitiate,
       callinitiatefailed: onCallInitiateFail,
       oncall: oncall,
       callended: onCallTerminate,
       callendedfailed: onCallEndedFailed
     }
    });
 

  function onLoginSuccess(){
    console.log("Login Success!");
  }


  function oncall(call){
    console.debug('on call!');
    $audioRingOut[0].pause();

    console.log("User = " + usernameToCall);

  }

  function endcall(){
    console.debug('end call!');
  }

  function onLoginFailed(){
    console,log('login failed!!');
  }

  function onCallInitiate(call){
    callId = call.getId();

    $audioRingIn[0].pause();
    $audioRingOut[0].play();

    console.log('Call Initiate!');
    console.log("Call Id = " + callId);
  }

  function onCallInitiateFail() {
        alert('call failed');
      
        $audioRingIn[0].pause();
        $audioRingOut[0].pause();
  }

  function onCallTerminate(call){
    console.log('call ended!!!');
    callId = null;

    $audioRingIn[0].pause();
    $audioRingOut[0].pause();

    $("#btnMakeCall").css('display', 'none');
    $("#btnHangup").css('display', 'block');
   
  }

  function onCallEndedFailed() {
    console.debug('callendfailed');
    callId = null;
  }

  $('#btnMakeCall').on('click', function(){
    
    usernameToCall = 'reciever@oliveryepez.gmail.com';
    kandy.call.makeCall(usernameToCall, false);
    
    $("#btnMakeCall").css('display', 'none');
    $("#btnHangup").css('display', 'block');

  });

  $("#btnHangup").on('click', function(){

    $("#btnMakeCall").css('display', 'block');
    $("#btnHangup").css('display', 'none');

    kandy.call.endCall(callId);
  })
 
   

   kandy.login(APIKey, username, password, onLoginSuccess, onLoginFailed);
  /* KandyAPI.loginSSO('UAT2d9a0f5333e04d01827c7af6f2f2d8e5',
    function(){
      setup()
    },

    function(){
      console.log('login failed!!');
    });*/
});