this.store = {
  enable_spoilers: false,
  enable_flaps: false,
  turnoff_lights_off: true,
  delay: 600,
};

this.$api.datastore.import(this.store);

settings_define({
  enable_flaps: {
    type: "checkbox",
    label: "Enable flaps retraction",
    value: this.store.enable_flaps,
    changed: value => {
      this.store.enable_flaps = value;
      this.$api.datastore.export(this.store);
    },
  },
  enable_spoilers: {
    type: "checkbox",
    label: "Enable spoilers retraction",
    value: this.store.enable_spoilers,
    changed: value => {
      this.store.enable_spoilers = value;
      this.$api.datastore.export(this.store);
    },
  },
  turnoff_lights_off: {
    type: "checkbox",
    label: "Turn runway turnoff lights off",
    value: this.store.turnoff_lights_off,
    changed: value => {
      this.store.turnoff_lights_off = value;
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

const commandList = [
  // Spoilers Retract
  {
    custom: true,
    custom_action: () => {
      this.$api.variables.set("K:SPOILERS_OFF", "number", 1);
    },
    delay: () => this.store.delay + 500,
    enabled: () => this.store.enable_spoilers,
  },
  {
    custom: true,
    custom_action: () => {
      this.$api.variables.set("K:SPOILERS_ARM_OFF", "number", 1);
    },
    delay: () => this.store.delay + 500,
    enabled: () => this.store.enable_spoilers,
  },
  // Flaps Up
  {
    custom: true,
    custom_action: () => {
      this.$api.variables.set("K:FLAPS_UP", "number", 1);
      // Retraction stops at flap handle gate
      this.$api.variables.set("K:FLAPS_UP", "number", 1);
    },
    delay: () => this.store.delay + 1000,
    enabled: () => this.store.enable_flaps,
  },
  // High Intensity Lights Off
  {
    var: () => "L:MD11_OVHD_LTS_HI_INT_LT",
    desired_pos: () => 1,
    step: 0,
    action: () => 90273,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 500,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: () => "L:MD11_OVHD_LTS_HI_INT_BT",
    desired_pos: () => 0,
    step: 0,
    action: () => 90274,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Landing Lights Off
  {
    var: () => "L:MD11_OVHD_LTS_LDG_L_SW",
    desired_pos: () => 0,
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
    desired_pos: () => 0,
    step: 1,
    action: () => null,
    incr: 90260,
    decr: 90259,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Nose Light Taxi
  {
    var: () => "L:MD11_OVHD_LTS_NOSE_SW",
    desired_pos: () => 1,
    step: 1,
    action: () => null,
    incr: 90262,
    decr: 90261,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights Off
  {
    var: () => "L:MD11_OVHD_LTS_RWY_TURNOFF_L_LT",
    desired_pos: () => 0,
    step: 0,
    action: () => 90263,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 500,
    enabled: () => this.store.turnoff_lights_off,
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
    desired_pos: () => 0,
    step: 0,
    action: () => 90265,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 500,
    enabled: () => this.store.turnoff_lights_off,
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
  // APU On
  {
    var: () => "L:MD11_APU_STATE",
    desired_pos: () => {
      const state = this.$api.variables.get("L:MD11_APU_STATE", "number");
      return !state ? 1 : state;
    },
    step: 0,
    action: () => 90144,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 500,
    enabled: () => true,
    perform_once: true,
  },
  {
    var: () => "L:MD11_OVHD_ELEC_APU_PWR_BT",
    desired_pos: () => 0,
    step: 0,
    action: () => 90145,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Weather Radar Off
  {
    var: () => "L:MD11_PED_WXR_OFF_BT",
    desired_pos: () => 1,
    step: 0,
    action: () => 69883,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 100,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: () => "L:MD11_PED_WXR_OFF_BT",
    desired_pos: () => 0,
    step: 0,
    action: () => 69884,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Transponder Off
  {
    var: () => "L:MD11_PED_XPNDR_ALT_RPTG_KB",
    desired_pos: () => 0,
    step: 1,
    action: () => null,
    incr: 69854,
    decr: 69854,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: () => "L:MD11_PED_XPNDR_MODE_KB",
    desired_pos: () => 1,
    step: 1,
    action: () => null,
    incr: 69877,
    decr: 69876,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Auto Brake Off
  {
    var: () => "L:MD11_CTR_AUTOBRAKE_SW",
    desired_pos: () => 1,
    step: 1,
    action: () => null,
    incr: 82212,
    decr: 82211,
    interval_delay: 100,
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

      if (command.custom) {
        command.custom_action();
        if (command.delay() > 0) {
          await timeout(command.delay());
        }
        continue;
      }

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

  return false;
});
