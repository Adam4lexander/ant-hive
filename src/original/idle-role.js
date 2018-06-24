module.exports = function(creep) {
    function run() {
        const room = creep.room;
        const idleFlag = Game.flags.idle;
        
        creep.moveTo(idleFlag);
    }
    
    return {
        run: run
    }
}