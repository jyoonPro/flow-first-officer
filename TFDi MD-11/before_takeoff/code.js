this.store = {
  enable_seatbelt: false,
  nose_lights_land: false,
  tcas_ta_only: false,
  wxr_mode: 0,
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
  nose_lights_land: {
    type: "checkbox",
    label: "Set nose lights to LAND",
    value: this.store.nose_lights_land,
    changed: value => {
      this.store.nose_lights_land = value;
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
  wxr_mode: {
    type: "text",
    label: "Weather radar mode",
    description: "0=Disabled (no change to current state)<br>1=WX<br>2=WX/T<br>3=MAP",
    value: this.store.wxr_mode,
    changed: value => {
      const mode = Number(value);
      if (Number.isInteger(mode) && mode >= 0 && mode <= 3) {
        this.store.wxr_mode = mode;
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

const isDark = () => this.$api.time.get_sun_position().altitudeDegrees < 5;

const commandList = [
  // Seatbelt & Smoke Signs
  {
    var: () => "L:MD11_OVHD_LTS_SEAT_BELTS_SW",
    desired_pos: () => 2,
    step: 1,
    action: () => null,
    incr: 90249,
    decr: 90248,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  {
    var: () => "L:MD11_OVHD_LTS_NO_SMOKE_SW",
    desired_pos: () => 1,
    step: 1,
    action: () => null,
    incr: 90247,
    decr: 90246,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  // Logo Lights
  {
    var: () => "L:MD11_OVHD_LTS_LOGO_ON_LT",
    desired_pos: () => 1,
    step: 0,
    action: () => 90269,
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 500,
    enabled: () => isDark(),
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
  // TCAS TA/RA
  {
    var: () => "L:MD11_PED_XPNDR_ALT_RPTG_KB",
    desired_pos: () => 1,
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
    desired_pos: () => this.store.tcas_ta_only ? 2 : 3,
    step: 1,
    action: () => null,
    incr: 69877,
    decr: 69876,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Weather Radar On
  {
    var: () => {
      if (this.store.wxr_mode === 1) return "L:MD11_PED_WXR_WX_BT"
      if (this.store.wxr_mode === 2) return "L:MD11_PED_WXR_WXT_BT"
      if (this.store.wxr_mode === 3) return "L:MD11_PED_WXR_MAP_BT"
      return null;
    },
    desired_pos: () => 1,
    step: 0,
    action: () => {
      if (this.store.wxr_mode === 1) return 69889;
      if (this.store.wxr_mode === 2) return 69887;
      if (this.store.wxr_mode === 3) return 69891;
      return null;
    },
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => 100,
    enabled: () => this.store.wxr_mode,
    perform_once: false,
  },
  {
    var: () => {
      if (this.store.wxr_mode === 1) return "L:MD11_PED_WXR_WX_BT"
      if (this.store.wxr_mode === 2) return "L:MD11_PED_WXR_WXT_BT"
      if (this.store.wxr_mode === 3) return "L:MD11_PED_WXR_MAP_BT"
      return null;
    },
    desired_pos: () => 0,
    step: 0,
    action: () => {
      if (this.store.wxr_mode === 1) return 69890;
      if (this.store.wxr_mode === 2) return 69888;
      if (this.store.wxr_mode === 3) return 69892;
      return null;
    },
    incr: null,
    decr: null,
    interval_delay: 0,
    delay: () => this.store.delay,
    enabled: () => this.store.wxr_mode,
    perform_once: false,
  },
  // High Intensity Lights On
  {
    var: () => "L:MD11_OVHD_LTS_HI_INT_LT",
    desired_pos: () => 0,
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
  // Landing Lights On
  {
    var: () => "L:MD11_OVHD_LTS_LDG_L_SW",
    desired_pos: () => 2,
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
    desired_pos: () => 2,
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
    desired_pos: () => this.store.nose_lights_land ? 2 : 1,
    step: 1,
    action: () => null,
    incr: 90262,
    decr: 90261,
    interval_delay: 100,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Runway Turnoff Lights On
  {
    var: () => "L:MD11_OVHD_LTS_RWY_TURNOFF_L_LT",
    desired_pos: () => 1,
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
    desired_pos: () => 1,
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
];

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run(() => {
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

  this.$api.command.script_message_send("tfdi-md11-auto-ll", "", (callback) => {
  });
  return false;
});
