// --------------------------------------------------------------------------------
// Timeline
// --------------------------------------------------------------------------------

var TimelineSlot = function(delay) {
  this.delay = delay;
  this.actions = [];
};
TimelineSlot.prototype.addAction = function(action) {
  this.actions.push(action);
  //action.timelineSlot = this;
};
TimelineSlot.prototype.removeAction = function(action) {
  if(action) {
    var index = this.actions.indexOf(action);
    this.actions.splice(index, 1);
  }
};
TimelineSlot.prototype.toString = function() {
  return 'SLOT ' + this.actions.length + ' actions';
};

var Timeline = function Timeline() {
  this.actions = [];

  var zeroTimelineSlot = new TimelineSlot(0);
  this.negativeTimelineSlots = [zeroTimelineSlot];
  this.positiveTimelineSlots = [zeroTimelineSlot];
};
Timeline.prototype.addAction = function(action) {
  this.actions.push(action);
  this.getSlotAt(action.baseDelay).addAction(action);
};
Timeline.prototype.getSlotAt = function(delay) {
  function getOrCreate(arr, index) {
    if(arr[index]) {
      return arr[index];
    }
    return arr[index] = new TimelineSlot(delay);
  }
  if(delay < 0) {
    return getOrCreate(this.negativeTimelineSlots, -delay);
  } else {
    return getOrCreate(this.positiveTimelineSlots, delay);
  }
};
Timeline.prototype.nextAction = function() {
  // search the TimelineSlot with the lowest negative delay that contains an action
  var action = _.reduceRight(this.negativeTimelineSlots, function(action, timelineSlot) {
    if(action) { return action; }
    return timelineSlot.actions[0];
  }, undefined);

  return action;
};
Timeline.prototype.getTimelineSlotFor = function(action) {
  var timelineSlot = _(this.negativeTimelineSlots).find(function(timelineSlot) {
    if(!timelineSlot) { return false; }
    return _(timelineSlot.actions).contains(action);
  }) || _(this.positiveTimelineSlots).find(function(timelineSlot) {
    if(!timelineSlot) { return false; }
    return _(timelineSlot.actions).contains(action);
  });
  return timelineSlot;
};
// advances all actions by 1 time unit
Timeline.prototype.advance = function() {
  var startIndex = -(this.negativeTimelineSlots.length - 1);
  var endIndex = this.positiveTimelineSlots.length - 1;
  for(var index = startIndex; index <= endIndex; index += 1) {
    var slot = this.getSlotAt(index);
    if(!_.isEmpty(slot.actions)) {
      var action = undefined,
          prevSlot = this.getSlotAt(index-1);
      while(action = slot.actions.shift()) {
        prevSlot.addAction(action);
      }
    }
  }
};
Timeline.prototype.resetAction = function(action) {
  var timelineSlot = this.getTimelineSlotFor(action);
  if(timelineSlot) {
    timelineSlot.removeAction(action);
  }

  this.getSlotAt(action.baseDelay).addAction(action);
};
Timeline.prototype.removeAction = function(action) {
  var timelineSlot = this.getTimelineSlotFor(action);
  if(timelineSlot) {
    timelineSlot.removeAction(action);
  }
  if(action) {
    var index = this.actions.indexOf(action);
    this.actions.splice(index, 1);
  }
};
Timeline.prototype.print = function() {
  var str = '';
  var startIndex = this.negativeTimelineSlots.length - 1;
  var endIndex = this.positiveTimelineSlots.length - 1;
  for(var index = startIndex; index > 0; index -= 1) {
    str += '-' + index + ' ' + this.negativeTimelineSlots[index] + ' \n';
  }
  for(var index = 0; index <= endIndex; index += 1) {
    str += '+' + index + ' ' + this.positiveTimelineSlots[index] + ' \n';
  }
  console.log(str);
};

var Action = function Action(executable, baseDelay, recurring, character) {
  this.executable = executable;
  this.baseDelay = baseDelay;
  this.recurring = recurring;
  this.character = character;
};

// TODO: add toString methods
// Recurring enum
Action.oneShot = {};
Action.recurring = {};

