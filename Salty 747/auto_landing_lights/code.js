this.store = {
  off_altitude: 9000,
  on_altitude: 11000,
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
}

const commandList = [
  // Landing Lights
  {
    var: "L:LIGHTING_LANDING_1",
    action: "B:LIGHTING_LANDING_1_SET",
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  {
    var: "L:LIGHTING_LANDING_4",
    action: "B:LIGHTING_LANDING_4_SET",
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  {
    var: "L:LIGHTING_LANDING_2",
    action: "B:LIGHTING_LANDING_2_SET",
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  {
    var: "L:LIGHTING_LANDING_3",
    action: "B:LIGHTING_LANDING_3_SET",
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  // Runway Turnoff Lights
  {
    var: "L:LIGHTING_TAXI_1",
    action: "B:LIGHTING_TAXI_1_SET",
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  {
    var: "L:LIGHTING_TAXI_2",
    action: "B:LIGHTING_TAXI_2_SET",
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  // Taxi Lights
  {
    var: "L:LIGHTING_TAXI_3",
    action: "B:LIGHTING_TAXI_3_SET",
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  // Wing Lights
  {
    var: "L:LIGHTING_WING_0",
    action: "B:LIGHTING_WING_0_SET",
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => isTargetOff || isDark(),
  },
  // Logo Lights
  {
    var: "L:LIGHTING_LOGO_0",
    action: "B:LIGHTING_LOGO_0_SET",
    desired_pos: () => isTargetOff ? 0 : 1,
    delay: () => this.store.delay,
    enabled: () => isTargetOff || isDark(),
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
  return isArmed ? (isTargetOff ? "AUTO OFF ARMED" : "AUTO ON ARMED") : null;
});

style(() => {
  return isArmed ? "warn" : null;
});
