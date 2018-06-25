const Actions: { [name: string]: ActionBase<any> } = {};

declare global {
  interface CreepMemory {
    actions: ActionStackItem<any>[];
  }
}

interface ActionBase<T> {
  readonly name: string;
  readonly entry?: (creep: Creep, memory: T, ...args: any[]) => void;
  readonly tick?: (creep: Creep, memory: T) => void;
  readonly exit?: (creep: Creep | undefined, memory: T) => void;
}

interface ActionStackItem<T> {
  readonly actionId: string;
  readonly memory: T;
}

function register<T>(action: ActionBase<T>) {
  if (typeof action.name !== "string") {
    console.log("Registering an action without a name.");
    return;
  } else if (action.name in Actions) {
    console.warn(`Action ${name} is redefined.`);
  }
  Actions[action.name] = action;
}

function stackOf(creep: Creep) {
  if (typeof creep.memory.actions !== "object") {
    creep.memory.actions = [];
  }
  return creep.memory.actions;
}

function sayAction(creep: Creep) {
  creep.say(
    stackOf(creep)
      .map(actionItem => actionItem.actionId)
      .join(",")
  );
}

function assign(creep: Creep, actionId: string, ...args: any[]) {
  stop(creep);
  push(creep, actionId, ...args);
}

function push(creep: Creep, actionId: string, ...args: any[]) {
  const stack = stackOf(creep);
  const action = Actions[actionId];
  if (!action) {
    console.log(`Unknown action ${actionId} in stack for creep ${creep.id}`);
    return;
  }
  const stackItem = { actionId, memory: {} };
  stack.push(stackItem);
  sayAction(creep);
  if (typeof action.entry === "function") {
    try {
      action.entry(creep, stackItem.memory, ...args);
    } catch (e) {
      console.log(`critical error ${actionId}.entry for ${creep.id}`, e);
    }
  }
}

function pop(creep: Creep) {
  const stack = stackOf(creep);
  const lastItem = stack.pop();
  if (!lastItem) {
    return;
  }
  const action = Actions[lastItem.actionId];
  if (!action) {
    console.log(
      `Unknown action ${lastItem.actionId} in stack for creep ${creep.id}`
    );
    return;
  }
  sayAction(creep);
  if (typeof action.exit === "function") {
    try {
      action.exit(creep, lastItem.memory);
    } catch (e) {
      console.log(
        `critical error ${lastItem.actionId}.exit for ${creep.id}`,
        e
      );
    }
  }
}

function stop(creep: Creep) {
  const stackLength = stackOf(creep).length;
  for (let i = 0; i < stackLength; i++) {
    pop(creep);
  }
}

function removeStaleActionStack(stack: ActionStackItem<any>[]) {
  while (stack.length > 0) {
    const stackItem = stack[stack.length - 1];
    const action = Actions[stackItem.actionId];
    if (!action) {
      console.log(`Unknown action ${stackItem.actionId} in stale stack.`);
      return;
    }
    if (typeof action.exit === "function") {
      try {
        action.exit(undefined, stackItem.memory);
      } catch (e) {
        console.log(
          `critical error ${stackItem.actionId}.exit in stale stack`,
          e
        );
      }
      stack.pop();
    }
  }
}

function tick() {
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      // This creep has died, need to 'exit()' each action on its stack.
      removeStaleActionStack(Memory.creeps[name].actions);
      continue;
    }
    const creep = Game.creeps[name];
    const stack = stackOf(creep);
    if (stack.length < 1) {
      continue;
    }
    const lastItem = stack[stack.length - 1];
    const action = Actions[lastItem.actionId];
    if (!action) {
      console.log(
        `Unknown action ${lastItem.actionId} in stack for creep ${creep.id}`
      );
      return;
    }
    if (typeof action.tick === "function") {
      try {
        action.tick(creep, lastItem.memory);
      } catch (e) {
        console.log(`critical error ${action.name}.tick for ${creep.id}`, e);
      }
    }
  }
}

function getIdleCreeps() {
  return _.filter(Game.creeps, creep => stackOf(creep).length === 0);
}

const Action = {
  register,
  assign,
  push,
  pop,
  stop,
  tick
};

export { Action, getIdleCreeps };
