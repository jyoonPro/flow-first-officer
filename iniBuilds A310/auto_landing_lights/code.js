this.store = {
  off_altitude: 9000,
  on_altitude: 11000,
  wing_lights: false,
  delay: 600,
};

this.$api.datastore.import(this.store);

settings_define({
  off_altitude: {
    type: "text",
    label: "Lights off altitude (feet)",
    value: this.store.off_altitude,
    changed: value => {
      const altitude = Number(value);
      if (Number.isInteger(altitude) && altitude >= 0) {
        this.store.off_altitude = altitude;
        this.$api.datastore.export(this.store);
      }
    },
  },
  on_altitude: {
    type: "text",
    label: "Lights on altitude (feet)",
    value: this.store.on_altitude,
    changed: value => {
      const altitude = Number(value);
      if (Number.isInteger(altitude) && altitude >= 0) {
        this.store.on_altitude = altitude;
        this.$api.datastore.export(this.store);
      }
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

let isArmed, isTargetOff;

const isDark = () => this.$api.time.get_sun_position().altitudeDegrees < 5;

const getCurrentAltitude = () => this.$api.variables.get("A:INDICATED ALTITUDE CALIBRATED", "feet");

const tryArm = (forceOn = false) => {
  const currentAltitude = getCurrentAltitude();

  if (currentAltitude < this.store.off_altitude) {
    isTargetOff = true;
    isArmed = forceOn || !isArmed;
  } else if (currentAltitude > this.store.on_altitude) {
    isTargetOff = false;
    isArmed = forceOn || !isArmed;
  } else {
    isArmed = false;
  }
};

const commandList = [
  // Landing Lights
  {
    var: "L:A310_LANDING_LIGHT_R_SWITCH",
    action: null,
    desired_pos: () => isTargetOff ? 2 : 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:A310_LANDING_LIGHT_L_SWITCH",
    action: null,
    desired_pos: () => isTargetOff ? 2 : 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Nose Light
  {
    var: "L:A310_TAXI_LIGHTS_SWITCH",
    action: null,
    desired_pos: () => isTargetOff ? 2 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights
  {
    var: "L:A310_RWY_TURNOFF_L_SWITCH",
    action: null,
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:A310_RWY_TURNOFF_R_SWITCH",
    action: null,
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:A310_WING_LIGHT_SWITCH",
    action: null,
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => isTargetOff || this.store.wing_lights || isDark(),
    perform_once: false,
  },
  // Engine
  {
    var: "L:A310_ENG_IGNITION_SWITCH",
    action: null,
    desired_pos: () => isTargetOff ? 3 : 4,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Seatbelt Signs
  {
    var: "L:A310_SEATBELTS_SWITCH",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => !isTargetOff,
    perform_once: false,
  },
];

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run(() => tryArm());

script_message_rcv(() => tryArm(true));

loop_1hz(() => {
  if (!isArmed) return;

  const currentAltitude = getCurrentAltitude();
  if (isTargetOff && currentAltitude < this.store.off_altitude || !isTargetOff && currentAltitude > this.store.on_altitude) return;

  isArmed = false;
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
});

info(() => {
  return isArmed ? (isTargetOff ? "AUTO OFF ARMED" : "AUTO ON ARMED") : null;
});

style(() => {
  return isArmed ? "warn" : null;
});
