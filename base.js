var Entity = function(code) {
  this.code = code;
  this.enable = true;
  this.selected = false;
}

Entity.prototype.dependsOn = function(other) {
  this.enable = other.enable && other.selected;
  this.selected = this.enable && this.selected;
}

Entity.prototype.repels = function(other) {
  if(this.enable && this.selected) {
    other.enable = false;
    other.selected = false;
  } else if(other.enable && other.selected) {
    this.enable = false;
    this.selected = false;
  }
}

Entity.evaluate = function(data) {
  var entities = {};
  for(var i = 0; i < data.entities.length; i++) {
    var entity = data.entities[i];
    var obj = new Entity(entity.code);
    obj.enable = entity.enable;
    obj.selected = entity.selected;
    entities[entity.code] = obj;
  }

  for(var i = 0; i < data.rules.length; i++) {
    var rule = data.rules[i];
  
    var matcher = null;
    if(matcher = rule.match(/^(.+?) => (.+?)$/)) {
      var left = entities[matcher[1]];
      var right = entities[matcher[2]];
      left.dependsOn(right);
    } else if(matcher = rule.match(/^(.+?) >=< (.+?)$/)) {
      var left = entities[matcher[1]];
      var right = entities[matcher[2]];
      left.repels(right);
    }
  }

  return entities;
}

var rules = [
  "B => A",
  "C => A",
  "B >=< C"
];

function refresh() {
  var entities = [];
  $("#coverages input[type='checkbox']").each(function(){
    entities.push({
      "code" : this.id,
      "enable" : !this.disabled,
      "selected" : this.checked
    });
  });
  console.log("before:" + JSON.stringify(entities, undefined, 2));
  var newStatus = Entity.evaluate({
    "entities" : entities,
    "rules" : rules
  });
  console.log("after:" + JSON.stringify(newStatus, undefined, 2));
  for(var code in newStatus) {
    var checkbox = $("#" + code);
    checkbox.prop('disabled', !newStatus[code].enable);
    checkbox.prop('checked', newStatus[code].selected);
  }
}

$(document).ready(function(){
  $("#coverages").on("change", ":checkbox", function() {
    refresh();
  });
  refresh();
});
