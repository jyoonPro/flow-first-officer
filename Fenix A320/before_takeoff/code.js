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
  // Seatbelt & Smoke Signs
  {
    var: "L:S_OH_SIGNS",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  {
    var: "L:S_OH_SIGNS_SMOKING",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  // TCAS TA/RA
  {
    var: "L:S_XPDR_OPERATION",
    action: null,
    desired_pos: () => this.store.xpndr_on ? 2 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:S_XPDR_MODE",
    action: null,
    desired_pos: () => this.store.tcas_ta_only ? 1 : 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Weather Radar On
  {
    var: "L:S_WR_SYS",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:S_WR_PRED_WS",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Strobe Lights On
  {
    var: "L:S_OH_EXT_LT_STROBE",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:S_OH_EXT_LT_WING",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.wing_lights || isDark(),
    perform_once: false,
  },
  // Nav & Logo Lights
  {
    var: "L:S_OH_EXT_LT_NAV_LOGO",
    action: null,
    desired_pos: () => {
      const current_pos = this.$api.variables.get("L:S_OH_EXT_LT_NAV_LOGO", "number");
      return current_pos === 0 ? 2 : current_pos;
    },
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Landing Lights On
  {
    var: "L:S_OH_EXT_LT_LANDING_L",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:S_OH_EXT_LT_LANDING_R",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Nose Light TO
  {
    var: "L:S_OH_EXT_LT_NOSE",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights On
  {
    var: "L:S_OH_EXT_LT_RWY_TURNOFF",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Packs Off
  {
    var: "L:S_OH_PNEUMATIC_PACK_1",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
    perform_once: false,
  },
  {
    var: "L:S_OH_PNEUMATIC_PACK_2",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
    perform_once: false,
  },
  // Start Elapsed Timer
  {
    var: "L:S_MIP_CLOCK_ET",
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

  this.$api.command.script_message_send("a320-fenix-auto-ll", "", (callback) => {
  });
  return false;
});
