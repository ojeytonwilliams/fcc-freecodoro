(function() {
  "use strict";
  
  var beep = new Audio('https://assets.olivereytonwilliams.com/audio/beep.m4a');
  var beepbeep = new Audio('https://assets.olivereytonwilliams.com/audio/beepbeep.m4a');
  
  function Timer(dur, update, onTimerDone) {
    if (!dur) throw new Error("Timer must have a non-zero duration");
    var ticking = false;
    var paused = false;
    var pauseStart = null;
    var startTime = null;
    var duration = dur;
    var timerId = null;

    this.getDuration = function() {
      return duration;
    };

    this.toggle = function() {
      if (paused) {
        this.unpause();
      } else if (ticking) {
        this.pause();
      } else {
        this.start();
      }
    };

    this.start = function() {
      console.log("start");
      ticking = true;
      paused = false;
      startTime = Date.now();

      this.startTicking();
    };

    this.stop = function() {
      console.log("stop");
      ticking = false;
      paused = false;
      this.stopTicking();
    };

    this.pause = function() {
      console.log("pause");
      paused = true;
      ticking = false;
      pauseStart = Date.now();
      this.stopTicking();
    };

    this.unpause = function() {
      console.log("unpause");
      paused = false;
      ticking = true;
      var pausedFor = Date.now() - pauseStart;
      pauseStart = null;
      startTime += pausedFor;
      this.startTicking();
    };

    this.startTicking = function() {
      console.log("starting ticking");
      timerId = window.setInterval(() => {
        
        var elapsed = Date.now() - startTime;
      //  console.log("Elapsed time at start of tick,", elapsed);
        if (elapsed >= duration) {
          console.log("Calling stop");
          // we set it to zero, because of how Vue listens to data
          // changes.  Specifically, it reacts somewhat later.
          update(0, duration);
          this.stop();
          // This callback lets listeners know that the timer got to zero
          console.log("onTimerDone", onTimerDone);
          if (onTimerDone) {
            console.log("about to call onTimerDone");
            onTimerDone();
          }
        } else {
          update(elapsed, duration);
        }
      }, 100);
    };

    this.stopTicking = function() {
  //    console.log("stopping ticking");
      window.clearInterval(timerId);
      timerId = null;
    };

    // This initialises the display, so that no time has elapsed.
    this.displayInitial = function() {
      update(0, duration);
    };

    this.hasStarted = function() {
      return ticking || paused;
    };
  }
  var minutesToTime = 25; 
  var minutesForBreak = 5;
  var toMillis = 1000*60; // should be 1000*60, for minutes
  var duration = minutesToTime * toMillis;
  var breakDuration = minutesForBreak * toMillis;
  var startTime = Date.now();
  var breakStart = null;

  var display = {
    elapsed: null,
    displayTime: time(duration),
    breakTime: time(breakDuration)
  };

  function onTimerDone() {
    console.log("in onTimerDone, about to toggle break timer.");
     beep.load();
     beep.play();
    data.breakTimer.toggle();
  }
  
  function onBreakTimerDone() {
    console.log("Beep?");
    beepbeep.load();
    beepbeep.play();
  }
  var data = {
    timer: new Timer(duration, updateDisplay, onTimerDone),
    breakTimer: new Timer(breakDuration, updateBreak, onBreakTimerDone),
    pomoStyle: {
      height: 0
    },
    display: display,
    breakIncDelay: false,
  };

  function updateDisplay(elapsed, duration) {
    display.elapsed = elapsed;
    display.displayTime = time(duration - elapsed);
  }

  function updateBreak(elapsed, duration) {
    display.elapsed = elapsed;
    display.breakTime = time(duration - elapsed);
  }

  var app = new Vue({
    el: "#app",
    data: data,
    methods: {
      toggleTicking: function() {
        // the small subtlety here is that we have to look at the break timer to see what
        // we should be toggling.  This is because, while it's clear that if the timer hasn't started, we should toggle it, it's not clear what we should do if it *has* started.  It may have finished, it may not.  In the first case we should toggle it and in the second case we should toggle the break timer. 

        if (this.breakTimer.hasStarted()) {
          this.breakTimer.toggle();
        } else {
          this.timer.toggle();
        }
      },
      decreaseSession: function() {   
        if (minutesToTime > 5) minutesToTime--;
        this.replaceTimer();
        this.decDelay = window.setTimeout(() => {
          this.dec = window.setInterval(() => {
            if (minutesToTime > 5) minutesToTime--;
        this.replaceTimer();
          }, 150);
        },250);
      }, 
      stopDec: function() {
        window.clearInterval(this.decDelay);
        window.clearInterval(this.dec);
      },
      increaseSession: function() {
        minutesToTime++;
        // NOTE: this could be DRY'ed out by creating an object
        // that had incDelay, inc, minutesForBreak and replaceTimer()
        this.incDelay = window.setTimeout(() => {
          this.inc = window.setInterval(() => {
            minutesToTime++;
            this.replaceTimer();
          }, 150);
        },250);
        this.replaceTimer();
      },  
      stopInc: function() {
        window.clearInterval(this.incDelay);
        window.clearInterval(this.inc);
      },
      increaseBreak: function() {
        minutesForBreak++;
        // NOTE: this could be DRY'ed out by creating an object
        // that had incDelay, inc, minutesForBreak and replaceTimer()
        this.breakIncDelay = window.setTimeout(() => {
          this.breakInc = window.setInterval(() => {
            minutesForBreak++;
            this.replaceBreakTimer();
          }, 150);
        },250);
        this.replaceBreakTimer();
      },
      stopIncBreak: function() {
        window.clearInterval(this.breakIncDelay);
        window.clearInterval(this.breakInc);
      },
      decreaseBreak: function() {
        if (minutesForBreak > 1) minutesForBreak--;
        this.replaceBreakTimer();       
        this.breakDecDelay = window.setTimeout(() => {
          this.breakDec = window.setInterval(() => {
           if (minutesForBreak > 1) minutesForBreak--;
           this.replaceBreakTimer();   
          }, 150);
        },250);
      },
        stopDecBreak: function() {
        window.clearInterval(this.breakDecDelay);
        window.clearInterval(this.breakDec);
      },
      time: time,
      replaceTimer: function() {
        this.timer.stop();
        this.timer = new Timer(minutesToTime * toMillis, updateDisplay);
        this.timer.displayInitial();
      },
      replaceBreakTimer: function() {
        this.breakTimer.stop();
        this.breakTimer = new Timer(minutesForBreak * toMillis, updateBreak, onBreakTimerDone);
        this.breakTimer.displayInitial();
      }
    },
    watch: {
      "display.elapsed": function(elapsed) {
   //     console.log("display.elapsed changed", elapsed);
    //    console.log("breakTimer has started", this.breakTimer.hasStarted());
          
        if (this.breakTimer.hasStarted()) {
          var duration = this.breakTimer.getDuration();
          this.pomoStyle = {
            height: Math.round((duration - elapsed) / duration * 100) + "px"
          };
        } else {
          var duration = this.timer.getDuration();
          this.pomoStyle = {
            height: Math.round(elapsed / duration * 100) + "px"
          };
        }
      }
    }
  });
  function time(ms) {
    // var stripZeros = /^0+:0|^0+:?/;
    var stripZeroes = /^0+:?0?/;
    var time = new Date(ms).toISOString().slice(11, -5);
    // return time;
    return time.replace(stripZeroes, "");
  }
})();

