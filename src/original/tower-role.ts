function Tower(tower: StructureTower) {
  function run() {
    const repairTarget = getRepairTarget();
    console.log(repairTarget);
    if (repairTarget) {
      tower.repair(repairTarget);
    }
  }

  function getRepairTarget() {
    const repairTargets = tower.room.find(FIND_STRUCTURES, {
      filter: object => object.hits < object.hitsMax
    });
    if (repairTargets.length) {
      const lowestEnergyTarget = repairTargets.sort(
        (o1, o2) => o1.hits - o2.hits
      )[0];
      return lowestEnergyTarget;
    }
  }

  return {
    run: run
  };
}

export default Tower;
