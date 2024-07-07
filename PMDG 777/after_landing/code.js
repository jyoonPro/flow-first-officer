this.store = {
  enable_speedbrake: false,
  enable_flaps: false,
  turnoff_lights_off: true,
  wing_lights_off: false,
  stop_timer: true,
  delay: 600,
};

this.$api.datastore.import(this.store);

settings_define({
  enable_spoilers: {
    type: "checkbox",
    label: "Enable speedbrake retraction",
    value: this.store.enable_speedbrake,
    changed: value => {
      this.store.enable_speedbrake = value;
      this.$api.datastore.export(this.store);
    },
  },
  enable_flaps: {
    type: "checkbox",
    label: "Enable flaps retraction",
    value: this.store.enable_flaps,
    changed: value => {
      this.store.enable_flaps = value;
      this.$api.datastore.export(this.store);
    },
  },
  turnoff_lights_off: {
    type: "checkbox",
    label: "Turn runway turnoff lights off",
    value: this.store.turnoff_lights_off,
    changed: value => {
      this.store.turnoff_lights_off = value;
      this.$api.datastore.export(this.store);
    },
  },
  wing_lights_off: {
    type: "checkbox",
    label: "Turn wing lights off",
    value: this.store.wing_lights_off,
    changed: value => {
      this.store.wing_lights_off = value;
      this.$api.datastore.export(this.store);
    },
  },
  stop_timer: {
    type: "checkbox",
    label: "Stop Elapsed Timer",
    value: this.store.stop_timer,
    changed: value => {
      this.store.stop_timer = value;
      this.$api.datastore.export(this.store);
    },
  },
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
  // Speedbrake Retract
  {
    var: "L:switch_498_a",
    desired_pos: () => 0,
    step: 0,
    action: 498101,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay + 1500,
    enabled: () => this.store.enable_speedbrake,
    perform_once: false,
  },
  // Flaps Up
  {
    var: "L:switch_507_a",
    desired_pos: () => 0,
    step: 0,
    action: 507101,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay + 6500,
    enabled: () => this.store.enable_flaps,
    perform_once: false,
  },
  // Transponder Off
  {
    var: "L:switch_749_a",
    desired_pos: () => 20,
    step: 10,
    action: null,
    incr: 74901,
    decr: 74902,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Landing Lights Off
  {
    var: "L:switch_22_a",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 2202,
    decr: 2201,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_23_a",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 2302,
    decr: 2301,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_24_a",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 2402,
    decr: 2401,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights Off
  {
    var: "L:switch_119_a",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 11902,
    decr: 11901,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.turnoff_lights_off,
    perform_once: false,
  },
  {
    var: "L:switch_120_a",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 12002,
    decr: 12001,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.turnoff_lights_off,
    perform_once: false,
  },
  // Taxi Lights On
  {
    var: "L:switch_121_a",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 12102,
    decr: 12101,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Strobe Lights Off
  {
    var: "L:switch_122_a",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 12202,
    decr: 12201,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:switch_117_a",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 11702,
    decr: 11701,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.wing_lights_off,
    perform_once: false,
  },
  // APU On
  {
    var: "L:switch_03_a",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 308,
    decr: 307,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: true,
  },
  // Stop Elapsed Timer
  {
    var: "L:switch_173_a",
    desired_pos: () => 50,
    step: 50,
    action: null,
    incr: 17301,
    decr: 17302,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.stop_timer,
    perform_once: true,
  },
  {
    var: "L:switch_281_a",
    desired_pos: () => 50,
    step: 50,
    action: null,
    incr: 28101,
    decr: 28102,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.stop_timer,
    perform_once: true,
  },
];

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run(() => {
  (async () => {
    for (const command of commandList) {
      if (!command.enabled()) continue;

      let state = this.$api.variables.get(command.var, "number");
      let retry = 3;
      while (state !== command.desired_pos() && retry-- > 0) {
        let action = command.action;
        let repeatCount = 1;
        if (!action) {
          repeatCount = Math.min(Math.abs(command.desired_pos() - state) / command.step, 5);
          action = command.desired_pos() < state ? command.incr : command.decr;
        }
        for (let i = 1; i <= repeatCount; i++) {
          let delay = command.delay();

          if (state === command.desired_pos()) {
            if (delay > 0) {
              await timeout(delay);
            }
            break;
          }

          if (i < repeatCount && command.interval_delay > 0) {
            delay = command.interval_delay;
          }

          this.$api.variables.set("K:ROTOR_BRAKE", "number", action);

          if (delay > 0) {
            await timeout(delay);
          }

          state = this.$api.variables.get(command.var, "number");
        }

        if (command.perform_once) break;
      }
    }
  })();

  return false;
});
