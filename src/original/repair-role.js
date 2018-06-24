const roomInfo = require("./room-info");
const idleRole = require("./idle-role");

module.exports = function(creep) {
  const memory = creep.memory;

  function RepairState() {
    const repairTarget = Game.getObjectById(memory.repairTarget);

    if (
      creep.carry.energy === 0 ||
      !repairTarget ||
      repairTarget.hits === repairTarget.hitsMax
    ) {
      memory.repairing = false;
    } else if (creep.repair(repairTarget) === ERR_NOT_IN_RANGE) {
      creep.moveTo(repairTarget);
    }
  }

  function FindTargetState() {
    const repairTargets = creep.room.find(FIND_STRUCTURES, {
      filter: object => object.hits < object.hitsMax
    });
    if (repairTargets.length) {
      const lowestEnergyTarget = repairTargets.sort(
        (o1, o2) => o1.hits - o2.hits
      )[0];
      memory.repairTarget = lowestEnergyTarget.id;
      memory.repairing = true;
    } else {
      idleRole(creep).run();
    }
  }

  function HarvestState() {
    const source = roomInfo(creep.room).bestSource(creep);
    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }

  function run() {
    if (memory.repairing) {
      RepairState();
    } else if (creep.carry.energy === creep.carryCapacity) {
      FindTargetState();
    } else {
      HarvestState();
    }
  }

  return {
    run: run
  };
};
