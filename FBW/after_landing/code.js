this.store = {
	enable_spoilers: false,
	enable_flaps: false,
  stop_timer: true,
	delay: 600,
}

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
})

const commandList = [
	// Spoilers Retract
	{
		var: "L:A32NX_SPOILERS_HANDLE_POSITION",
    action: "K:SPOILERS_OFF",
		desired_pos: () => 0,
		delay: () => this.store.delay + 1000,
		enabled: () => this.store.enable_spoilers,
		perform_once: false,
  },
  {
    var: "L:A32NX_SPOILERS_ARMED",
    action: "K:SPOILERS_ARM_OFF",
    desired_pos: () => 0,
    delay: () => this.store.delay + 500,
    enabled: () => this.store.enable_spoilers,
		perform_once: false,
  },
	// Flaps Up
	{
		var: "L:A32NX_FLAPS_HANDLE_INDEX",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay + 1000,
		enabled: () => this.store.enable_flaps,
		perform_once: false,
	},
	// Strobe Lights Auto
	{
		var: "L:LIGHTING_STROBE_0",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Landing Lights Off - Add both vars for Headwind compatibility
	{
		var: "A:CIRCUIT SWITCH ON:18",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:LIGHTING_LANDING_2",
		action: null,
		desired_pos: () => 2,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "A:CIRCUIT SWITCH ON:19",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:LIGHTING_LANDING_3",
		action: null,
		desired_pos: () => 2,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Nose Light Taxi
	{
		var: "L:LIGHTING_LANDING_1",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Runway Turnoff Lights Off
	{
		var: "A:CIRCUIT SWITCH ON:21",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "A:CIRCUIT SWITCH ON:22",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// APU Master On
	{
		var: "L:A32NX_OVHD_APU_MASTER_SW_PB_IS_ON",
		action: null,
		desired_pos: () => 1,
		delay: () => 3000,
		enabled: () => true,
		perform_once: true,
	},
	// APU Start On
	{
		var: "L:A32NX_OVHD_APU_START_PB_IS_ON",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: true,
	},
	// Weather Radar Off
	{
		var: "L:XMLVAR_A320_WEATHERRADAR_SYS",
		action: null,
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	{
		var: "L:A32NX_SWITCH_RADAR_PWS_POSITION",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// TCAS STBY
	{
		var: "L:A32NX_SWITCH_TCAS_Position",
		action: null,
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
  // Stop Elapsed Timer
  {
    var: "L:A32NX_CHRONO_ET_SWITCH_POS",
    action: null,
    desired_pos: () => 1,
    delay: () => this.store.delay,
    enabled: () => this.store.stop_timer,
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
