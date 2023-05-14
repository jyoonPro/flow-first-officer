this.store = {
	enable_spoilers: false,
  enable_flaps: false,
  stop_timer: true,
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
  stop_timer: {
    type: "checkbox",
    label: "Stop Elapsed Timer",
    value: this.store.stop_timer,
    changed: value => {
      this.store.stop_timer = value;
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
	// Spoilers Retract - Ensure that LVar and default SimVar agrees
	{
		var: null,
		action: "K:SPOILERS_OFF",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => this.store.enable_spoilers,
	},
	{
		var: "L:A_FC_SPEEDBRAKE",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay + 500,
		enabled: () => this.store.enable_spoilers,
	},
	// Flaps Up
	{
		var: "L:S_FC_FLAPS",
		action: "K:FLAPS_UP",
		desired_pos: () => 0,
		delay: () => this.store.delay + 1000,
		enabled: () => this.store.enable_flaps,
	},
	// Strobe Lights Auto
	{
		var: "L:S_OH_EXT_LT_STROBE",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Landing Lights Off
	{
		var: "L:S_OH_EXT_LT_LANDING_L",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	{
		var: "L:S_OH_EXT_LT_LANDING_R",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Nose Light Taxi
	{
		var: "L:S_OH_EXT_LT_NOSE",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Runway Turnoff Lights Off
	{
		var: "L:S_OH_EXT_LT_RWY_TURNOFF",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// APU Master On
	{
		var: "L:S_OH_ELEC_APU_MASTER",
		action: null,
		desired_pos: () => 1,
		delay: () => 3000,
		enabled: () => true,
	},
	// APU Start On
	{
		var: "L:S_OH_ELEC_APU_START",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	{
		var: "L:S_OH_ELEC_APU_START",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Weather Radar Off
	{
		var: "L:S_WR_SYS",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	{
		var: "L:S_WR_PRED_WS",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// TCAS STBY
	{
		var: "L:S_XPDR_MODE",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
  // Stop Elapsed Timer
  {
    var: "L:S_MIP_CLOCK_ET",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.stop_timer,
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
				this.$api.variables.set(command.action || command.var, "number", command.desired_pos());

				const delay = command.delay();
				if (delay > 0) {
					await timeout(delay);
				}
			}
		}
	})();

	return false;
});
