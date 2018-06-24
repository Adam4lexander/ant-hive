const harvesterRole = require("./harvester-role");
const upgraderRole = require("./upgrader-role");
const builderRole = require("./builder-role");
const towerRole = require("./tower-role");
const Action = require("./action");
const roomInfo = require("./room-info");
require("./register-actions");

function loop() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log("Clearing non-existing creep memory:", name);
    }
  }

  const harvesters = _.filter(
    Game.creeps,
    creep => creep.memory.role == "harvester"
  );
  const haulers = _.filter(
    Game.creeps,
    creep => creep.memory.role == "hauler"
  );
  if (haulers.length < 2) {
    const newName = "Hauler" + Game.time;
    console.log("Spawning new hauler: " + newName);
    Game.spawns["Genesis"].spawnCreep(
      [CARRY, CARRY, MOVE],
      newName,
      {
        memory: { role: "hauler" }
      }
    )
  } else if (harvesters.length < 2) {
    const newName = "Harvester" + Game.time;
    console.log("Spawning new harvester: " + newName);
    Game.spawns["Genesis"].spawnCreep(
      [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],
      newName,
      {
        memory: { role: "harvester" }
      }
    );
  }  else {
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
          memory: { role: "upgrader" }
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
          memory: { role: "builder" }
        }
      );
    }
  }

  const towers = _.filter(
    Game.structures,
    struct => struct.structureType === STRUCTURE_TOWER
  );
  towers.forEach(tower => towerRole(tower).run());

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    if (creep.memory.role == "upgrader") {
      upgraderRole.run(creep);
    }
    if (creep.memory.role == "builder") {
      builderRole.run(creep);
    }
  }

  for (let creep of Action.getIdleCreeps()) {
    if (creep.memory.role === "hauler") {
      Action.push(creep, "haul");
    } else if (creep.memory.role === "harvester") {
      Action.push(creep, "harvest", roomInfo(creep.room).bestSource(creep));
    }
  }

  Action.tick();
}

exports.loop = loop;
