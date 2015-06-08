$(function(){
	var callId;
	var $audioRingIn = $('<audio>', { loop: 'loop', id: 'ring-in' });
    var $audioRingOut = $('<audio>', { loop: 'loop', id: 'ring-out' });

    var $apiKey = 'DAK00068abf414f4e6fa818a123a1f3fd4d';
    var $userTo = 'sender@oliveryepez.gmail.com';
      
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
      	 localVideoContainer: $('#video_container')[0],
      	 remoteVideoContainer: $('#incoming-video')[0],

      	 listeners: {
            /********* Login **********/
            loginsuccess: onLoginSuccess,
            loginfailed: onLoginFailed,

            /********* Call Listeners **********/
            callincoming: onCallIncoming,
            oncall: onCall,
            callanswered: onCallAnswer,
            callended: onCallTerminate
           /* callrejected: onCallRejected*/
          }
      });

      function onLoginSuccess(){
      	console.log("===> Login Success!");

      	$("#login-form").css("display", "none");
      	$('#oncall_screen').css('display', 'block');

      	setInterval(recieveMessages, 1000);
      }

      function onLoginFailed(){
		console.log("===> Login Failed!");      	
      }

      function onKandyLogout(){
      	console.log('===> User Logout!');

      	$("#login-form").css("display", "block");
      	$('#oncall_screen').css('display', 'none');
      }


      function onCallIncoming(call, isAnonymous){
      	console.log('===> Incoming call!');
      	
      	$('#modal_call').modal({
      			show: 'true'
      	});

      	$audioRingIn[0].play();
      	callId = call.getId();

      	if (!isAnonymous) {
      		$('#caller').text(call.callerName);
      	}else{
      		$('#caller').text('Anonymous!');
      	}
      }

       function onCallAnswer(call) {
        callId = call.getId();

        $('#modal_call').modal({
      			show: 'false'
      	});
      
        $audioRingOut[0].pause();
        $audioRingIn[0].pause();
      }

      function onCall(call) {
        console.log('===> oncall');
        $audioRingOut[0].pause();

        $('#modal_call').modal({
      			show: 'false'
      	});
       
      }

       function onCallTerminate(call) {
        console.log('===> call ended');
        callId = null;

        $audioRingIn[0].pause();
        $audioRingOut[0].pause();
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

      $('#frmLogin').submit(function(e){
      	e.preventDefault();
      	var $username = $('#txt_username').val();
    	var $password = $('#txt_password').val();

      	kandy.login($apiKey, $username, $password, onLoginSuccess, onLoginFailed);
      });


      $('#frm_send').submit(function(e){
	    e.preventDefault();
	    sendMessages();
  	   });

      $('#btn_signout').click(function(){
      		
      	kandy.logout(onKandyLogout);	
      });

       $('#btn_show').click(function(){
      		$('#modal_call').modal({
      			show: 'true'
      		});
      });

      $('#btn_answer').click(function() {
        kandy.call.answerCall(callId, true);
      });

      $('#btn_hangup').click(function() {
        KandyAPI.Phone.endCall(callId);
      });

      $('#btn_reject').click(function() {
        KandyAPI.Phone.rejectCall(callId);
      });

});