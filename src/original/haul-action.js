const Action = require("./action");

Action.register({
  name: "collect-container",
  entry(creep, memory, container) {
    if (container) {
      memory.container = container.id;
    } else {
      const containers = creep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
      const fullContainers = containers.filter(c => c.store[RESOURCE_ENERGY] > creep.carryCapacity);
      if (fullContainers.length) {
        memory.container = fullContainers[0].id;
      }
    }
  },
  tick(creep, memory) {
    const container = Game.getObjectById(memory.container);
    if (!container) {
      Action.pop(creep);
    } else if (container.store[RESOURCE_ENERGY] > 0 && creep.carry.energy < creep.carryCapacity) {
      if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container);
      }
    } else {
      Action.pop(creep);
    }
  },
  exit(creep, memory) {
    // Nothing
  }
});

Action.register({
  name: "carry-to",
  entry(creep, memory, structure) {
    memory.structure = structure.id;
  },
  tick(creep, memory) {
    const structure = Game.getObjectById(memory.structure);
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
})

Action.register({
  name: "haul",
  tick(creep, memory) {
    if (creep.carry.energy === 0) {
      Action.push(creep, "collect-container");
    } else {
      const dropAt = emptyExtension(creep.room);
      if (dropAt) {
        Action.push(creep, "carry-to", dropAt)
      } else {
        Action.pop(creep);
      }
    }
  }
})

function emptyExtension(room) {
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