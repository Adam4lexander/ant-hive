import { Action } from "./action";
import Locks from "../utils/object-locks";

interface RepairActionMemory {
  creepId: string;
  target: string;
  stage: number;
}

const locks = Locks("repair");

Action.register({
  name: "repair",
  entry(creep, memory: RepairActionMemory, target: Structure) {
    memory.creepId = creep.id;
    memory.target = target.id;
    memory.stage = 0;
    locks.on(target.id).acquireFor(creep.id);
  },
  tick(creep, memory: RepairActionMemory) {
    const target = Game.getObjectById<Structure>(memory.target);
    if (!target || target.hits === target.hitsMax) {
      Action.pop(creep);
      return;
    }

    switch (memory.stage) {
      case 0:
        // Collect energy
        if (creep.carry.energy < creep.carryCapacity) {
          Action.push(creep, "collect-container");
          break;
        }
        memory.stage = 1;
      case 1:
        // Repair target
        const repairResult = creep.repair(target);
        if (repairResult === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
          break;
        } else if (repairResult === OK) {
          break;
        }
        memory.stage = 2;
      default:
        // Done
        Action.pop(creep);
    }
  },
  exit(creep, memory: RepairActionMemory) {
    locks.on(memory.target).releaseFor(memory.creepId);
  }
});

function numberOfRepairers(target: Structure) {
  return locks.on(target.id).count();
}

function getMostDamagedStructure(
  room: Room,
  maxLocks: number = 1
): Structure | void {
  const damagedStructures = room.find<Structure>(FIND_STRUCTURES, {
    filter: struct =>
      struct.hits < struct.hitsMax && locks.on(struct.id).count() < maxLocks
  });
  if (damagedStructures.length) {
    return damagedStructures.sort((s1, s2) => s1.hits - s2.hits)[0];
  } else {
    return;
  }
}

export { numberOfRepairers, getMostDamagedStructure };
