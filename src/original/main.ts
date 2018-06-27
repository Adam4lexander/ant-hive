import upgraderRole from "./upgrader-role";
import towerRole from "./tower-role";
import { Action, getIdleCreeps } from "../actions/action";
import roomInfo from "./room-info";
import "../actions/register-actions";
import { numberOfHaulers, emptyExtension } from "../actions/haul-action";
import { getConstructionSite } from "../actions/build-action";
import { getMostDamagedStructure } from "../actions/repair-action";
import Locks from "../utils/object-locks";

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
  }

  for (let creep of getIdleCreeps()) {
    if (creep.memory.role === "hauler") {
      Action.push(creep, "haul", emptyExtension(creep.room));
    } else if (creep.memory.role === "harvester") {
      Action.push(creep, "harvest", roomInfo(creep.room).bestSource(creep));
    } else if (creep.memory.role === "builder") {
      const buildTarget = getConstructionSite(creep.room, 2);
      if (buildTarget) {
        Action.push(creep, "build", buildTarget);
      } else {
        const repairTarget = getMostDamagedStructure(creep.room, 2);
        if (repairTarget) {
          Action.push(creep, "repair", repairTarget);
        }
      }
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
  Locks("repair").removeStale();
  Locks("build").removeStale();
}

export default loop;
