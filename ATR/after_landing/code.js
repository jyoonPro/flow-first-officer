this.store = {
  enable_flaps: false,
	start_timer: true,
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
	start_timer: {
		type: "checkbox",
		label: "Start chronograph",
		value: this.store.start_timer,
		changed: value => {
			this.store.start_timer = value;
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
	// Start Timer
	{
		var: "L:MSATR_CLCK_CHRONO_1",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => this.store.start_timer,
		perform_once: true,
	},
	// Flaps Up
	{
		var: "A:FLAPS HANDLE INDEX:0",
		action: "K:FLAPS_UP",
		desired_pos: () => 0,
		delay: () => this.store.delay + 1000,
		enabled: () => this.store.enable_flaps,
		perform_once: false,
	},
	// Gust Lock Engaged
	{
		var: "L:MSATR_ENG_GUSTLOCK",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// WX Radar STBY
	{
		var: "L:MSATR_WXR_MODE",
		action: null,
		desired_pos: () => 3,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Landing Lights Off
	{
		var: "L:MSATR_ELTS_LDG_LEFT",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:MSATR_ELTS_LDG_RIGHT",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Taxi & TO Lights On
	{
		var: "L:MSATR_ELTS_TAXI_TO",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Strobe Off
	{
		var: "L:MSATR_ELTS_STROBE",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Probe Heats Off
	{
		var: "L:MSATR_AICE_PROBES_CPT",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:MSATR_AICE_PROBES_STBY",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:MSATR_AICE_PROBES_FO",
		action: null,
		desired_pos: () => 0,
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

	return false;
});
