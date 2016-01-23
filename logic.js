window.logic = {
  waiting: [],
  passengers: {},
  clearFloor: function(elevator, num) {
    this.waiting[num] = false;
    this.passengers[elevator.id][num] = false;
  },
  serve: function(elevator, target) {
    var n = this.nearest(elevator, target);
    if(n === -1)
      return false;
    this.clearFloor(elevator, n);
    elevator.goToFloor(n);
    return true;
  },
  nearest: function(elevator, target) {
    var cur = elevator.currentFloor();
    var dist = target.map(function(e, i) {
      if(!e || cur == i)
        return Infinity;
      else
        return Math.abs(cur - i);
    });
    var min = Infinity;
    dist.forEach(function(e){
      if(e > 0 && min > e)
        min = e;
    });
    if(min == Infinity)
      return -1;
    return dist.indexOf(min);
  },
  init: function(elevators, floors) {
    var self = this;
    elevators.forEach(function(elevator, i){
      elevator.checkWork = function() {
        if(elevator.loadFactor() > 0.5) {
          var handled = self.serve(elevator, self.passengers[elevator.id]);
          if(!handled)
            self.serve(elevator, self.waiting);
        } else {
          var handled = self.serve(elevator, self.waiting);
          if(!handled)
            self.serve(elevator, self.passengers[elevator.id]);
        }
      }

      elevator.id = i;
      self.passengers[i]=[];

      elevator.on("idle", function() {
        elevator.checkWork();
      });

      elevator.on('floor_button_pressed', function(num){
        self.passengers[elevator.id][num] = true;
        elevator.checkWork();
      });
    })


    floors.forEach(function(floor) {
      floor.on('up_button_pressed', function() {
        self.waiting[floor.floorNum()] = true;
        elevators.forEach(function(elevator){
          elevator.checkWork();
        });
      });
      floor.on('down_button_pressed', function() {
        self.waiting[floor.floorNum()] = true;
        elevators.forEach(function(elevator){
          elevator.checkWork();
        });
      });
    });

  },
  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here
  }
}
