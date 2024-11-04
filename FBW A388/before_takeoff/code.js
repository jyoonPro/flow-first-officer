this.store = {
  enable_seatbelt: false,
  wing_lights: false,
  start_timer: true,
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
  wing_lights: {
    type: "checkbox",
    label: "Enable wing lights ON",
    value: this.store.wing_lights,
    changed: value => {
      this.store.wing_lights = value;
      this.$api.datastore.export(this.store);
    },
  },
  start_timer: {
    type: "checkbox",
    label: "Start Elapsed Timer",
    value: this.store.start_timer,
    changed: value => {
      this.store.start_timer = value;
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
  // Seatbelt & No Mobile
  {
    var: "L:XMLVAR_SWITCH_OVHD_INTLT_SEATBELT_Position",
    action: "K:CABIN_SEATBELTS_ALERT_SWITCH_TOGGLE",
    desired_pos: () => 0,
    delay: () => 0,
    enabled: () => this.store.enable_seatbelt,
    perform_once: true,
  },
  {
    var: "L:XMLVAR_SWITCH_OVHD_INTLT_SEATBELT_Position",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  {
    var: "L:XMLVAR_SWITCH_OVHD_INTLT_NOSMOKING_POSITION",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  // Strobe Lights On
  {
    var: "L:LIGHTING_STROBE_0",
    action: "B:LIGHTING_STROBE_0_Set",
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:LIGHTING_WING_0",
    action: "B:LIGHTING_WING_0_Set",
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.wing_lights || isDark(),
    perform_once: false,
  },
  // Nav & Logo Lights
  {
    var: "L:LIGHTING_NAV_0",
    action: "B:LIGHTING_NAV_0_Set",
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // {
  //   var: "A:LIGHT LOGO",
  //   action: null,
  //   desired_pos: () => 1,
  //   delay: () => this.store.delay,
  //   enabled: () => true,
  //   perform_once: false,
  // },
  // Landing Lights On
  {
    var: "L:LIGHTING_LANDING_2",
    action: "B:LIGHTING_LANDING_2_Set",
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Nose Light TO
  {
    var: "L:LIGHTING_LANDING_1",
    action: "B:LIGHTING_LANDING_1_Set",
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights On
  {
    var: "L:LIGHTING_TAXI_2",
    action: "B:LIGHTING_TAXI_2_Set",
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Packs Off
  {
    var: "L:A32NX_OVHD_COND_PACK_1_PB_IS_ON",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
    perform_once: false,
  },
  {
    var: "L:A32NX_OVHD_COND_PACK_2_PB_IS_ON",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
    perform_once: false,
  },
  // Start Elapsed Timer
  {
    var: "L:A32NX_CHRONO_ET_SWITCH_POS",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => this.store.start_timer,
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
        this.$api.variables.set(command.action || command.var, "number", command.desired_pos());

        const delay = command.delay();
        if (delay > 0) {
          await timeout(delay);
        }

        if (command.perform_once) break;
        state = this.$api.variables.get(command.var, "number");
      }
    }
  })();

  this.$api.command.script_message_send("a388-auto-ll", "", (callback) => {
  });
  return false;
});
