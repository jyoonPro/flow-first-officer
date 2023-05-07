this.store = {
  enable_seatbelt: false,
  takeoff_taxi_lights: false,
	wing_lights: false,
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
  takeoff_taxi_lights: {
    type: "checkbox",
    label: "Taxi lights ON during takeoff",
    value: this.store.takeoff_taxi_lights,
    changed: value => {
      this.store.takeoff_taxi_lights = value;
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
		var: "A:CABIN SEATBELTS ALERT SWITCH",
		action: () => "B:AIRLINER_Seatbelts_On",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => this.store.enable_seatbelt,
	},
	// Landing Lights On
	{
		var: "L:LIGHTING_LANDING_2",
		action: () => "B:LIGHTING_LANDING_2_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	{
		var: "L:LIGHTING_LANDING_1",
		action: () => "B:LIGHTING_LANDING_1_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	{
		var: "L:LIGHTING_LANDING_3",
		action: () => "B:LIGHTING_LANDING_3_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Runway Turnoff Lights On
	{
		var: "L:LIGHTING_TAXI_2",
		action: () => "B:LIGHTING_TAXI_2_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	{
		var: "L:LIGHTING_TAXI_3",
		action: () => "B:LIGHTING_TAXI_3_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Taxi Lights Off
	{
		var: "L:LIGHTING_TAXI_1",
		action: () => "B:LIGHTING_TAXI_1_SET",
    desired_pos: () => this.store.takeoff_taxi_lights ? 1 : 0,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Strobe Lights On
	{
		var: "L:LIGHTING_STROBE_1",
		action: () => "B:LIGHTING_STROBE_1_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// TODO: Logo Lights
	{
		var: "",
		action: () => "",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => isDark(),
	},
	// TODO: Wing Lights
	{
		var: "",
		action: () => "",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => this.store.wing_lights || isDark(),
	},
	// Transponder TA/RA
	{
		var: "L:XMLVAR_Transponder_Mode",
		action: () => this.store.tcas_ta_only ? "B:AIRLINER_ATC_Mode_TARA" : "B:AIRLINER_ATC_Mode_ALT",
		desired_pos: () => 4,
		delay: () => this.store.delay,
		enabled: () => true,
	},
	// Autobrake RTO
	{
		var: "A:AUTO BRAKE SWITCH CB",
		action: () => "B:HANDLING_Autobrake_1_RTO",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
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
				this.$api.variables.set(command.action() || command.var, "number", command.desired_pos());

				const delay = command.delay();
				if (delay > 0) {
					await timeout(delay);
				}
			}
		}
	})();

	this.$api.command.script_message_send("787-heavy-auto-ll", "", (callback) => {});
	return false;
});
