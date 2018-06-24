import { Action } from "./action";

declare global {
  interface Memory {
    harvesters: { [name: string]: string[] };
  }
}

interface HarvestActionMemory {
  target: string;
  container: string;
}

const harvesters = Memory.harvesters;

Action.register({
  name: "harvest",
  entry(creep, memory: HarvestActionMemory, target) {
    memory.target = target.id;
    memory.container = creep.room
      .find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTAINER
      })
      .filter(c => target.pos.isNearTo(c))[0].id;

    if (memory.target in harvesters) {
      harvesters[memory.target].push(creep.id);
    } else {
      harvesters[memory.target] = [creep.id];
    }
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
    harvesters[memory.target] = harvesters[memory.target].filter(
      (id: string) => id !== creep.id
    );
    if (harvesters[memory.target].length === 0) {
      delete harvesters[memory.target];
    }
  }
});

function numberOfHarvesters(source: Source) {
  return harvesters[source.id] ? harvesters[source.id].length : 0;
}

export default { numberOfHarvesters };
