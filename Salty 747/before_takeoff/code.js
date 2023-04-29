this.store = {
  enable_seatbelt: false,
  takeoff_taxi_lights: false,
	tcas_ta_only: false,
	delay: "450",
};

this.$api.datastore.import(this.store);

settings_define({
	enable_seatbelt: {
		type: "checkbox",
		label: "Enable seatbelt signs check",
		value: this.store.enable_seatbelt,
		changed: (value) => {
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
		label: "Delay between actions in milliseconds",
		value: this.store.delay,
		changed: (value) => {
			this.store.delay = value;
			this.$api.datastore.export(this.store);
		},
	},
});

const commandList = [
	// Seatbelt & Smoke Signs
	{
		var: "A:CABIN SEATBELTS ALERT SWITCH",
		action: "B:AIRLINER_Seatbelts_On",
		desired_pos: () => 1,
		delay: 0,
		enabled: () => this.store.enable_seatbelt,
	},
	// Landing Lights On
	{
		var: "L:LIGHTING_LANDING_1",
		action: "B:LIGHTING_LANDING_1_SET",
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
	{
		var: "L:LIGHTING_LANDING_4",
		action: "B:LIGHTING_LANDING_4_SET",
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
	{
		var: "L:LIGHTING_LANDING_2",
		action: "B:LIGHTING_LANDING_2_SET",
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
	{
		var: "L:LIGHTING_LANDING_3",
		action: "B:LIGHTING_LANDING_3_SET",
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
	// Runway Turnoff Lights On
	{
		var: "L:LIGHTING_TAXI_1",
		action: "B:LIGHTING_TAXI_1_SET",
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
	{
		var: "L:LIGHTING_TAXI_2",
		action: "B:LIGHTING_TAXI_2_SET",
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
	// Taxi Lights Off
	{
		var: "L:LIGHTING_TAXI_3",
		action: "B:LIGHTING_TAXI_3_SET",
		desired_pos: () => this.store.takeoff_taxi_lights ? 1 : 0,
		delay: 0,
		enabled: () => true,
	},
	// Strobe Lights On
	{
		var: "L:LIGHTING_STROBE_0",
		action: "B:LIGHTING_STROBE_0_SET",
		desired_pos: () => 1,
		delay: 0,
		enabled: () => true,
	},
	// Transponder TA/RA
	{
		var: "L:XMLVAR_Transponder_Mode",
		action: null,
		desired_pos: () => this.store.tcas_ta_only ? 2 : 3,
		delay: 0,
		enabled: () => true,
	},
	// Autobrake RTO
	{
		var: "A:AUTO BRAKE SWITCH CB",
		action: "B:HANDLING_Autobrake_1_RTO",
		desired_pos: () => 0,
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
