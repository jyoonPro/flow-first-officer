this.store = {
  enable_seatbelt: false,
  takeoff_taxi_lights: true,
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
    var: "L:switch_204_a",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 20401,
    decr: 20402,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:switch_205_a",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 20501,
    decr: 20502,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Seatbelt
  {
    var: "L:switch_29_a",
    desired_pos: () => 50,
    step: 50,
    action: null,
    incr: 2908,
    decr: 2907,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  {
    var: "L:switch_30_a",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 3008,
    decr: 3007,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  // Logo Lights
  {
    var: "L:switch_116_a",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 11602,
    decr: 11601,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => isDark(),
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:switch_117_a",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 11702,
    decr: 11701,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.wing_lights || isDark(),
    perform_once: false,
  },
  // Runway Turnoff Lights On
  {
    var: "L:switch_119_a",
    desired_pos: () => 100,
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
    desired_pos: () => 100,
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
    desired_pos: () => this.store.takeoff_taxi_lights ? 100 : 0,
    step: 100,
    action: null,
    incr: 12102,
    decr: 12101,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Strobe Lights On
  {
    var: "L:switch_122_a",
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 12202,
    decr: 12201,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Landing Lights On
  {
    var: "L:switch_22_a",
    desired_pos: () => 100,
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
    desired_pos: () => 100,
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
    desired_pos: () => 100,
    step: 100,
    action: null,
    incr: 2402,
    decr: 2401,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Transponder TA/RA
  {
    var: "L:switch_749_a",
    desired_pos: () => this.store.tcas_ta_only ? 30 : 40,
    step: 10,
    action: null,
    incr: 74901,
    decr: 74902,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Packs Off
  {
    var: "L:switch_135_a",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 13502,
    decr: 13501,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
    perform_once: false,
  },
  {
    var: "L:switch_136_a",
    desired_pos: () => 0,
    step: 100,
    action: null,
    incr: 13602,
    decr: 13601,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
    perform_once: false,
  },
  // Start Elapsed Timer
  {
    var: "L:switch_173_a",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 17301,
    decr: 17302,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.start_timer,
    perform_once: true,
  },
  {
    var: "L:switch_281_a",
    desired_pos: () => 100,
    step: 50,
    action: null,
    incr: 28101,
    decr: 28102,
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

  this.$api.command.script_message_send("777-auto-ll", "", (callback) => {});
  return false;
});
