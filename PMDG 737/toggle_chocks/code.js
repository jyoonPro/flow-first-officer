this.store = {
  delay: "0",
};

this.$api.datastore.import(this.store);

settings_define({
  delay: {
    type: "text",
    label: "Delay between actions (ms)",
    value: this.store.delay,
    changed: value => {
      this.store.delay = value;
      this.$api.datastore.export(this.store);
    },
  },
});

const commandList = [
  {
    action: 62301,
    delay: 100,
  },
  {
    action: 61601,
    delay: 100,
  },
  {
    action: 61201,
    delay: 100,
  },
  {
    action: 61701,
    delay: 100,
  },
];

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run(() => {
  (async () => {
    for (const command of commandList) {
      this.$api.variables.set("K:ROTOR_BRAKE", "number", command.action);

      let delay = command.delay;
      if (Number(this.store.delay) > 0) {
        delay += Number(this.store.delay) || 450;
      }

      if (delay > 0) {
        await timeout(delay);
      }
    }
  })();

  return false;
});
