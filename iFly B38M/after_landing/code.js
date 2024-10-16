this.store = {
  enable_speedbrake: false,
  enable_flaps: false,
  turnoff_lights_off: true,
  wing_lights_off: false,
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
    var: "L:VC_Spoiler_Lever_VAL",
    desired_pos: () => 0,
    step: 0,
    lvar: "K:SPOILERS_OFF",
    action: 1,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay + 1500,
    enabled: () => this.store.enable_speedbrake,
    perform_once: false,
  },
  // Flaps Up
  {
    var: "L:VC_FLAP_Lever_VAL",
    desired_pos: () => 0,
    step: 0,
    lvar: "K:FLAPS_UP",
    action: 1,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay + 5500,
    enabled: () => this.store.enable_flaps,
    perform_once: false,
  },
  // Transponder Off
  {
    var: "L:VC_Transponder_Reply_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Navigation_trigger_VAL",
    action: null,
    incr: 386,
    decr: 385,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:VC_Transponder_Mode_SW_VAL",
    desired_pos: () => 10,
    step: 10,
    lvar: "L:VC_Navigation_trigger_VAL",
    action: null,
    incr: 408,
    decr: 407,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Position Steady
  {
    var: "L:VC_Position_Light_SW_VAL",
    desired_pos: () => 20,
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 31,
    decr: 30,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:VC_Wing_Light_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 35,
    decr: 34,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.wing_lights_off,
    perform_once: false,
  },
  // Landing Lights Off
  {
    var: "L:VC_Landing_Light_1_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 19,
    decr: 18,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:VC_Landing_Light_2_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 21,
    decr: 20,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights Off
  {
    var: "L:VC_Runway_Turnoff_Light_L_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 23,
    decr: 22,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:VC_Runway_Turnoff_Light_R_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 25,
    decr: 24,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Taxi Lights On
  {
    var: "L:VC_Taxi_Light_SW_VAL",
    desired_pos: () => 10,
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 27,
    decr: 26,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // APU On
  {
    var: "L:VC_APU_SW_VAL",
    desired_pos: () => 20,
    step: 10,
    lvar: "L:VC_Engine_APU_trigger_VAL",
    action: null,
    incr: 8,
    decr: 7,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: true,
  },
  // Probe Heat Off
  {
    var: "L:VC_Probe_Heat_1_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Anti_Ice_trigger_VAL",
    action: null,
    incr: 16,
    decr: 15,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:VC_Probe_Heat_2_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Anti_Ice_trigger_VAL",
    action: null,
    incr: 18,
    decr: 17,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Engine Start Switches Off/Auto
  {
    var: "L:VC_Engine_1_Start_SW_VAL",
    desired_pos: () => 10,
    step: 10,
    lvar: "L:VC_Engine_APU_trigger_VAL",
    action: null,
    incr: 4,
    decr: 3,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:VC_Engine_2_Start_SW_VAL",
    desired_pos: () => 10,
    step: 10,
    lvar: "L:VC_Engine_APU_trigger_VAL",
    action: null,
    incr: 6,
    decr: 5,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Auto Brake Off
  {
    var: "L:VC_Autobrake_SW_VAL",
    desired_pos: () => 10,
    step: 10,
    lvar: "L:VC_Gear_trigger_VAL",
    action: null,
    incr: 10,
    decr: 9,
    interval_delay: 300,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
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
          action = command.desired_pos() > state ? command.incr : command.decr;
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

          this.$api.variables.set(command.lvar, "number", action);

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
