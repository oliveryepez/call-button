$(function(){
  
//document.preventDefault();
  var APIKey = 'DAK00068abf414f4e6fa818a123a1f3fd4d'; 
  var username = 'sender@oliveryepez.gmail.com'; 
  var password = 'k5p9q6vv4x35504352';
  var $userTo = 'reciever@oliveryepez.gmail.com';

  var $sessionId, $sessionUser;

  /*var username = 'costumer'; 
  var password = '12345abc';*/

  var callId;

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

     var listeners = {
        'onUserJoinRequest': onSessionUserJoinRequest
      };


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
    setInterval(recieveMessages, 1000);

    kandy.session.terminate('b3fd5c0d5b91435e942729077204bee8');

     var sessionObject = {
      session_type: 'cobrowsing',
      session_name: 'Share Screen'
    }

   kandy.session.create(sessionObject, function(data){
      console.log('===> session created ' + data.session_id);
      $sessionId = data.session_id;
      
      kandy.session.getOpenSessionsCreatedByUser(function(list){
        list.sessions.forEach(function(session){
          console.log('session admin: ' + session.admin_full_user_id);
          $sessionUser = session.admin_full_user_id;
        });
      }, function(){

      });


      kandy.session.activate(data.session_id, 
        function(){
          console.log('===> Session id: ' + data.session_id + 'acitvated');
        },  
        function(code, msg){
          console.log('===> error activating session: ' + data_session_id + ' ' + msg + '' + code);
        });

      kandy.session.setListeners(data.session_id, listeners);

    }, function(msg, code){
      console.log('===> Error creating session '  + msg + " " + code);
    });
  }


  function oncall(call){
    console.debug('on call!');
    $audioRingOut[0].pause();

    console.log("User = " + userTo);
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

    $("#btnMakeCall").css('display', 'block');
    $("#btnHangup").css('display', 'none');
   
  }

  function onCallEndedFailed() {
    console.debug('callendfailed');
    callId = null;
  }

  function sendMessages(){
    var $message = $('#txt_send').val();

   KandyAPI.Phone.sendIm($userTo, $message, function(){
      console.log('===> Send message success!');

      var $msgContainer = $("<li class='send'>");
      var $userLabel = $("<div class='contact-sender'>").text('You:');
      var $messageText = $("<p>").text($message);

      $msgContainer.append($userLabel, $messageText);
      $('#messages').append($msgContainer);

      $('#txt_send').val("");

      $(".messages").scrollTop($(".messages").get(0).scrollHeight);
    },
    function(){
      console.log('===> Failed sending Message');
    });
  }


  function recieveMessages(){
    KandyAPI.Phone.getIm(function(data){
       console.log('===> recieving messages!');
      data.messages.forEach(function(msg){
         if(msg.messageType == 'chat' && msg.contentType === 'text' && msg.message.mimeType == 'text/plain') {
            
            var $userSender   = $('<div class="contact-receiver">').text(msg.sender.user_id + ":");
            var $messageSend = $('<p>').text(msg.message.text);
            var $msgContainerSend = $("<li class='recieve'>");

            $msgContainerSend.append($userSender, $messageSend);
            $('#messages').append($msgContainerSend);
               
            $(".messages").scrollTop($(".messages").get(0).scrollHeight);
         }else{
            console.log('received ' + msg.messageType + ': ');
         }
      });
    },
    function(){
      console.log('===> Failed recieving messages!');
    });
  }

  function getOpenSessions(){
    kandy.session.getOpenSessions(function(data){
        //console.log('===> Session ID: ' + data.session_id);
        var $aSession = data.sessions;

        if($aSession.length > 0){
          $aSession.forEach(function(session){
           

           if(session.session_type == 'agent_share_screen' && session.admin_full_user_id == $userTo){
            $sessionId = session.session_id;
             console.log('session id: ' + $sessionId + ' founded!');
             kandy.session.terminate($sessionId, function(){
              console.log('===> session ended!');
             },
             function(){
                console.log('===> error ending session');
             });
           }

          });
        }else{
          console('===> No Sessions created!');
        }

    }, function(data){
        console.log("Fail to take Open Sessions");
    });
  }

  function onSessionUserJoinRequest(notification){

    $('#incoming-request').modal({
      show: 'true'
    });

    kandy.session.acceptJoinRequest(notification.session_id, notification.full_user_id);
  }

  $('#btnContactUs').on('click', function(){
    $('#modal-call').modal({
      show: 'true'
    });

  });

  $('#btnMakeCall').on('click', function(){
    
    kandy.call.makeCall($userTo, false);

    $("#btnMakeCall").css('display', 'none');
    $("#btnHangup").css('display', 'block');   
  });

  $("#btnHangup").on('click', function(){

    $("#btnMakeCall").css('display', 'block');
    $("#btnHangup").css('display', 'none');

    kandy.call.endCall(callId);
    kandy.session.terminate($sessionId);
  })

  $('#frm_send').submit(function(e){
    e.preventDefault();
    sendMessages();
  });
 
  $('#btn_acceptCobrow').click(function(e){
    e.preventDefault();
    
    //kandy.session.acceptJoinRequest($sessionId, $sessionUser);
      KandyAPI.CoBrowse.startBrowsingUser($sessionId);
      $("#btnStopShare").css('display','block');
      $('#incoming-request').modal('toggle');
    }); 


   $("#btnStopShare").click(function(){
      KandyAPI.CoBrowse.stopBrowsingUser();
      kandy.session.bootUser($sessionId, $userTo, 'stop sharing screen');
      $("#btnStopShare").css('display','none');
   });

   $("#btnClose").click(function(){
      kandy.logout();
      kandy.session.terminate($sessionId);
   });

   $("#btnMinimize").click(function(){
       $('#modal-call').modal('toggle');
   });

  kandy.login(APIKey, username, password, onLoginSuccess, onLoginFailed);

  /* KandyAPI.loginSSO('UAT2d9a0f5333e04d01827c7af6f2f2d8e5',
    function(){
      setup()
    },

    function(){
      console.log('login failed!!');
    });*/
});