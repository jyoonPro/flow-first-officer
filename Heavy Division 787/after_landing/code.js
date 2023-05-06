this.store = {
	enable_speedbrake: false,
	enable_flaps: false,
	delay: 450,
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
	enable_speedbrake: {
		type: "checkbox",
		label: "Enable speedbrake retraction",
		value: this.store.enable_speedbrake,
		changed: value => {
			this.store.enable_speedbrake = value;
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
		var: "A:SPOILERS HANDLE POSITION",
		action: () => null,
		desired_pos: () => 0,
		delay: () => this.store.delay + 1000,
		enabled: () => this.store.enable_speedbrake,
	},
	// Flaps Up
	{
		var: "A:FLAPS HANDLE INDEX",
		action: () => null,
		desired_pos: () => 0,
		delay: () => this.store.delay + 1000,
		enabled: () => this.store.enable_flaps,
	},
	// Transponder Off
	{
		var: null,
		action: () => "B:AIRLINER_ATC_Mode_TA",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Landing Lights Off
	{
		var: "L:LIGHTING_LANDING_2",
		action: () => "B:LIGHTING_LANDING_2_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	{
		var: "L:LIGHTING_LANDING_1",
		action: () => "B:LIGHTING_LANDING_1_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	{
		var: "L:LIGHTING_LANDING_3",
		action: () => "B:LIGHTING_LANDING_3_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Runway Turnoff Lights Off
	{
		var: "L:LIGHTING_TAXI_2",
		action: () => "B:LIGHTING_TAXI_2_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	{
		var: "L:LIGHTING_TAXI_3",
		action: () => "B:LIGHTING_TAXI_3_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Taxi Lights On
	{
		var: "L:LIGHTING_TAXI_1",
		action: () => "B:LIGHTING_TAXI_1_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Strobe Lights Off
	{
		var: "L:LIGHTING_STROBE_1",
		action: () => "B:LIGHTING_STROBE_1_SET",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// APU On
	{
		var: "L:XMLVAR_APU_StarterKnob_Pos",
		action: () => null,
		desired_pos: () => 2,
		delay: () => this.store.delay,
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
				this.$api.variables.set(command.action() || command.var, "number", command.desired_pos());

				const delay = command.delay();
				if (delay > 0) {
					await timeout(delay);
				}
			}
		}
	})();

	return false;
});
