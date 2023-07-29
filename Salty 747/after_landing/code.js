this.store = {
	enable_speedbrake: false,
	enable_flaps: false,
	turnoff_lights_off: true,
	wing_lights_off: false,
	delay: 600,
};

this.$api.datastore.import(this.store);

settings_define({
	enable_speedbrake: {
		type: "checkbox",
		label: "Enable speedbrake retraction",
		value: this.store.enable_speedbrake,
		changed: value => {
			this.store.enable_speedbrake = value;
			this.$api.datastore.export(this.store);
		},
	},
	enable_flaps: {
		type: "checkbox",
		label: "Enable flaps retraction",
		value: this.store.enable_flaps,
		changed: value => {
			this.store.enable_flaps = value;
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
	wing_lights_off: {
		type: "checkbox",
		label: "Turn wing lights off",
		value: this.store.wing_lights_off,
		changed: value => {
			this.store.wing_lights_off = value;
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
	// Speedbrake Retract
	{
		var: null,
		action: "K:SPOILERS_ARM_OFF",
		desired_pos: () => 0,
		delay: () => 0,
		enabled: () => this.store.enable_speedbrake,
		perform_once: false,
	},
	{
		var: "A:SPOILERS HANDLE POSITION",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay + 1000,
		enabled: () => this.store.enable_speedbrake,
		perform_once: false,
	},
	// Flaps Up
	{
		var: "A:FLAPS HANDLE INDEX",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay + 1000,
		enabled: () => this.store.enable_flaps,
		perform_once: false,
	},
	// Transponder Off
	{
		var: null,
		action: "B:AIRLINER_ATC_Mode_XPNDR",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: true,
	},
	// Landing Lights Off
	{
		var: "L:LIGHTING_LANDING_1",
		action: "B:LIGHTING_LANDING_1_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:LIGHTING_LANDING_4",
		action: "B:LIGHTING_LANDING_4_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:LIGHTING_LANDING_2",
		action: "B:LIGHTING_LANDING_2_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:LIGHTING_LANDING_3",
		action: "B:LIGHTING_LANDING_3_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Runway Turnoff Lights Off
	{
		var: "L:LIGHTING_TAXI_1",
		action: "B:LIGHTING_TAXI_1_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => this.store.turnoff_lights_off,
		perform_once: false,
	},
	{
		var: "L:LIGHTING_TAXI_2",
		action: "B:LIGHTING_TAXI_2_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => this.store.turnoff_lights_off,
		perform_once: false,
	},
	// Taxi Lights On
	{
		var: "L:LIGHTING_TAXI_3",
		action: "B:LIGHTING_TAXI_3_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Wing Lights
	{
		var: "L:LIGHTING_WING_0",
		action: "B:LIGHTING_WING_0_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => this.store.wing_lights_off,
		perform_once: false,
	},
	// Strobe Lights Off
	{
		var: "L:LIGHTING_STROBE_0",
		action: "B:LIGHTING_STROBE_0_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// APU On
	{
		var: "L:XMLVAR_APU_StarterKnob_Pos",
		action: null,
		desired_pos: () => 2,
		delay: () => 0,
		enabled: () => true,
		perform_once: true,
	},
	{
		var: null,
		action: "K:APU_STARTER",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
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
