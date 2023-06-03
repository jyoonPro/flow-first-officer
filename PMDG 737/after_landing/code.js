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
    var: "L:switch_679_73X",
    desired_pos: () => 0,
    step: 0,
    action: 679101,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay + 1500,
    enabled: () => this.store.enable_speedbrake,
    perform_once: false,
  },
  // Flaps Up
  {
    var: "L:switch_714_73X",
    desired_pos: () => 0,
    step: 0,
    action: 714101,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay + 5500,
    enabled: () => this.store.enable_flaps,
    perform_once: false,
  },
  // Transponder Off
  {
    var: "L:switch_800_73X",
    desired_pos: () => 20,
    step: 10,
    action: null,
    incr: 80001,
    decr: 80002,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Position Steady
  {
    var: "L:switch_123_73X",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 12302,
    decr: 12301,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:switch_125_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 12502,
    decr: 12501,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.wing_lights_off,
    perform_once: false,
  },
  // Landing Lights Off
  {
    var: "L:switch_111_73X",
    desired_pos: () => 0,
    step: 50,
    action: null,
    incr: 11102,
    decr: 11101,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_112_73X",
    desired_pos: () => 0,
    step: 50,
    action: null,
    incr: 11202,
    decr: 11201,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_113_73X",
    desired_pos: () => 0,
    step: 50,
    action: null,
    incr: 11302,
    decr: 11301,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_114_73X",
    desired_pos: () => 0,
    step: 50,
    action: null,
    incr: 11402,
    decr: 11401,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights Off
  {
    var: "L:switch_115_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 11502,
    decr: 11501,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.turnoff_lights_off,
    perform_once: false,
  },
  {
    var: "L:switch_116_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 11602,
    decr: 11601,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Taxi Lights On
  {
    var: "L:switch_117_73X",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 11702,
    decr: 11701,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // APU On
  {
    var: "L:switch_118_73X",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 11802,
    decr: 11801,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: true,
  },
  // Probe Heat Off
  {
    var: "L:switch_140_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 14002,
    decr: 14001,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_141_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 14102,
    decr: 14101,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Engine Start Switches Off/Auto
  {
    var: "L:switch_119_73X",
    desired_pos: () => 10,
    step: 10,
    action: null,
    incr: 11901,
    decr: 11902,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_121_73X",
    desired_pos: () => 10,
    step: 10,
    action: null,
    incr: 12101,
    decr: 12102,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Auto Brake Off
  {
    var: "L:switch_460_73X",
    desired_pos: () => 10,
    step: 10,
    action: null,
    incr: 46001,
    decr: 46002,
    interval_delay: 300,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Stop Elapsed Timer
  {
    var: "L:switch_321_73X",
    desired_pos: () => 100,
    step: 100,
    action: 32101,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.stop_timer,
    perform_once: true,
  },
  {
    var: "L:switch_530_73X",
    desired_pos: () => 100,
    step: 100,
    action: 53001,
    incr: null,
    decr: null,
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
