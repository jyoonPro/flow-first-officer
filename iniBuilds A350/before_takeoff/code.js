this.store = {
  enable_seatbelt: false,
  wing_lights: false,
  xpndr_on: true,
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
  wing_lights: {
    type: "checkbox",
    label: "Enable wing lights ON",
    value: this.store.wing_lights,
    changed: value => {
      this.store.wing_lights = value;
      this.$api.datastore.export(this.store);
    },
  },
  xpndr_on: {
    type: "checkbox",
    label: "Turn transponder on instead of auto",
    value: this.store.xpndr_on,
    changed: value => {
      this.store.xpndr_on = value;
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
  // Seatbelt & Smoke Signs
  {
    var: "L:INI_SEATBELTS_SWITCH",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  {
    var: "L:INI_NO_SMOKING_SWITCH",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  {
    var: "L:INI_SIGNS_NO_MOBILE",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.enable_seatbelt,
    perform_once: false,
  },
  // Strobe Lights On
  {
    var: "L:INI_LIGHTS_STROBE",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Wing Lights
  {
    var: "L:INI_LIGHTS_WING",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.wing_lights || isDark(),
    perform_once: false,
  },
  // Nav & Logo Lights
  {
    var: "L:INI_LIGHTS_NAV",
    action: null,
    desired_pos: () => {
      const current_pos = this.$api.variables.get("L:INI_LIGHTS_NAV", "number");
      return current_pos === 0 ? 2 : current_pos;
    },
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  {
    var: "L:INI_LIGHTS_LOGO",
    action: null,
    desired_pos: () => {
      const current_pos = this.$api.variables.get("L:INI_LIGHTS_LOGO", "number");
      return current_pos === 0 ? 1 : current_pos;
    },
    delay: () => this.store.delay,
    enabled: () => isDark(),
    perform_once: false,
  },
  // Landing Lights On
  {
    var: "L:INI_LIGHTS_LANDING",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Nose Light TO
  {
    var: "L:INI_LIGHTS_NOSE",
    action: null,
    desired_pos: () => 2,
    delay: () => this.store.delay,
    enabled: () => true,
    perform_once: false,
  },
  // Packs Off
  {
    var: "L:INI_AIR_PACK1_BUTTON",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
    perform_once: false,
  },
  {
    var: "L:INI_AIR_PACK2_BUTTON",
    action: null,
    desired_pos: () => 0,
    delay: () => this.store.delay,
    enabled: () => this.store.packs_off,
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

      let state = this.$api.variables.get(command.var, "number");
      let retry = 3;
      while (state !== command.desired_pos() && retry-- > 0) {
        this.$api.variables.set(command.action || command.var, "number", command.desired_pos());

        const delay = command.delay();
        if (delay > 0) {
          await timeout(delay);
        }

        if (command.perform_once) break;
        state = this.$api.variables.get(command.var, "number");
      }
    }
  })();

  this.$api.command.script_message_send("a350-ini-auto-ll", "", (callback) => {
  });
  return false;
});
