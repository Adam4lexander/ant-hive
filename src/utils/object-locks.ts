import _ from "lodash";

declare global {
  interface Memory {
    locks: {
      [lockName: string]: ObjectLocks;
    };
  }
}

interface ObjectLocks {
  [name: string]: ObjectLock[];
}

interface ObjectLock {
  lockedBy: string;
  time: number;
}

function Locks(name: string, o: Creep | Structure) {
  return {
    count(): number {
      if (o.id in Memory.locks && name in Memory.locks[o.id]) {
        return _.size(Memory.locks[o.id][name]);
      } else {
        return 0;
      }
    },
    has(c: Creep): boolean {
      if (o.id in Memory.locks && name in Memory.locks[o.id]) {
        const lockList = Memory.locks[o.id][name];
        for (let objectLock of lockList) {
          if (objectLock.lockedBy === c.id) {
            return true;
          }
        }
      }
      return false;
    },
    acquireFor(c: Creep): void {
      if (this.has(c)) {
        return;
      }
      if (!(o.id in Memory.locks)) {
        Memory.locks[o.id] = {};
      }
      if (!(name in Memory.locks[o.id])) {
        Memory.locks[o.id][name] = [];
      }
      const lockList = Memory.locks[o.id][name];
      lockList.push({
        lockedBy: c.id,
        time: Game.time
      });
    },
    releaseFor(c: Creep): void {
      if (!this.has(c)) {
        return;
      }
      const lockList = Memory.locks[o.id][name];
      let index = 0;
      for (; index < lockList.length; index++) {
        if (lockList[index].lockedBy === c.id) {
          break;
        }
      }
      lockList.splice(index, 1);
      if (lockList.length === 0) {
        delete Memory.locks[o.id][name];
        if (_.size(Memory.locks[o.id]) === 0) {
          delete Memory.locks[o.id];
        }
      }
    }
  };
}

export default Locks;
