const roomInfo = require("./room-info");
const builderRole = require("./builder-role");

module.exports = function(creep) {
    
    const room = creep.room;
    if (room.energyCapacityAvailable === room.energyAvailable) {
        builderRole.run(creep);
    }
    
    function run() {
        if (creep.carry.energy < creep.carryCapacity) {
          const source = roomInfo(creep.room).bestSource();
          if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
          }
        } else {
          var targets = creep.room.find(FIND_STRUCTURES, {
            filter: structure => {
              return (
                (structure.structureType == STRUCTURE_EXTENSION ||
                  structure.structureType == STRUCTURE_SPAWN) &&
                structure.energy < structure.energyCapacity
              );
            }
          });
          if (targets.length > 0) {
            if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(targets[0], {
                visualizePathStyle: { stroke: "#ffffff" }
              });
            }
          }
        }   
    }
    
    return {
        run: run
    }
}