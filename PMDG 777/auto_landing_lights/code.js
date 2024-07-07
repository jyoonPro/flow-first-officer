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
}

const commandList = [
  // Landing Lights
  {
    var: "L:switch_22_a",
    desired_pos: () => isTargetOff ? 0 : 100,
    step: 100,
    action: null,
    incr: 2202,
    decr: 2201,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_23_a",
    desired_pos: () => isTargetOff ? 0 : 100,
    step: 100,
    action: null,
    incr: 2302,
    decr: 2301,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_24_a",
    desired_pos: () => isTargetOff ? 0 : 100,
    step: 100,
    action: null,
    incr: 2402,
    decr: 2401,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights
  {
    var: "L:switch_119_a",
    desired_pos: () => isTargetOff ? 0 : 100,
    step: 100,
    action: null,
    incr: 11902,
    decr: 11901,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_120_a",
    desired_pos: () => isTargetOff ? 0 : 100,
    step: 100,
    action: null,
    incr: 12002,
    decr: 12001,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Taxi Lights
  {
    var: "L:switch_121_a",
    desired_pos: () => isTargetOff ? 0 : 100,
    step: 100,
    action: null,
    incr: 12102,
    decr: 12101,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Logo Lights
  {
    var: "L:switch_116_a",
    desired_pos: () => isTargetOff ? 0 : 100,
    step: 100,
    action: null,
    incr: 11602,
    decr: 11601,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => isTargetOff || isDark(),
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:switch_117_a",
    desired_pos: () => isTargetOff ? 0 : 100,
    step: 100,
    action: null,
    incr: 11702,
    decr: 11701,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => isTargetOff || this.store.wing_lights || isDark(),
    perform_once: false,
  },
  // Seatbelt Signs
  {
    var: "L:switch_30_a",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 3008,
    decr: 3007,
    interval_delay: 100,
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
        let action = command.action;
        let repeatCount = 1;
        if (!action) {
          repeatCount = Math.min(Math.abs(command.desired_pos() - state) / command.step, 5);
          action = command.desired_pos() < state ? command.incr : command.decr;
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

          this.$api.variables.set("K:ROTOR_BRAKE", "number", action);

          if (delay > 0) {
            await timeout(delay);
          }

          state = this.$api.variables.get(command.var, "number");
        }

        if (command.perform_once) break;
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
