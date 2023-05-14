this.store = {
  delay: 0,
};

this.$api.datastore.import(this.store);

settings_define({
  delay: {
    type: "text",
    label: "Delay between actions (ms)",
    value: this.store.delay,
    changed: value => {
      const delay = Number(value);
      if (Number.isInteger(delay) && delay >= 0) {
        this.store.delay = delay;
        this.$api.datastore.export(this.store);
      }
    },
  },
});

const commandList = [
  {
    action: 62301,
    delay: () => this.store.delay + 100,
  },
  {
    action: 61601,
    delay: () => this.store.delay + 100,
  },
  {
    action: 61201,
    delay: () => this.store.delay + 100,
  },
  {
    action: 61701,
    delay: () => this.store.delay + 100,
  },
];

const getWheelChockState = () => this.$api.variables.get("L:NGXWheelChocks", "number");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run(() => {
  (async () => {
    for (const command of commandList) {
      this.$api.variables.set("K:ROTOR_BRAKE", "number", command.action);

      const delay = command.delay();
      if (delay > 0) {
        await timeout(delay);
      }
    }
  })();

  return false;
});

style(() => {
  return getWheelChockState() ? "active" : null;
});
