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
    var: "L:switch_111_73X",
    desired_pos: () => isBelow ? 0 : 100,
    step: 50,
    action: null,
    incr: 11102,
    decr: 11101,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  {
    var: "L:switch_112_73X",
    desired_pos: () => isBelow ? 0 : 100,
    step: 50,
    action: null,
    incr: 11202,
    decr: 11201,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  {
    var: "L:switch_113_73X",
    desired_pos: () => isBelow ? 0 : 100,
    step: 100,
    action: null,
    incr: 11302,
    decr: 11301,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  {
    var: "L:switch_114_73X",
    desired_pos: () => isBelow ? 0 : 100,
    step: 100,
    action: null,
    incr: 11402,
    decr: 11401,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  // Runway Turnoff Lights
  {
    var: "L:switch_115_73X",
    desired_pos: () => isBelow ? 0 : 100,
    step: 100,
    action: null,
    incr: 11502,
    decr: 11501,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  {
    var: "L:switch_116_73X",
    desired_pos: () => isBelow ? 0 : 100,
    step: 100,
    action: null,
    incr: 11602,
    decr: 11601,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  // Taxi Lights
  {
    var: "L:switch_117_73X",
    desired_pos: () => isBelow ? 0 : 100,
    step: 100,
    action: null,
    incr: 11702,
    decr: 11701,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  // Logo Lights
  {
    var: "L:switch_122_73X",
    desired_pos: () => isBelow ? 0 : 100,
    step: 100,
    action: null,
    incr: 12202,
    decr: 12201,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => isDark(),
  },
  // Wing Lights
  {
    var: "L:switch_125_73X",
    desired_pos: () => isBelow ? 0 : 100,
    step: 100,
    action: null,
    incr: 12502,
    decr: 12501,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => isDark(),
  },
  // Engine
  {
    var: "L:switch_119_73X",
    desired_pos: () => isBelow ? 10 : 20,
    step: 10,
    action: null,
    incr: 11901,
    decr: 11902,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
  },
  {
    var: "L:switch_121_73X",
    desired_pos: () => isBelow ? 10 : 20,
    step: 10,
    action: null,
    incr: 12101,
    decr: 12102,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
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
        let action = command.action;
        let repeatCount = 1;
        if (!action) {
          repeatCount = Math.min(Math.abs(command.desired_pos() - state) / command.step, 5);
          action = command.desired_pos() < state ? command.incr : command.decr;
        }
        for (let i = 1; i <= repeatCount; i++) {
          this.$api.variables.set("K:ROTOR_BRAKE", "number", action);

          let delay = command.delay();
          if (i < repeatCount && command.interval_delay > 0) {
            delay = command.interval_delay;
          }

          if (delay > 0) {
            await timeout(delay);
          }
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
