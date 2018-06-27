import _ from "lodash";

declare global {
  interface Memory {
    locks: {
      [lockName: string]: ObjectLocks;
    };
  }
}
if (!Memory.locks) {
  Memory.locks = {};
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
    on(objectId: string) {
      return {
        count(): number {
          if (name in Memory.locks && objectId in Memory.locks[name]) {
            return _.size(Memory.locks[name][objectId]);
          } else {
            return 0;
          }
        },
        has(id: string): boolean {
          if (name in Memory.locks && objectId in Memory.locks[name]) {
            const lockList = Memory.locks[name][objectId];
            for (let objectLock of lockList) {
              if (objectLock.lockedBy === id) {
                return true;
              }
            }
          }
          return false;
        },
        acquireFor(id: string): void {
          if (this.has(id)) {
            return;
          }
          if (!(name in Memory.locks)) {
            Memory.locks[name] = {};
          }
          if (!(objectId in Memory.locks[name])) {
            Memory.locks[name][objectId] = [];
          }
          const lockList = Memory.locks[name][objectId];
          lockList.push({
            lockedBy: id,
            time: Game.time
          });
        },
        releaseFor(id: string): void {
          if (!this.has(id)) {
            return;
          }
          const lockList = Memory.locks[name][objectId];
          let index = 0;
          for (; index < lockList.length; index++) {
            if (lockList[index].lockedBy === id) {
              break;
            }
          }
          lockList.splice(index, 1);
          if (lockList.length === 0) {
            delete Memory.locks[name][objectId];
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
