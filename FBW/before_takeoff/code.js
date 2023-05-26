this.store = {
  enable_seatbelt: false,
  wing_lights: false,
  start_timer: true,
  tcas_ta_only: false,
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
    label: "Reset & Start Elapsed Timer",
    value: this.store.start_timer,
    changed: value => {
      this.store.start_timer = value;
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
    var: "A:CABIN SEATBELTS ALERT SWITCH",
    action: "K:CABIN_SEATBELTS_ALERT_SWITCH_TOGGLE",
    desired_pos: () => 1,
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
  // TCAS TA/RA
  {
    var: "L:A32NX_TRANSPONDER_MODE",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:A32NX_SWITCH_TCAS_Position",
    action: null,
    desired_pos: () => this.store.tcas_ta_only ? 1 : 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Weather Radar On
  {
    var: "L:XMLVAR_A320_WEATHERRADAR_SYS",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:A32NX_SWITCH_RADAR_PWS_POSITION",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Strobe Lights On
  {
    var: "L:LIGHTING_STROBE_0",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Wing Lights
  {
    var: "A:LIGHT WING",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.wing_lights || isDark(),
    perform_once: false,
  },
  // Nav & Logo Lights
  {
    var: "A:LIGHT NAV",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "A:LIGHT LOGO",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => isDark(),
    perform_once: false,
  },
  // Landing Lights On
  {
    var: "L:LIGHTING_LANDING_2",
    action: null,
    desired_pos: () => 0,
    delay: () => 0,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:LANDING_2_RETRACTED",
    action: null,
    desired_pos: () => 0,
    delay: () => 0,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "A:CIRCUIT SWITCH ON:18",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:LIGHTING_LANDING_3",
    action: null,
    desired_pos: () => 0,
    delay: () => 0,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:LANDING_3_RETRACTED",
    action: null,
    desired_pos: () => 0,
    delay: () => 0,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "A:CIRCUIT SWITCH ON:19",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Nose Light TO
  {
    var: "L:LIGHTING_LANDING_1",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "A:CIRCUIT SWITCH ON:17",
    action: null,
    desired_pos: () => 1,
    delay: () => 0,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "A:CIRCUIT SWITCH ON:20",
    action: null,
    desired_pos: () => 1,
    delay: () => 0,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights On
  {
    var: "A:CIRCUIT SWITCH ON:21",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "A:CIRCUIT SWITCH ON:22",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Start Elapsed Timer
  {
    var: "L:A32NX_CHRONO_ET_SWITCH_POS",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay + 1000,
    enabled: () => this.store.start_timer,
    perform_once: true,
  },
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

  this.$api.command.script_message_send("a320-fbw-auto-ll", "", (callback) => {});
  return false;
});
