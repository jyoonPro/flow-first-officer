this.store = {
  enable_seatbelt: false,
  takeoff_taxi_lights: false,
  wing_lights: false,
  start_timer: true,
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
  takeoff_taxi_lights: {
    type: "checkbox",
    label: "Taxi lights ON during takeoff",
    value: this.store.takeoff_taxi_lights,
    changed: value => {
      this.store.takeoff_taxi_lights = value;
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
  // A/T Arm
  {
    var: "L:switch_380_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 38002,
    decr: 38001,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Reset Fuel Flow
  {
    var: "L:switch_468_73X",
    desired_pos: () => 0,
    step: 50,
    action: null,
    incr: 46802,
    decr: 46801,
    interval_delay: 0,
    delay: () => 300,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_468_73X",
    desired_pos: () => 50,
    step: 50,
    action: null,
    incr: 46805,
    decr: 46804,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Seatbelt & Smoke Signs
  {
    var: "L:switch_103_73X",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 10302,
    decr: 10301,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  {
    var: "L:switch_104_73X",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 10402,
    decr: 10401,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  // Logo Lights
  {
    var: "L:switch_122_73X",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 12202,
    decr: 12201,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => isDark(),
    perform_once: false,
  },
  // Position Strobe & Steady
  {
    var: "L:switch_123_73X",
    desired_pos: () => 0,
    step: 50,
    action: null,
    incr: 12302,
    decr: 12301,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:switch_125_73X",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 12502,
    decr: 12501,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.wing_lights || isDark(),
    perform_once: false,
  },
  // Wheel Well Lights Off
  {
    var: "L:switch_126_73X",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 12602,
    decr: 12601,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Taxi Lights
  {
    var: "L:switch_117_73X",
    desired_pos: () => this.store.takeoff_taxi_lights ? 100 : 0,
    step: 100,
    action: null,
    incr: 11702,
    decr: 11701,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Landing Lights On
  {
    var: "L:switch_111_73X",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 11102,
    decr: 11101,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_112_73X",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 11202,
    decr: 11201,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_113_73X",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 11302,
    decr: 11301,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_114_73X",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 11402,
    decr: 11401,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights On
  {
    var: "L:switch_115_73X",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 11502,
    decr: 11501,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_116_73X",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 11602,
    decr: 11601,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Transponder TA/RA
  {
    var: "L:switch_800_73X",
    desired_pos: () => this.store.tcas_ta_only ? 30 : 40,
    step: 10,
    action: null,
    incr: 80001,
    decr: 80002,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Packs Off
  {
    var: "L:switch_200_73X",
    desired_pos: () => 0,
    step: 50,
    action: null,
    incr: 20002,
    decr: 20001,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
    perform_once: false,
  },
  {
    var: "L:switch_201_73X",
    desired_pos: () => 0,
    step: 50,
    action: null,
    incr: 20102,
    decr: 20101,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
    perform_once: false,
  },
  // Start Elapsed Timer
  {
    var: "L:switch_321_73X",
    desired_pos: () => 100,
    step: 100,
    action: 32101,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.start_timer,
    perform_once: true,
  },
  {
    var: "L:switch_530_73X",
    desired_pos: () => 100,
    step: 100,
    action: 53001,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.start_timer,
    perform_once: true,
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

  this.$api.command.script_message_send("737-auto-ll", "", (callback) => {});
  return false;
});
