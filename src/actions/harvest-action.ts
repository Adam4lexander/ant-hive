import { Action } from "./action";
import Locks from "../utils/object-locks";

interface HarvestActionMemory {
  creepId: string;
  target: string;
  container: string;
}

const locks = Locks("harvest");

Action.register({
  name: "harvest",
  entry(creep, memory: HarvestActionMemory, target) {
    memory.creepId = creep.id;
    memory.target = target.id;
    memory.container = creep.room
      .find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTAINER
      })
      .filter(c => target.pos.isNearTo(c))[0].id;

    locks.on(memory.target).acquireFor(memory.creepId);
  },
  tick(creep, memory: HarvestActionMemory) {
    const target = Game.getObjectById(memory.target) as Source;
    const container = Game.getObjectById(memory.container) as Structure<
      STRUCTURE_CONTAINER
    >;
    if (!target || !container) {
      Action.pop(creep);
      return;
    }

    if (creep.carry.energy < creep.carryCapacity) {
      if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    } else if (container) {
      if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    } else {
      Action.pop(creep);
    }
  },
  exit(creep, memory: HarvestActionMemory) {
    locks.on(memory.target).releaseFor(memory.creepId);
  }
});

function numberOfHarvesters(source: Source) {
  return locks.on(source.id).count();
}

export default { numberOfHarvesters };
