$(document).ready(function() {

  // load socket.io client

  var socket = io();

  // on chat message form submit

  $('form').submit(function(e) {
    e.preventDefault();
    let text = $('#m').val();
    if(text) {
      let time = new Date().toLocaleString();
      let $msg = {
        text,
        time
      };
      // send new chat msg to server
      socket.emit('chat message', JSON.stringify($msg));
      // immediately remove typing msg if present
      let $messages = $('#messages');
      let $typingMsg = $messages.find('.typing-msg');
      if($typingMsg.length) {
        let alreadyScrolled = alreadyScrolledToBottom();
        $typingMsg.remove();
        scrollToBottom(alreadyScrolled);
      } // if
      // add new chat msg to client interface
      let alreadyScrolled = alreadyScrolledToBottom();
      $('#messages').append(createMsgUI($msg.text, $msg.time, true));
      scrollToBottom(alreadyScrolled);
      // reset input
      $('#m').val('');
    } // if
    return false;
  });

  $('#m').on('input', function() {
    let $this = $(this);
    let val = $this.val();
    if(val) {
      // send user typing msg to server
      socket.emit('user typing', socket.id);
    } else {
      // send user typing msg to server
      socket.emit('user stopped typing', socket.id);
    } // if/else
  });

  // on new chat message

  socket.on('chat message', onChatMessage);

  // on user connect

  socket.on('user connect', onUserConnect);

  // on user disconnect

  socket.on('user disconnect', onUserDisconnect);

  // on user typing

  socket.on('user typing', onUserTyping);

  // on user stopped typing

  socket.on('user stopped typing', onUserStoppedTyping);

  // new chat message handler

  function onChatMessage(msg) {
    var $msg = JSON.parse(msg);
    // immediately remove typing msg if present
    let $messages = $('#messages');
    let $typingMsg = $messages.find('.typing-msg');
    if($typingMsg.length) {
      let alreadyScrolled = alreadyScrolledToBottom();
      $typingMsg.remove();
      scrollToBottom(alreadyScrolled);
    } // if
    // append new msg to UI
    let alreadyScrolled = alreadyScrolledToBottom();
    $('#messages').append(createMsgUI($msg.text, $msg.time, false));
    alreadyScrolledToBottom(alreadyScrolled);
  }

  // user connect handler

  function onUserConnect(msg) {
    notify(msg);
  }

  // user disconnect handler

  function onUserDisconnect(msg) {
    notify(msg);
    // immediately remove typing msg if present
    let $messages = $('#messages');
    let $typingMsg = $messages.find('.typing-msg');
    if($typingMsg.length) {
      let alreadyScrolled = alreadyScrolledToBottom();
      $typingMsg.remove();
      scrollToBottom(alreadyScrolled);
    } // if
  }

  // user typing handler

  function onUserTyping(socketid) {
    let $messages = $('#messages');
    let $typingMsg = $messages.children('.typing-msg');
    if($typingMsg.length) {
      let $txt = $typingMsg.children('span');
      $txt.text(`${socketid} is typing`);
    } else {
      $typingMsg = document.createElement('li');
      let $txt = document.createElement('span');
      let $dots = document.createElement('img');
      $dots.src = '/typing-dots.gif';
      $txt.textContent = `${socketid} is typing`;
      $typingMsg.className += ' typing-msg';
      $typingMsg.appendChild($txt);
      $typingMsg.appendChild($dots);
      let alreadyScrolled = alreadyScrolledToBottom();
      $messages.append($typingMsg);
      scrollToBottom(alreadyScrolled);
      $typingMsg.className += ' animated slideInUp';
    } // if/else
  }

  // user stopped typing handler

  function onUserStoppedTyping(socketid) {
    let $messages = $('#messages');
    let $typingMsg = $messages.find('.typing-msg');
    if($typingMsg.length) {
      $typingMsg.removeClass('slideInUp').addClass('slideOutDown');
      setTimeout(function() {
        let alreadyScrolled = alreadyScrolledToBottom();
        $typingMsg.remove();
        scrollToBottom(alreadyScrolled);
      }, 200);
    } // if
  }

  // fix scrollbar on addition/removal of messages

  function alreadyScrolledToBottom() {
    return $("#messages")[0].scrollTop + $("#messages").innerHeight() == $("#messages")[0].scrollHeight;
  }

  function scrollToBottom(alreadyScrolled) {
    if(alreadyScrolled) $("#messages")[0].scrollTop = $("#messages")[0].scrollHeight;
  }

  // create notify UI

  function notify(msg) {
    let $container = $('#notifications');
    let $notification = $('<li></li>');
    $notification.text(msg);
    $notification.addClass('notification');
    $container.append($notification);
    $notification.addClass('animated slideInDown');
    setTimeout(function() {
      $notification.removeClass('slideInDown').addClass('slideOutUp');
      setTimeout(function() {
        $notification.removeClass('animated slideOutUp');
        setTimeout(function() {
          $notification.remove();
        }, 200)
      }, 1000);
    }, 5000);
  }

  // create new chat message UI

  function createMsgUI(text, timestamp, mine) {
    let $msg = document.createElement('li');
    let $timestamp = document.createElement('span');
    $msg.textContent = text;
    $msg.className += (mine ? ' mine' : '');
    $timestamp.textContent = timestamp;
    $timestamp.className += ' timestamp';
    $msg.appendChild($timestamp);
    return $msg;
  }
});
