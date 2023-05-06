this.store = {
  enable_seatbelt: false,
  start_timer: true,
  tcas_ta_only: false,
  delay: "450",
};

this.$api.datastore.import(this.store);

settings_define({
  enable_seatbelt: {
    type: "checkbox",
    label: "Enable seatbelt signs check",
    value: this.store.enable_seatbelt,
    changed: (value) => {
      this.store.enable_seatbelt = value;
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
    label: "Delay between actions in milliseconds",
    value: this.store.delay,
    changed: (value) => {
      this.store.delay = value;
      this.$api.datastore.export(this.store);
    },
  },
});

const commandList = [
  // Seatbelt & Smoke Signs
  {
    var: "A:CABIN SEATBELTS ALERT SWITCH",
    action: "K:CABIN_SEATBELTS_ALERT_SWITCH_TOGGLE",
    desired_pos: () => 1,
    delay: 0,
    enabled: () => this.store.enable_seatbelt,
  },
  {
    var: "L:XMLVAR_SWITCH_OVHD_INTLT_NOSMOKING_POSITION",
    action: null,
    desired_pos: () => 1,
    delay: 0,
    enabled: () => this.store.enable_seatbelt,
  },
  // TCAS TA/RA
  {
    var: "L:A32NX_TRANSPONDER_MODE",
    action: null,
    desired_pos: () => 1,
    delay: 0,
    enabled: () => true,
  },
  {
    var: "L:A32NX_SWITCH_TCAS_Position",
    action: null,
    desired_pos: () => this.store.tcas_ta_only ? 1 : 2,
    delay: 0,
    enabled: () => true,
  },
  // Weather Radar On
  {
    var: "L:XMLVAR_A320_WEATHERRADAR_SYS",
    action: null,
    desired_pos: () => 0,
    delay: 0,
    enabled: () => true,
  },
  {
    var: "L:A32NX_SWITCH_RADAR_PWS_POSITION",
    action: null,
    desired_pos: () => 1,
    delay: 0,
    enabled: () => true,
  },
  // Landing Lights On
  {
    var: "A:CIRCUIT SWITCH ON:18",
    action: null,
    desired_pos: () => 1,
    delay: 0,
    enabled: () => true,
  },
  {
    var: "A:CIRCUIT SWITCH ON:19",
    action: null,
    desired_pos: () => 1,
    delay: 0,
    enabled: () => true,
  },
  // Nose Light TO
  {
    var: "L:LIGHTING_LANDING_1",
    action: null,
    desired_pos: () => 0,
    delay: 0,
    enabled: () => true,
  },
  // Runway Turnoff Lights On
  {
    var: "A:CIRCUIT SWITCH ON:21",
    action: null,
    desired_pos: () => 1,
    delay: 0,
    enabled: () => true,
  },
  {
    var: "A:CIRCUIT SWITCH ON:22",
    action: null,
    desired_pos: () => 1,
    delay: 0,
    enabled: () => true,
  },
  // Start Elapsed Timer
  {
    var: "L:A32NX_CHRONO_ET_SWITCH_POS",
    action: null,
    desired_pos: () => 2,
    delay: 1000,
    enabled: () => this.store.start_timer,
  },
  {
    var: "L:A32NX_CHRONO_ET_SWITCH_POS",
    action: null,
    desired_pos: () => 0,
    delay: 0,
    enabled: () => this.store.start_timer,
  },
];

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run(event => {
  (async () => {
    for (const command of commandList) {
      if (!command.enabled()) continue;

      const state = this.$api.variables.get(command.var, "number");
      if (state !== command.desired_pos()) {
        this.$api.variables.set(command.action || command.var, "number", command.desired_pos());

        let delay = command.delay;
        if (Number(this.store.delay) > 0) {
          delay += Number(this.store.delay) || 450;
        }

        if (delay > 0) {
          await timeout(delay);
        }
      }
    }
  })();

  this.$api.command.script_message_send("320-fbw-auto-ll", "", (callback) => {});
  return false;
});
