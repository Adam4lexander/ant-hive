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

function Locks(name: string) {
  return {
    removeStale(): void {
      for (let id in Memory.locks[name]) {
        if (!Game.getObjectById(id)) {
          delete Memory.locks[name][id];
        }
      }
    },
    on(o: Creep | Structure | Source) {
      return {
        count(): number {
          if (name in Memory.locks && o.id in Memory.locks[name]) {
            return _.size(Memory.locks[name][o.id]);
          } else {
            return 0;
          }
        },
        has(c: Creep): boolean {
          if (name in Memory.locks && o.id in Memory.locks[name]) {
            const lockList = Memory.locks[name][o.id];
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
          if (!(name in Memory.locks)) {
            Memory.locks[name] = {};
          }
          if (!(o.id in Memory.locks[name])) {
            Memory.locks[name][o.id] = [];
          }
          const lockList = Memory.locks[name][o.id];
          lockList.push({
            lockedBy: c.id,
            time: Game.time
          });
        },
        releaseFor(c: Creep): void {
          if (!this.has(c)) {
            return;
          }
          const lockList = Memory.locks[name][o.id];
          let index = 0;
          for (; index < lockList.length; index++) {
            if (lockList[index].lockedBy === c.id) {
              break;
            }
          }
          lockList.splice(index, 1);
          if (lockList.length === 0) {
            delete Memory.locks[name][o.id];
            if (_.size(Memory.locks[name]) === 0) {
              delete Memory.locks[name];
            }
          }
        }
      };
    }
  };
}

export default Locks;
