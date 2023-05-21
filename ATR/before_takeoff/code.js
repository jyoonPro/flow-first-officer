this.store = {
  enable_seatbelt: false,
  arm_yaw_damper: false,
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
  arm_yaw_damper: {
    type: "checkbox",
    label: "Automatically engage yaw damper (YD) after takeoff",
    value: this.store.arm_yaw_damper,
    changed: value => {
      this.store.arm_yaw_damper = value;
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

let isYawDamperArmed;

const isDark = () => this.$api.time.get_sun_position().altitudeDegrees < 5;

const getRadarAltitude = () => this.$api.variables.get("A:RADIO HEIGHT", "feet");

const commandList = [
  // Seatbelt & No Device Signs
  {
    var: "L:MSATR_CABS_SEAT_BELTS",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  {
    var: "L:MSATR_CABS_NO_DEVICE",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  // Gust Lock Released
  {
    var: "L:MSATR_ENG_GUSTLOCK",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // WX Radar
  {
    var: "L:MSATR_WXR_MODE",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:MSATR_ELTS_WING",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Taxi & TO Lights On
  {
    var: "L:MSATR_ELTS_TAXI_TO",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Landing Lights On
  {
    var: "L:MSATR_ELTS_LDG_RIGHT",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:MSATR_ELTS_LDG_LEFT",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Logo Lights
  {
    var: "L:MSATR_ELTS_LOGO",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => isDark(),
    perform_once: false,
  },
  // Strobe On
  {
    var: "L:MSATR_ELTS_STROBE",
    action: null,
    desired_pos: () => 1,
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
        this.$api.variables.set(command.action || command.var, "number", command.desired_pos());

        const delay = command.delay();
        if (delay > 0) {
          await timeout(delay);
        }

        if (command.perform_once) break;
        state = this.$api.variables.get(command.var, "number");
      }
    }

    // Engage Yaw Damper
    if (this.store.arm_yaw_damper) isYawDamperArmed = true;
  })();

  this.$api.command.script_message_send("atr-auto-ll", "", (callback) => {});
  return false;
});

loop_15hz(() => {
  if (!isYawDamperArmed) return;

  if (getRadarAltitude() > 50) {
    isYawDamperArmed = false;

    (async () => {
      let state = this.$api.variables.get("L:MSATR_FGCP_YD", "number");
      let retry = 3;
      while (state !== 1 && retry-- > 0) {
        this.$api.variables.set("L:MSATR_FGCP_YD", "number", 1);
        await timeout(this.store.delay);
        state = this.$api.variables.get("L:MSATR_FGCP_YD", "number");
      }
    })();
  }
});

info(() => {
  return isYawDamperArmed ? "YD ARMED" : null;
});

style(() => {
  return isYawDamperArmed ? "warn" : null;
});
