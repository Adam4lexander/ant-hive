import { Action } from "./action";
import Locks from "../utils/object-locks";

interface CollectActionMemory {
  container: string;
}

Action.register({
  name: "collect-container",
  entry(creep, memory: CollectActionMemory, container: StructureContainer) {
    if (container) {
      memory.container = container.id;
    } else {
      const containers = creep.room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTAINER
      }) as StructureContainer[];
      const fullContainers = containers.filter(
        c => c.store[RESOURCE_ENERGY] > creep.carryCapacity
      );
      if (fullContainers.length) {
        memory.container = fullContainers[0].id;
      }
    }
  },
  tick(creep, memory: CollectActionMemory) {
    const container = Game.getObjectById(
      memory.container
    ) as StructureContainer;
    if (!container) {
      Action.pop(creep);
    } else if (
      container.store[RESOURCE_ENERGY] > 0 &&
      creep.carry.energy < creep.carryCapacity
    ) {
      if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container);
      }
    } else {
      Action.pop(creep);
    }
  },
  exit(creep, memory: CollectActionMemory) {
    // Nothing
  }
});

interface CarryActionMemory {
  structure: string;
}

Action.register({
  name: "carry-to",
  entry(creep, memory: CarryActionMemory, structure: Structure) {
    memory.structure = structure.id;
  },
  tick(creep, memory: CarryActionMemory) {
    const structure = Game.getObjectById(memory.structure) as Structure;
    if (!structure) {
      Action.pop(creep);
    } else if (creep.carry.energy > 0) {
      const result = creep.transfer(structure, RESOURCE_ENERGY);
      if (result == ERR_NOT_IN_RANGE) {
        creep.moveTo(structure, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      } else if (result !== OK) {
        Action.pop(creep);
      }
    } else {
      Action.pop(creep);
    }
  }
});

interface HaulActionMemory {
  creepId: string;
  target: string;
}

const haulLocks = Locks("haul");

Action.register({
  name: "haul",
  entry(creep, memory: HaulActionMemory, target: Structure) {
    memory.creepId = creep.id;
    memory.target = target.id;
    haulLocks.on(target.id).acquireFor(creep.id);
  },
  tick(creep, memory: HaulActionMemory) {
    if (creep.carry.energy === 0) {
      Action.push(creep, "collect-container");
    } else {
      const dropAt = Game.getObjectById(memory.target);
      if (dropAt) {
        Action.push(creep, "carry-to", dropAt);
      } else {
        Action.pop(creep);
      }
    }
  },
  exit(creep, memory: HaulActionMemory) {
    haulLocks.on(memory.target).releaseFor(memory.creepId);
  }
});

function numberOfHaulers(target: Structure) {
  return haulLocks.on(target.id).count();
}

function emptyExtension(room: Room) {
  const targets = room.find(FIND_STRUCTURES, {
    filter: structure => {
      return (
        (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN) &&
        structure.energy < structure.energyCapacity
      );
    }
  });
  if (targets.length) {
    return targets[0];
  } else {
    return undefined;
  }
}

export { numberOfHaulers, emptyExtension };
