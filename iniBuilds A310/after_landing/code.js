this.store = {
	enable_spoilers: false,
	enable_flaps: false,
	delay: "450",
};

this.$api.datastore.import(this.store);

settings_define({
	enable_flaps: {
		type: "checkbox",
		label: "Enable flaps retraction",
		value: this.store.enable_flaps,
		changed: (value) => {
			this.store.enable_flaps = value;
			this.$api.datastore.export(this.store);
		},
	},
	enable_spoilers: {
		type: "checkbox",
		label: "Enable spoilers retraction",
		value: this.store.enable_spoilers,
		changed: (value) => {
			this.store.enable_spoilers = value;
			this.$api.datastore.export(this.store);
		},
	},
	delay: {
		type: "text",
		label: "Delay between actions in milliseconds",
		value: this.store.delay,
		changed: (value) => {
			this.store.delay = value;
			this.$api.datastore.export(this.store);
		},
	},
});

const commandList = [
	// Spoilers Retract
	{
		var: "L:A310_SPOILERS_HANDLE_POSITION",
		action: "B:Handling_Spoilers_Set",
		desired_pos: () => 0,
		delay: 100,
		enabled: () => this.store.enable_spoilers,
	},
	// Flaps Up
	{
		var: "L:FLAPS_HANDLE_POSITION",
		action: "B:HANDLING_Flaps_Set",
		desired_pos: () => 0,
		delay: 100,
		enabled: () => this.store.enable_flaps,
	},
	// Landing Lights Off
	{
		var: "L:A310_LANDING_LIGHT_R_SWITCH",
		action: null,
		desired_pos: () => 2,
		delay: 0,
		enabled: () => true,
	},
	{
		var: "L:A310_LANDING_LIGHT_L_SWITCH",
		action: null,
		desired_pos: () => 2,
		delay: 0,
		enabled: () => true,
	},
	// Nose Light Taxi
	{
		var: "L:A310_TAXI_LIGHTS_SWITCH",
		action: null,
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
	// Runway Turnoff Lights Off
	{
		var: "L:A310_RWY_TURNOFF_L_SWITCH",
		action: null,
		desired_pos: () => 0,
		delay: 0,
		enabled: () => true,
	},
	{
		var: "L:A310_RWY_TURNOFF_R_SWITCH",
		action: null,
		desired_pos: () => 0,
		delay: 0,
		enabled: () => true,
	},
	// Ignition Off
	{
		var: "L:A310_ENG_IGNITION_SWITCH",
		action: null,
		desired_pos: () => 3,
		delay: 0,
		enabled: () => true,
	},
	// APU Master Switch On
	{
		var: "L:A310_apu_master_switch",
		action: null,
		desired_pos: () => 1,
		delay: 3000,
		enabled: () => true,
	},
	// APU Start On
	{
		var: "L:S_OH_ELEC_APU_START",
		action: null,
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
	{
		var: "L:A310_apu_start_button",
		action: null,
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
	// TCAS STBY
	{
		var: "L:A310_TCAS_MODE_PEDESTAL",
		action: null,
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
	// Weather Radar Off
	{
		var: "L:A310_WXR_SYS",
		action: null,
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
];

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

run(event => {
	(async () => {
		for (const command of commandList) {
			if (!command.enabled()) continue;

			const state = this.$api.variables.get(command.var, "number");
			if (state !== command.desired_pos()) {
				this.$api.variables.set(command.action || command.var, "number", command.desired_pos());

				let delay = command.delay;
				if (Number(this.store.delay) > 0) {
					delay += Number(this.store.delay) || 450;
				}

				if (delay > 0) {
					await timeout(delay);
				}
			}
		}
	})();

	return false;
});
