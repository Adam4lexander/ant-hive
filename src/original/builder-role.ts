import roomInfo from "./room-info";
import idleRole from "./idle-role";
import repairRole from "./repair-role";

declare global {
  interface CreepMemory {
    building: boolean;
  }
}

const builderRole = {
  /** @param {Creep} creep **/
  run: function(creep: Creep) {
    if (creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say("🚧 build");
    }

    if (creep.memory.building) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          const out = creep.moveTo(targets[0], {
            visualizePathStyle: { stroke: "#ffffff" }
          });
        }
      } else {
        repairRole(creep).run();
      }
    } else {
      const source = roomInfo(creep.room).bestSource(creep);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  }
};

export default builderRole;
