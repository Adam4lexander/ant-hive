const Actions = new Map();

const ActionBase = {
  name: "noname",
  entry(creep) {
    // Not implemented
  },
  run(creep) {
    // Not implemented
  },
  exit(creep) {
    // Not implemented
  }
}

function register(action) {
  if (typeof action.name !== "string") {
    console.log("Registering an action without a name.");
    return;
  } else if (Actions.has(action.name)) {
    console.warn(`Action ${name} is redefined.`);
  }
  Actions.set(action.name, action);
}

function stackOf(creep) {
  if (typeof creep.memory.actions !== "object") {
    creep.memory.actions = [];
  }
  return creep.memory.actions;
}

function sayAction(creep) {
  creep.say(stackOf(creep).map(actionItem => actionItem.actionId).join(","));
}

function assign(creep, actionId, ...args) {
  stop(creep);
  push(creep, actionId, ...args);
}

function push(creep, actionId, ...args) {
  const stack = stackOf(creep);
  const action = Actions.get(actionId);
  if (!action) {
    console.log(`Unknown action ${actionId} in stack for creep ${creep.id}`);
    return;
  }
  const stackItem = {actionId, memory: {}};
  stack.push(stackItem);
  sayAction(creep);
  if (typeof action.entry === "function") {
    try {
      action.entry(creep, stackItem.memory, ...args);
    } catch(e) {
      console.log(`critical error ${actionId}.entry for ${creep.id}`, e);
    }
  }
}

function pop(creep) {
  const stack = stackOf(creep);
  if (stack.length < 1) {
    return;
  }
  const lastItem = stack.pop();
  const action = Actions.get(lastItem.actionId);
  if (!action) {
    console.log(`Unknown action ${actionId} in stack for creep ${creep.id}`);
    return;
  }
  sayAction(creep);
  if (typeof action.exit === "function") {
    try {
      action.exit(creep, lastItem.memory);
    } catch (e) {
      console.log(`critical error ${actionId}.exit for ${creep.id}`, e);
    }
  }
}

function stop(creep) {
  const stackLength = stackOf(creep).length;
  for (let i = 0; i < stackLength; i++) {
    pop(creep);
  }
}

function tick() {
  for (let name in Game.creeps) {
    const creep = Game.creeps[name];
    const stack = stackOf(creep);
    if (stack.length < 1) {
      continue;
    }
    if (creep.ticksToLive <= 1) {
      stop(creep);
      continue;
    }
    const lastItem = stack[stack.length - 1];
    const action = Actions.get(lastItem.actionId);
    if (!action) {
      console.log(`Unknown action ${lastItem.actionId} in stack for creep ${creep.id}`);
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

module.exports = { ActionBase, register, assign, push, pop, stop, tick, getIdleCreeps };