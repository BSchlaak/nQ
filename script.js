
var testQueue = nQ.Factory.create('test');
nQ.Manager.publish(testQueue);

document.getElementById('send').onclick = function () {
  var message = document.getElementById('message').value;
  testQueue.enqueue(message);
};

document.getElementById('start').onclick = function () {
  window.setTimeout(function () {
    // Disable client 'B'
    clientB.unsubscribe('test');
  }, 2000);
  window.setTimeout(function () {
    // Enable client 'D'
    clientD.subscribe('test', function () {
      var queue = this;
      simulate(function () {
        var message = queue.dequeue();
        if (message !== undefined) document.getElementById('D').value += message + '\n';
      });
    });
  }, 4000);
  
  var count = parseInt(document.getElementById('count').value, 10);
  enqueueMessage(1, count);
}

function enqueueMessage(current, max) {
  if (current < max) {
    testQueue.enqueue('Message ' + current++);
    window.setTimeout(function () {
      enqueueMessage(current, max);
    }, 10);
  }
}

document.getElementById('clear').onclick = function () {
  var ids = ['A', 'B', 'C', 'D'];
  for (var i = 0 ; i < ids.length; i++) {
    var id = ids[i];
    document.getElementById(id).value = '';
  }
}

var clientA = new nQ.Client();
clientA.subscribe('test', function () {
  var queue = this;
  simulate(function () {
    var message = queue.dequeue();
    if (message !== undefined) document.getElementById('A').value += message + '\n';
  });
});

var clientB = new nQ.Client();
clientB.subscribe('test', function () {
  var queue = this;
  simulate(function () {
    var message = queue.dequeue();
    if (message !== undefined) document.getElementById('B').value += message + '\n';
  });
});

var clientC = new nQ.Client();
clientC.subscribe('test', function () {
  var queue = this;
  simulate(function () {
    var message = queue.dequeue();
    if (message !== undefined) document.getElementById('C').value += message + '\n';
  });
});

var clientD = new nQ.Client();

function simulate(func) {
  var seconds = Math.floor((Math.random() * 5) + 1);
  window.setTimeout(func, seconds * 1000);
}
