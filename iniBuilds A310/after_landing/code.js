this.store = {
  enable_spoilers: false,
  enable_flaps: false,
  turnoff_lights_off: true,
  wing_lights_off: false,
  strobe_off: false,
  stop_timer: true,
  delay: 600,
};

this.$api.datastore.import(this.store);

settings_define({
  enable_flaps: {
    type: "checkbox",
    label: "Enable flaps retraction",
    value: this.store.enable_flaps,
    changed: value => {
      this.store.enable_flaps = value;
      this.$api.datastore.export(this.store);
    },
  },
  enable_spoilers: {
    type: "checkbox",
    label: "Enable spoilers retraction",
    value: this.store.enable_spoilers,
    changed: value => {
      this.store.enable_spoilers = value;
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
  strobe_off: {
    type: "checkbox",
    label: "Turn strobe lights off instead of auto",
    value: this.store.strobe_off,
    changed: value => {
      this.store.strobe_off = value;
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
  // Spoilers Retract
  {
    var: "L:A310_SPOILERS_HANDLE_POSITION",
    action: "B:Handling_Spoilers_Set",
    desired_pos: () => 0,
    delay: () => this.store.delay + 100,
    enabled: () => this.store.enable_spoilers,
    perform_once: false,
  },
  {
    var: "L:A310_SPOILERS_ARMED",
    action: "K:SPOILERS_ARM_SET",
    desired_pos: () => 0,
    delay: () => this.store.delay + 100,
    enabled: () => this.store.enable_spoilers,
    perform_once: false,
  },
  // Flaps Up
  {
    var: "L:FLAPS_HANDLE_POSITION",
    action: "B:HANDLING_Flaps_Set",
    desired_pos: () => 0,
    delay: () => this.store.delay + 100,
    enabled: () => this.store.enable_flaps,
    perform_once: false,
  },
  // Strobe Lights Auto
  {
    var: "L:A310_POTENTIOMETER_24",
    action: null,
    desired_pos: () => this.store.strobe_off ? 2 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:A310_WING_LIGHT_SWITCH",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => this.store.wing_lights_off,
    perform_once: false,
  },
  // Landing Lights Off
  {
    var: "L:A310_LANDING_LIGHT_R_SWITCH",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:A310_LANDING_LIGHT_L_SWITCH",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Nose Light Taxi
  {
    var: "L:A310_TAXI_LIGHTS_SWITCH",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights Off
  {
    var: "L:A310_RWY_TURNOFF_L_SWITCH",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => this.store.turnoff_lights_off,
    perform_once: false,
  },
  {
    var: "L:A310_RWY_TURNOFF_R_SWITCH",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => this.store.turnoff_lights_off,
    perform_once: false,
  },
  // Ignition Off
  {
    var: "L:A310_ENG_IGNITION_SWITCH",
    action: null,
    desired_pos: () => 3,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // APU Master Switch On
  {
    var: "L:A310_apu_master_switch",
    action: null,
    desired_pos: () => 1,
    delay: () => 3000,
    enabled: () => true,
    perform_once: false,
  },
  // APU Start On
  {
    var: "L:S_OH_ELEC_APU_START",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: true,
  },
  {
    var: "L:A310_apu_start_button",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: true,
  },
  // TCAS STBY
  {
    var: "L:A310_TCAS_MODE_PEDESTAL",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Weather Radar Off
  {
    var: "L:A310_WXR_SYS",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Stop Elapsed Timer
  {
    var: "L:__CPT_CLOCK_RUNIsPressed",
    action: "L:A310_ET_TOGGLE_BUTTON",
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.stop_timer,
    perform_once: true,
  },
  {
    var: "L:__FO_CLOCK_RUNIsPressed",
    action: "L:A310_ET_TOGGLE_BUTTON_FO",
    desired_pos: () => 1,
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
        this.$api.variables.set(command.action || command.var, "number", command.desired_pos(true));

        const delay = command.delay();
        if (delay > 0) {
          await timeout(delay);
        }

        if (command.perform_once) break;
        state = this.$api.variables.get(command.var, "number");
      }
    }
  })();

  return false;
});
