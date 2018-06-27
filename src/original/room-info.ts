import Harvest from "../actions/harvest-action";

declare global {
  interface RoomMemory {
    sources: {
      [name: string]: {
        maxHarvesters: Number;
        currentHarvesters: string[];
      };
    };
  }
}

function RoomInfo(room: Room) {
  if (!room.memory.sources) {
    room.memory.sources = {};
  }

  const sources = room.find(FIND_SOURCES);
  for (let source of sources) {
    analyzeSource(source);
  }

  function analyzeSource(source: Source) {
    if (!room.memory.sources[source.id]) {
      room.memory.sources[source.id] = {
        maxHarvesters: 3,
        currentHarvesters: []
      };
    }
  }

  return {
    bestSource: function(creep: Creep) {
      if (creep && creep.memory.role === "builder") {
        return sources[0];
      } else {
        return sources.reduce((acc, x) => {
          if (acc === undefined) {
            return x;
          } else if (
            Harvest.numberOfHarvesters(acc) > Harvest.numberOfHarvesters(x)
          ) {
            return x;
          } else {
            return acc;
          }
        });
      }
    }
  };
}

export default RoomInfo;
