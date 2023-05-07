this.store = {
  enable_seatbelt: false,
	wing_lights: false,
  start_timer: true,
	tcas_ta_only: false,
	delay: 450,
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
			const delay = Number(value);
			if (Number.isInteger(delay) && delay >= 0) {
				this.store.delay = delay;
				this.$api.datastore.export(this.store);
			}
		},
	},
});

const commandList = [
	// Seatbelt & Smoke Signs
	{
		var: "L:A310_SEATBELTS_SWITCH",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => this.store.enable_seatbelt,
	},
	{
		var: "L:A310_NO_SMOKING_SWITCH",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => this.store.enable_seatbelt,
	},
	// Weather Radar On
	{
		var: "L:A310_WXR_SYS",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Strobe Lights On
	{
		var: "L:A310_POTENTIOMETER_24",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Wing Lights
	{
		var: "L:A310_WING_LIGHT_SWITCH",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => this.store.wing_lights || isDark(),
	},
	// Landing Lights On
	{
		var: "L:A310_LANDING_LIGHT_R_SWITCH",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	{
		var: "L:A310_LANDING_LIGHT_L_SWITCH",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Nose Light TO
	{
		var: "L:A310_TAXI_LIGHTS_SWITCH",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Nav & Logo Lights
	{
		var: "L:A310_NAV_LOGO_LIGHT_SWITCH",
		action: null,
		desired_pos: () => isDark() ? 1 : 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Runway Turnoff Lights On
	{
		var: "L:A310_RWY_TURNOFF_L_SWITCH",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	{
		var: "L:A310_RWY_TURNOFF_R_SWITCH",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// TCAS TA/RA
	{
		var: "L:A310_TCAS_MODE_PEDESTAL",
		action: null,
		desired_pos: () => this.store.tcas_ta_only ? 3 : 2,
		delay: () => this.store.delay,
		enabled: () => true,
	},
  // Start Elapsed Timer
  {
    var: "L:__CPT_CLOCK_RUNIsPressed",
    action: "L:A310_ET_TOGGLE_BUTTON",
    desired_pos: (isAction) => isAction ? 1 : 0,
    delay: () => this.store.delay,
    enabled: () => this.store.start_timer,
  },
  {
    var: "L:__FO_CLOCK_RUNIsPressed",
    action: "L:A310_ET_TOGGLE_BUTTON_FO",
    desired_pos: (isAction) => isAction ? 1 : 0,
    delay: () => this.store.delay,
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
				this.$api.variables.set(command.action || command.var, "number", command.desired_pos(true));

				const delay = command.delay();
				if (delay > 0) {
					await timeout(delay);
				}
			}
		}
	})();

	this.$api.command.script_message_send("a310-auto-ll", "", (callback) => {});
	return false;
});
