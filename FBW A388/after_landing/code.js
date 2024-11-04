this.store = {
	enable_spoilers: false,
	enable_flaps: false,
	turnoff_lights_off: true,
	wing_lights_off: false,
	strobe_off: false,
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
	strobe_off: {
		type: "checkbox",
		label: "Turn strobe lights off instead of auto",
		value: this.store.strobe_off,
		changed: value => {
			this.store.strobe_off = value;
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
		action: "B:LIGHTING_STROBE_0_Set",
		desired_pos: () => this.store.strobe_off ? 2 : 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Wing Lights
	{
		var: "L:LIGHTING_WING_0",
		action: "B:LIGHTING_WING_0_Set",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => this.store.wing_lights_off,
		perform_once: false,
	},
	// Landing Lights Off
	{
		var: "L:LIGHTING_LANDING_2",
		action: "B:LIGHTING_LANDING_2_Set",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Nose Light Taxi
	{
		var: "L:LIGHTING_LANDING_1",
		action: "B:LIGHTING_LANDING_1_Set",
		desired_pos: () => 1,
		delay: () => this.store.delay,
		enabled: () => true,
		perform_once: false,
	},
	// Runway Turnoff Lights Off
	{
		var: "L:LIGHTING_TAXI_2",
		action: "B:LIGHTING_TAXI_2_Set",
		desired_pos: () => 0,
		delay: () => this.store.delay,
		enabled: () => this.store.turnoff_lights_off,
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
