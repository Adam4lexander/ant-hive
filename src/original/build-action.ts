import { Action } from "./action";
import Locks from "../utils/object-locks";

interface BuildActionMemory {
  creepId: string;
  target: string;
  stage: number;
}

const locks = Locks("build");

Action.register({
  name: "build",
  entry(creep, memory: BuildActionMemory, target: Structure) {
    memory.creepId = creep.id;
    memory.target = target.id;
    memory.stage = 0;
    locks.on(target.id).acquireFor(creep.id);
  },
  tick(creep, memory: BuildActionMemory) {
    const target = Game.getObjectById<ConstructionSite>(memory.target);
    if (!target) {
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
        // Build target
        const buildResult = creep.build(target);
        if (buildResult === OK) {
          break;
        } else if (buildResult === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
          break;
        } else if (buildResult === ERR_NOT_ENOUGH_RESOURCES) {
          // Go get more resources
          memory.stage = 0;
          break;
        }
        memory.stage = 2;
      case 2:
        // Repair structure if needed
        const targetStructure = Game.getObjectById<Structure>(memory.target);
        if (
          targetStructure &&
          targetStructure.hits &&
          targetStructure.hits === 1
        ) {
          Action.push(creep, "repair", targetStructure);
          break;
        }
      default:
        Action.pop(creep);
    }
  },
  exit(creep, memory: BuildActionMemory) {
    locks.on(memory.target).releaseFor(memory.creepId);
  }
});

function numberOfBuilders(target: ConstructionSite) {
  return locks.on(target.id).count();
}

function getConstructionSite(
  room: Room,
  maxLocks: number = 1
): ConstructionSite | void {
  const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
  if (constructionSites.length) {
    return constructionSites[0];
  } else {
    return;
  }
}

export { numberOfBuilders, getConstructionSite };
