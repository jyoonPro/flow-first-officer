this.store = {
  enable_seatbelt: false,
  takeoff_taxi_lights: false,
  wing_lights: false,
  start_timer: true,
  tcas_ta_only: false,
  delay: "450",
};

this.$api.datastore.import(this.store);

const isDark = () => this.$api.time.get_sun_position().altitudeDegrees < 5;

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
      this.store.delay = value;
      this.$api.datastore.export(this.store);
    },
  },
});

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
    delay: () => 0,
    enabled: () => true,
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
    delay: () => 100 - this.store.delay,
    enabled: () => true,
  },
  {
    var: "L:switch_468_73X",
    desired_pos: () => 50,
    step: 50,
    action: null,
    incr: 46805,
    decr: 46804,
    interval_delay: 0,
    delay: () => 0,
    enabled: () => true,
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
    delay: () => 0,
    enabled: () => this.store.enable_seatbelt,
  },
  {
    var: "L:switch_104_73X",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 10402,
    decr: 10401,
    interval_delay: 100,
    delay: () => 0,
    enabled: () => this.store.enable_seatbelt,
  },
  // Logo Lights
  {
    var: "L:switch_122_73X",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 12202,
    decr: 12201,
    interval_delay: 0,
    delay: () => 0,
    enabled: () => isDark(),
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
    delay: () => 0,
    enabled: () => true,
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
    delay: () => 0,
    enabled: () => this.store.wing_lights || isDark(),
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
    delay: () => 0,
    enabled: () => true,
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
    delay: () => 0,
    enabled: () => true,
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
    delay: () => 0,
    enabled: () => true,
  },
  {
    var: "L:switch_112_73X",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 11202,
    decr: 11201,
    interval_delay: 100,
    delay: () => 0,
    enabled: () => true,
  },
  {
    var: "L:switch_113_73X",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 11302,
    decr: 11301,
    interval_delay: 0,
    delay: () => 0,
    enabled: () => true,
  },
  {
    var: "L:switch_114_73X",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 11402,
    decr: 11401,
    interval_delay: 0,
    delay: () => 0,
    enabled: () => true,
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
    delay: () => 0,
    enabled: () => true,
  },
  {
    var: "L:switch_116_73X",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 11602,
    decr: 11601,
    interval_delay: 0,
    delay: () => 0,
    enabled: () => true,
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
    delay: () => 0,
    enabled: () => true,
  },
  // Start Elapsed Timer
  {
    var: "L:switch_320_73X",
    desired_pos: () => 100,
    step: 100,
    action: 32001,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 0,
    enabled: () => this.store.start_timer,
  },
  {
    var: "L:switch_529_73X",
    desired_pos: () => 100,
    step: 100,
    action: 52901,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 0,
    enabled: () => this.store.start_timer,
  },
  {
    var: "L:switch_321_73X",
    desired_pos: () => 100,
    step: 100,
    action: 32101,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 0,
    enabled: () => this.store.start_timer,
  },
  {
    var: "L:switch_530_73X",
    desired_pos: () => 100,
    step: 100,
    action: 53001,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 0,
    enabled: () => this.store.start_timer,
  },
];

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run(() => {
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
          } else if (Number(this.store.delay) > 0) {
            delay += Number(this.store.delay) || 450;
          }

          if (delay > 0) {
            await timeout(delay);
          }
        }
      }
    }
  })();

  this.$api.command.script_message_send("737-auto-ll", "", (callback) => {});
  return false;
});
