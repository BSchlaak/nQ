var nQ = window.nQ || (function () {
  //debugger;
  var nQ = {};
  
  var queues = [];
  var subscriptions = {};
  
  nQ.Manager = new QueueManager();
  nQ.Factory = new QueueFactory();
  nQ.Client = function() {
    var self = this;
    
    var id = nQ.Manager.createUUID();
    
    self.subscribe = function () {
      debugger;
      arguments.unshift(id);
      nQ.Manager.subscribe.apply(arguments);
    };
    
    self.unsubscribe = function () {
      arguments.unshift(id);
      nQ.Manager.unsubscribe.apply(arguments);
    };
  };
  
  function Queue(name) {
    var self = this;
    
    var data = [];

    self.name = name;

    self.isEmpty = function () {
      return (data.length === 0);
    };

    self.enqueue = function (obj) {
      data.push(obj);
      notifySubscribers(self.name);
    };

    self.dequeue = function () {
      if (!self.isEmpty()) return data.shift();
    };

    self.peek = function () {
      return data[0];
    };

    self.clear = function () {
      data = [];
    };
  }

  function QueueManager() {
    var self = this;
    
    self.publish = function (queue) {
      if (isQueue(queue)) {
        queues.push(queue);
        return true;
      }
      
      return false;
    };
    
    self.createUUID = function () {
      return generateUUID();
    };
    
    self.subscribe = function () {
      var settings = parseSettings.apply(arguments);
      
      debugger;
      
      verifySubscriptions(settings.queue);
      var queueSubscriptions = getSubscriptions(settings.queue);

      queueSubscriptions.push(new Subscription(settings.client, settings.callBack));
      if (settings.success instanceof Function) settings.success.call();
    };
    
    self.unsubscribe = function () {
      var settings = parseSettings.apply(arguments);
      
      var queueSubscriptions = getSubscriptions(settings.queue);
      
      var idx = queueSubscriptions.findIndex(function (subscriber) {
        return subscriber.client === settings.client;
      });
      if (idx > -1) {
        queueSubscriptions.splice(idx, 1);
        if (settings.success instanceof Function) settings.success.call();
        return;
      }

      if (settings.error instanceof Function) settings.error.call();
    };
    
    function generateUUID () { // Public Domain/MIT
      var d = new Date().getTime();
      if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
          d += performance.now(); //use high-precision timer if available
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
  }
  
  function parseSettings() {
    var settings = {};

    if (arguments.length > 0) {
      if (arguments.length > 1) {
        if (arguments.length > 2) {
          settings = parseSettings(arguments[2]);
          if (arguments[2] instanceof Function) settings.success = arguments[2];
          settings.queue = arguments[1];
        } else {
          settings = parseSettings(arguments[1]);
        }

        if (settings[0] instanceof String) settings.client = arguments[0]; 
      } else {
        settings = (arguments[0] instanceof Object) ? arguments[0] : {};
      }
    }
    
    settings.queue = getQueue(settings.queue);
    debugger;
    return settings;
  }
  
  function QueueFactory() {
    var self = this;
    
    self.create = function (name) {
      return new Queue(name);
    }
  }
  
  function Subscription(client, trigger) {
    var self = this;
    
    self.client = client;
    self.trigger = trigger;
  }

  function isQueue(queue) {
    return queue instanceof Queue;
  }
  
  function getQueue(queue) {
    return (isQueue(queue)) ? queue : queues.find(function (q) {
      return q.name === queue;
    });
  }
  
  function getQueueName(queue) {
    return (isQueue(queue)) ? queue.name : queue;
  }
  
  function verifySubscriptions(queue) {
    queue = getQueue(queue);
    
    if (!subscriptions[queue.name]) subscriptions[queue.name] = [];
  }
  
  function getSubscriptions(queue) {
    queue = getQueue(queue);

    if (subscriptions[queue.name]) {
      return subscriptions[queue.name];
    }
    
    return [];
  }
  
  function notifySubscribers(queue) {
    queue = getQueue(queue);
    var queueSubscriptions = getSubscriptions(queue);
    
    for (var i = 0; i < queueSubscriptions.length; i++) {
      var subscription = queueSubscriptions[i];
      if (isSubscription(subscription)) {
        subscription.trigger.apply(queue);
      }
    }
  }
  
  function isSubscription(subscription) {
    return subscription instanceof Subscription;
  }

  return nQ;
})();
