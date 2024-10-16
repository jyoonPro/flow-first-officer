this.store = {
  enable_seatbelt: false,
  takeoff_taxi_lights: false,
  wing_lights: false,
  xpndr_on: true,
  tcas_ta_only: false,
  packs_off: false,
  delay: 600,
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
  takeoff_taxi_lights: {
    type: "checkbox",
    label: "Taxi lights ON during takeoff",
    value: this.store.takeoff_taxi_lights,
    changed: value => {
      this.store.takeoff_taxi_lights = value;
      this.$api.datastore.export(this.store);
    },
  },
  wing_lights: {
    type: "checkbox",
    label: "Enable wing lights ON",
    value: this.store.wing_lights,
    changed: value => {
      this.store.wing_lights = value;
      this.$api.datastore.export(this.store);
    },
  },
  xpndr_on: {
    type: "checkbox",
    label: "Turn transponder on instead of auto",
    value: this.store.xpndr_on,
    changed: value => {
      this.store.xpndr_on = value;
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
  packs_off: {
    type: "checkbox",
    label: "Set packs off",
    value: this.store.packs_off,
    changed: value => {
      this.store.packs_off = value;
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

const isDark = () => this.$api.time.get_sun_position().altitudeDegrees < 5;

const commandList = [
  // A/T Arm
  {
    var: "L:VC_AT_SW_VAL",
    desired_pos: () => 10,
    step: 10,
    lvar: "L:VC_Automatic_Flight_Trigger_VAL",
    action: null,
    incr: 1,
    decr: 2,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Reset Fuel Flow
  {
    var: "L:VC_Fuel_Flow_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Engine_APU_trigger_VAL",
    action: null,
    incr: 26,
    decr: 25,
    interval_delay: 0,
    delay: () => this.store.delay + 1500,
    enabled: () => true,
    perform_once: true,
  },
  // Seatbelt & Smoke Signs
  {
    var: "L:VC_Fasten_Belts_SW_VAL",
    desired_pos: () => 20,
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 16,
    decr: 17,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  {
    var: "L:VC_No_Smoking_SW_VAL",
    desired_pos: () => {
      const current = this.$api.variables.get("L:VC_No_SMOking_SW_VAL", "number");
      return current === 0 ? 10 : current;
    },
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 14,
    decr: 15,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  // Logo Lights
  {
    var: "L:VC_Logo_Light_SW_VAL",
    desired_pos: () => 10,
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 29,
    decr: 28,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => isDark(),
    perform_once: false,
  },
  // Position Strobe & Steady
  {
    var: "L:VC_Position_Light_SW_VAL",
    desired_pos: () => 0,
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
    desired_pos: () => 10,
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 35,
    decr: 34,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.wing_lights || isDark(),
    perform_once: false,
  },
  // Wheel Well Lights Off
  {
    var: "L:VC_Wheel_Well_Light_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Miscellaneous_trigger_VAL",
    action: null,
    incr: 37,
    decr: 36,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Taxi Lights
  {
    var: "L:VC_Taxi_Light_SW_VAL",
    desired_pos: () => this.store.takeoff_taxi_lights ? 10 : 0,
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
  // Landing Lights On
  {
    var: "L:VC_Landing_Light_1_SW_VAL",
    desired_pos: () => 20,
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
    desired_pos: () => 20,
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
  // Runway Turnoff Lights On
  {
    var: "L:VC_Runway_Turnoff_Light_L_SW_VAL",
    desired_pos: () => 10,
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
    desired_pos: () => 10,
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
  // Transponder TA/RA
  {
    var: "L:VC_Transponder_Reply_SW_VAL",
    desired_pos: () => this.store.xpndr_on ? 10 : 20,
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
    desired_pos: () => this.store.tcas_ta_only ? 20 : 30,
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
  // Packs Off
  {
    var: "L:VC_Pack_1_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Air_Systems_trigger_VAL",
    action: null,
    incr: 25,
    decr: 24,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
    perform_once: false,
  },
  {
    var: "L:VC_Pack_2_SW_VAL",
    desired_pos: () => 0,
    step: 10,
    lvar: "L:VC_Air_Systems_trigger_VAL",
    action: null,
    incr: 27,
    decr: 26,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
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

  this.$api.command.script_message_send("ifly-b38m-auto-ll", "", (callback) => {});
  return false;
});
