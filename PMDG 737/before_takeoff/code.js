this.store = {
  enable_seatbelt: false,
  tcas_ta_only: false,
  delay: "450",
};

this.$api.datastore.import(this.store);

settings_define({
  enable_seatbelt: {
    type: "checkbox",
    label: "Enable seatbelt signs check",
    value: this.store.enable_seatbelt,
    changed: value => {
      this.store.enable_seatbelt = value;
      this.$api.datastore.export(this.store);
    },
  },
  tcas_ta_only: {
    type: "checkbox",
    label: "Set TCAS to TA Only",
    value: this.store.tcas_ta_only,
    changed: value => {
      this.store.tcas_ta_only = value;
      this.$api.datastore.export(this.store);
    },
  },
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
  // Seatbelt & Smoke Signs
  {
    var: "L:switch_103_73X",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 10302,
    decr: 10301,
    interval_delay: 0,
    delay: 0,
    enabled: () => this.store.enable_seatbelt,
  },
  {
    var: "L:switch_104_73X",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 10402,
    decr: 10401,
    interval_delay: 100,
    delay: 0,
    enabled: () => this.store.enable_seatbelt,
  },
  // Position Stobe & Steady
  {
    var: "L:switch_123_73X",
    desired_pos: () => 0,
    step: 50,
    action: null,
    incr: 12302,
    decr: 12301,
    interval_delay: 100,
    delay: 0,
    enabled: () => true,
  },
  // Taxi Lights Off
  {
    var: "L:switch_117_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 11702,
    decr: 11701,
    interval_delay: 0,
    delay: 0,
    enabled: () => true,
  },
  // Landing Lights On
  {
    var: "L:switch_111_73X",
    desired_pos: () => 100,
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
    desired_pos: () => 100,
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
    desired_pos: () => 100,
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
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 11402,
    decr: 11401,
    interval_delay: 0,
    delay: 0,
    enabled: () => true,
  },
  // Runway Turnoff Lights On
  {
    var: "L:switch_115_73X",
    desired_pos: () => 100,
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
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 11602,
    decr: 11601,
    interval_delay: 0,
    delay: 0,
    enabled: () => true,
  },
  // Transponder TA/RA
  {
    var: "L:switch_800_73X",
    desired_pos: () => this.store.tcas_ta_only ? 30 : 40,
    step: 10,
    action: null,
    incr: 80001,
    decr: 80002,
    interval_delay: 100,
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
