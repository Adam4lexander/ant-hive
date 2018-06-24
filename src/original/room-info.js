const Harvest = require("./harvest-action");

module.exports = function(room) {
    if (!room.memory.sources) {
        room.memory.sources = {};
    }
    
    const sources = room.find(FIND_SOURCES);
    for (let source of sources) {
        analyzeSource(source);
    }
    
    function analyzeSource(source) {
        if (!room.memory.sources[source.id]) {
            room.memory.sources[source.id] = {
                maxHarvesters: 3,
                currentHarvesters: []
            }
        }
    }
    
    function assignSource(creep) {
        const swampSourceId = "59f1a1fd82100e1594f392ab";
        const fastSourceId = "59f1a1fd82100e1594f392ad";
        
        if (creep.role === "upgrader") {
            creep.targetSource = swampSourceId;
        }
    }
    
    return {
        bestSource: function(creep) {
            if (creep && creep.memory.role === "builder") {
                return sources[0];
            } else {
                return sources.reduce((acc, x) => {
                    if (acc === undefined) {
                        return x;
                    } else if (Harvest.numberOfHarvesters(acc) > Harvest.numberOfHarvesters(x)) {
                        return x;
                    } else {
                        return acc;
                    }
                })
            }
        }
    }
}