this.store = {
  enable_speedbrake: false,
  enable_flaps: false,
  delay: "450",
};

this.$api.datastore.import(this.store);

settings_define({
  enable_spoilers: {
    type: "checkbox",
    label: "Enable speedbrake retraction",
    value: this.store.enable_speedbrake,
    changed: (value) => {
      this.store.enable_speedbrake = value;
      this.$api.datastore.export(this.store);
    },
  },
  enable_flaps: {
    type: "checkbox",
    label: "Enable flaps retraction",
    value: this.store.enable_flaps,
    changed: (value) => {
      this.store.enable_flaps = value;
      this.$api.datastore.export(this.store);
    },
  },
  delay: {
    type: "text",
    label: "Delay between actions in milliseconds",
    value: this.store.delay,
    changed: (value) => {
      this.store.delay = value;
      this.$api.datastore.export(this.store);
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
    delay: 1500,
    enabled: () => this.store.enable_speedbrake,
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
    delay: 5500,
    enabled: () => this.store.enable_flaps,
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
    delay: 0,
    enabled: () => true,
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
    delay: 0,
    enabled: () => true,
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
    delay: 0,
    enabled: () => true,
  },
  {
    var: "L:switch_112_73X",
    desired_pos: () => 0,
    step: 50,
    action: null,
    incr: 11202,
    decr: 11201,
    interval_delay: 100,
    delay: 0,
    enabled: () => true,
  },
  {
    var: "L:switch_113_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 11302,
    decr: 11301,
    interval_delay: 0,
    delay: 0,
    enabled: () => true,
  },
  {
    var: "L:switch_114_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 11402,
    decr: 11401,
    interval_delay: 0,
    delay: 0,
    enabled: () => true,
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
    delay: 0,
    enabled: () => true,
  },
  {
    var: "L:switch_116_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 11602,
    decr: 11601,
    interval_delay: 0,
    delay: 0,
    enabled: () => true,
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
    delay: 0,
    enabled: () => true,
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
    delay: 0,
    enabled: () => true,
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
    delay: 0,
    enabled: () => true,
  },
  {
    var: "L:switch_141_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 14102,
    decr: 14101,
    interval_delay: 0,
    delay: 0,
    enabled: () => true,
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
    delay: 0,
    enabled: () => true,
  },
  {
    var: "L:switch_121_73X",
    desired_pos: () => 10,
    step: 10,
    action: null,
    incr: 12101,
    decr: 12102,
    interval_delay: 100,
    delay: 0,
    enabled: () => true,
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
    delay: 0,
    enabled: () => true,
  },
];

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run(() => {
  (async () => {
    for (const command of commandList) {
      if (!command.enabled()) continue;

      const state = this.$api.variables.get(command.var, "number");
      if (state !== command.desired_pos()) {
        let action = command.action;
        let repeatCount = 1;
        if (!action) {
          repeatCount = Math.min(Math.abs(command.desired_pos() - state) / command.step, 5);
          action = command.desired_pos() < state ? command.incr : command.decr;
        }
        for (let i = 1; i <= repeatCount; i++) {
          this.$api.variables.set("K:ROTOR_BRAKE", "number", action);

          let delay = command.delay;
          if (i < repeatCount && command.interval_delay > 0) {
            delay = command.interval_delay;
          } else if (Number(this.store.delay) > 0) {
            delay += Number(this.store.delay) || 450;
          }

          if (delay > 0) {
            await timeout(delay);
          }
        }
      }
    }
  })();

  return false;
});
