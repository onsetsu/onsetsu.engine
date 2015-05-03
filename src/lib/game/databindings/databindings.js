DataBindings = {
  watch: function(obj, attr, callback) {
    var value = obj[attr];
    Object.defineProperty(obj, attr, {
        get: function() {
          return value;
        },
        set: function(newValue) {
          value = newValue;
          callback();
          return value;
        }
    });
  }
};
