import 'materialize-js';
import $ from 'jquery';
import _ from 'underscore';

import ExternalAgents from './rethink/externalAgents';

var callBtn = document.querySelector('.call');
var cancelBtn = document.querySelector('.cancel');
var roomField = document.querySelector('.room-id');
var idHash = document.querySelector('.hash');

var externalAgent = new ExternalAgents();

externalAgent.addEventListener('token:created', function(token) {
  idHash.textContent = token;
});

externalAgent.addEventListener('call:incoming', function(data) {

  var modal = $('#modal1').leanModal();
  var actions = modal[0].querySelectorAll('.modal-action');

  var modalAction = function(e) {

    var target = e.currentTarget;

    // console.log(target, target.getAttribute('name'));

    if (target.getAttribute('name') === 'answer') {
      // console.log('AQUI:', externalAgent);
      externalAgent.accept();
    }

    modal.closeModal();

    e.preventDefault();
  };

  _.each(actions, function(el, index) {
    // console.log(el, index);
    el.addEventListener('click', modalAction);
  });

  modal.openModal();

});

callBtn.addEventListener('click', function(e) {

  var room = roomField.value;

  if (room.length) {

    externalAgent.getMedia().then(function(stream) {
      externalAgent.callTo(room, stream);
    });


  }

  e.preventDefault();

});

externalAgent.addEventListener('remote:stream:added', function(stream) {

  var holder = document.querySelector('.main-video');
  var video = document.createElement('video');
  video.width = 240;
  video.height = 160;
  video.src = stream;
  video.play();

  holder.appendChild(video);

  // document.querySelector('.remote-video').src = stream;
  // console.log('remote:stream:added', stream);
});

externalAgent.addEventListener('local:stream:added', function(stream) {
  document.querySelector('.local-video').src = URL.createObjectURL(stream);
  // console.log('local:stream:added');
});
