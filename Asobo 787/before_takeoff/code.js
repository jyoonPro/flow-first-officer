this.store = {
  enable_seatbelt: false,
  takeoff_taxi_lights: false,
	wing_lights: false,
	tcas_ta_only: false,
	packs_off: false,
	delay: 600,
};

this.$api.datastore.import(this.store);

settings_define({
	enable_seatbelt: {
		type: "checkbox",
		label: "Enable seatbelt signs check (Animations are INOP)",
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
		var: "L:WT_SEAT_BELTS_MODE",
		action: null,
		desired_pos: () => 2,
		delay: () => this.store.delay,
		enabled: () => this.store.enable_seatbelt,
		perform_once: false,
	},
	// Landing Lights On
	{
		var: "L:LIGHTING_LANDING_2",
		action: "B:LIGHTING_LANDING_2_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:LIGHTING_LANDING_1",
		action: "B:LIGHTING_LANDING_1_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:LIGHTING_LANDING_3",
		action: "B:LIGHTING_LANDING_3_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Runway Turnoff Lights On
	{
		var: "L:LIGHTING_TAXI_2",
		action: "B:LIGHTING_TAXI_2_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:LIGHTING_TAXI_3",
		action: "B:LIGHTING_TAXI_3_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Taxi Lights Off
	{
		var: "L:LIGHTING_TAXI_1",
		action: "B:LIGHTING_TAXI_1_SET",
    desired_pos: () => this.store.takeoff_taxi_lights ? 1 : 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Strobe Lights On
	{
		var: "L:LIGHTING_STROBE_1",
		action: "B:LIGHTING_STROBE_1_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Logo Lights
	{
		var: "L:LIGHTING_LOGO_1",
		action: "B:LIGHTING_LOGO_1_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => isDark(),
		perform_once: false,
	},
	// Wing Lights
	{
		var: "L:LIGHTING_WING_1",
		action: "B:LIGHTING_WING_1_SET",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => this.store.wing_lights || isDark(),
		perform_once: false,
	},
	// Transponder TA/RA
	{
		var: "L:XMLVAR_Transponder_Mode",
		action: null,
		desired_pos: () => this.store.tcas_ta_only ? 2 : 3,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: true,
	},
	// Packs Off
	{
		var: "L:XMLVAR_Packs_L_Switch",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => this.store.packs_off,
		perform_once: false,
	},
	{
		var: "L:XMLVAR_Packs_R_Switch",
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

	this.$api.command.script_message_send("787-asobo-auto-ll", "", (callback) => {});
	return false;
});
