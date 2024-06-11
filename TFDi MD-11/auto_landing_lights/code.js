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
};

const commandList = [
  // Landing Lights
  {
    var: () => "L:MD11_OVHD_LTS_LDG_L_SW",
    desired_pos: () => isTargetOff ? 0 : 2,
    step: 1,
    action: () => null,
    incr: 90258,
    decr: 90257,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: () => "L:MD11_OVHD_LTS_LDG_R_SW",
    desired_pos: () => isTargetOff ? 0 : 2,
    step: 1,
    action: () => null,
    incr: 90260,
    decr: 90259,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Nose Light
  {
    var: () => "L:MD11_OVHD_LTS_NOSE_SW",
    desired_pos: () => isTargetOff ? 0 : 2,
    step: 1,
    action: () => null,
    incr: 90262,
    decr: 90261,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights
  {
    var: () => "L:MD11_OVHD_LTS_RWY_TURNOFF_L_LT",
    desired_pos: () => isTargetOff ? 0 : 1,
    step: 0,
    action: () => 90263,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 500,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: () => "L:MD11_OVHD_LTS_RWY_TURNOFF_L_BT",
    desired_pos: () => 0,
    step: 0,
    action: () => 90264,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: () => "L:MD11_OVHD_LTS_RWY_TURNOFF_R_LT",
    desired_pos: () => isTargetOff ? 0 : 1,
    step: 0,
    action: () => 90265,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 500,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: () => "L:MD11_OVHD_LTS_RWY_TURNOFF_R_BT",
    desired_pos: () => 0,
    step: 0,
    action: () => 90266,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Logo Lights
  {
    var: () => "L:MD11_OVHD_LTS_LOGO_ON_LT",
    desired_pos: () => isTargetOff ? 0 : 1,
    step: 0,
    action: () => 90269,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 500,
    enabled: () => isTargetOff || isDark(),
    perform_once: false,
  },
  {
    var: () => "L:MD11_OVHD_LTS_LOGO_BT",
    desired_pos: () => 0,
    step: 0,
    action: () => 90270,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Seatbelt Signs
  {
    var: () => "L:MD11_OVHD_LTS_SEAT_BELTS_SW",
    desired_pos: () => 2,
    step: 1,
    action: () => null,
    incr: 90249,
    decr: 90248,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => !isTargetOff,
    perform_once: false,
  },
  // Auto Brake
  {
    var: () => "L:MD11_CTR_AUTOBRAKE_SW",
    desired_pos: () => 1,
    step: 1,
    action: () => null,
    incr: 82212,
    decr: 82211,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => isTargetOff,
    perform_once: false,
  },
];

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run(() => {
  tryArm()
});

script_message_rcv(() => tryArm(true));

loop_1hz(() => {
  if (!isArmed) return;

  const currentAltitude = getCurrentAltitude();
  if (isTargetOff && currentAltitude < this.store.off_altitude || !isTargetOff && currentAltitude > this.store.on_altitude) return;

  isArmed = false;
  (async () => {
    for (const command of commandList) {
      if (!command.enabled()) continue;

      let state = this.$api.variables.get(command.var(), "number");
      let retry = 3;
      while (state !== command.desired_pos() && retry-- > 0) {
        let action = command.action();
        let repeatCount = 1;
        if (!action) {
          repeatCount = Math.min(Math.abs(command.desired_pos() - state) / command.step, 5);
          action = state < command.desired_pos() ? command.incr : command.decr;
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

          this.$api.variables.set("L:CEVENT", "number", action);

          if (delay > 0) {
            await timeout(delay);
          }

          state = this.$api.variables.get(command.var(), "number");
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
