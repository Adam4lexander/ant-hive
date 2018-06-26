import upgraderRole from "./upgrader-role";
import builderRole from "./builder-role";
import towerRole from "./tower-role";
import { Action, getIdleCreeps } from "./action";
import roomInfo from "./room-info";
import "./register-actions";

declare global {
  interface CreepMemory {
    role: string;
  }
}

function loop() {
  const harvesters = _.filter(
    Game.creeps,
    creep => creep.memory.role == "harvester"
  );
  const haulers = _.filter(Game.creeps, creep => creep.memory.role == "hauler");
  if (haulers.length < 2) {
    const newName = "Hauler" + Game.time;
    console.log("Spawning new hauler: " + newName);
    Game.spawns["Genesis"].spawnCreep([CARRY, CARRY, MOVE], newName, {
      memory: { role: "hauler" } as CreepMemory
    });
  } else if (harvesters.length < 2) {
    const newName = "Harvester" + Game.time;
    console.log("Spawning new harvester: " + newName);
    Game.spawns["Genesis"].spawnCreep(
      [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],
      newName,
      {
        memory: { role: "harvester" } as CreepMemory
      }
    );
  } else {
    const upgraders = _.filter(
      Game.creeps,
      creep => creep.memory.role == "upgrader"
    );
    if (upgraders.length < 3) {
      const newName = "Upgraders" + Game.time;
      console.log("Spawning new upgrader: " + newName);
      Game.spawns["Genesis"].spawnCreep(
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        newName,
        {
          memory: { role: "upgrader" } as CreepMemory
        }
      );
    }

    const builders = _.filter(
      Game.creeps,
      creep => creep.memory.role == "builder"
    );
    if (builders.length < 5) {
      const newName = "Builders" + Game.time;
      console.log("Spawning new builder: " + newName);
      Game.spawns["Genesis"].spawnCreep(
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        newName,
        {
          memory: { role: "builder" } as CreepMemory
        }
      );
    }
  }

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    if (creep.memory.role == "upgrader") {
      upgraderRole.run(creep);
    }
    if (creep.memory.role == "builder") {
      builderRole.run(creep);
    }
  }

  for (let creep of getIdleCreeps()) {
    if (creep.memory.role === "hauler") {
      Action.push(creep, "haul");
    } else if (creep.memory.role === "harvester") {
      Action.push(creep, "harvest", roomInfo(creep.room).bestSource(creep));
    }
  }

  Action.tick();

  // Do this last so other steps can do cleanup
  removeStaleMemory();
}

function removeStaleMemory(): void {
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log("Clearing non-existing creep memory:", name);
    }
  }
}

export default loop;
