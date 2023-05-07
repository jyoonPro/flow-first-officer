this.store = {
  off_altitude: 9000,
  on_altitude: 11000,
  delay: 450,
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

let isArmed, isBelow;

const isDark = () => this.$api.time.get_sun_position().altitudeDegrees < 5;

const getCurrentAltitude = () => this.$api.variables.get("A:PLANE ALTITUDE", "feet");

const tryArm = (forceOn = false) => {
  const currentAltitude = getCurrentAltitude();

  if (currentAltitude < this.store.off_altitude) {
    isBelow = true;
    isArmed = forceOn || !isArmed;
  } else if (currentAltitude > this.store.on_altitude) {
    isBelow = false;
    isArmed = forceOn || !isArmed;
  } else {
    isArmed = false;
  }
}

const commandList = [
  // Landing Lights
  {
    var: "A:CIRCUIT SWITCH ON:18",
    action: null,
    desired_pos: () => isBelow ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  {
    var: "A:CIRCUIT SWITCH ON:19",
    action: null,
    desired_pos: () => isBelow ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  // Nose Light
  {
    var: "L:LIGHTING_LANDING_1",
    action: null,
    desired_pos: () => isBelow ? 2 : 0,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  // Runway Turnoff Lights
  {
    var: "A:CIRCUIT SWITCH ON:21",
    action: null,
    desired_pos: () => isBelow ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  // Wing Lights
  {
    var: "A:LIGHT WING",
    action: null,
    desired_pos: () => isBelow ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => isBelow || isDark(),
  },
  // Logo Lights
  {
    var: "A:LIGHT LOGO",
    action: null,
    desired_pos: () => isBelow ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => isBelow || isDark(),
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
  if (isBelow && currentAltitude < this.store.off_altitude || !isBelow && currentAltitude > this.store.on_altitude) return;

  isArmed = false;
  (async () => {
    for (const command of commandList) {
      if (!command.enabled()) continue;

      const state = this.$api.variables.get(command.var, "number");
      if (state !== command.desired_pos()) {
        this.$api.variables.set(command.action || command.var, "number", command.desired_pos());

        const delay = command.delay();
        if (delay > 0) {
          await timeout(delay);
        }
      }
    }
  })();
});

info(() => {
  return isArmed ? (isBelow ? "AUTO OFF ARMED" : "AUTO ON ARMED") : null;
});

style(() => {
  return isArmed ? "warn" : null;
});
