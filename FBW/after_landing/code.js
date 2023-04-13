"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    {
        var: "L:A32NX_SPOILERS_HANDLE_POSITION",
        action: "K:SPOILERS_SET",
        desired_pos: () => 0,
        delay: 100,
        enabled: () => this.store.enable_spoilers,
    },
    {
        var: "L:A32NX_FLAPS_HANDLE_INDEX",
        action: null,
        desired_pos: () => 0,
        delay: 100,
        enabled: () => this.store.enable_flaps,
    },
    {
        var: "A:CIRCUIT SWITCH ON:18",
        action: null,
        desired_pos: () => 0,
        delay: 0,
        enabled: () => true,
    },
    {
        var: "L:LIGHTING_LANDING_2",
        action: null,
        desired_pos: () => 2,
        delay: 0,
        enabled: () => true,
    },
    {
        var: "A:CIRCUIT SWITCH ON:19",
        action: null,
        desired_pos: () => 0,
        delay: 0,
        enabled: () => true,
    },
    {
        var: "L:LIGHTING_LANDING_3",
        action: null,
        desired_pos: () => 2,
        delay: 0,
        enabled: () => true,
    },
    {
        var: "L:LIGHTING_LANDING_1",
        action: null,
        desired_pos: () => 1,
        delay: 0,
        enabled: () => true,
    },
    {
        var: "A:CIRCUIT SWITCH ON:21",
        action: null,
        desired_pos: () => 0,
        delay: 0,
        enabled: () => true,
    },
    {
        var: "A:CIRCUIT SWITCH ON:22",
        action: null,
        desired_pos: () => 0,
        delay: 0,
        enabled: () => true,
    },
    {
        var: "L:A32NX_OVHD_APU_MASTER_SW_PB_IS_ON",
        action: null,
        desired_pos: () => 1,
        delay: 3000,
        enabled: () => true,
    },
    {
        var: "L:A32NX_OVHD_APU_START_PB_IS_ON",
        action: null,
        desired_pos: () => 1,
        delay: 0,
        enabled: () => true,
    },
    {
        var: "L:XMLVAR_A320_WEATHERRADAR_SYS",
        action: null,
        desired_pos: () => 1,
        delay: 0,
        enabled: () => true,
    },
    {
        var: "L:A32NX_SWITCH_RADAR_PWS_POSITION",
        action: null,
        desired_pos: () => 0,
        delay: 0,
        enabled: () => true,
    },
    {
        var: "L:A32NX_SWITCH_TCAS_Position",
        action: null,
        desired_pos: () => 0,
        delay: 0,
        enabled: () => true,
    },
];
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
run(event => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        for (const command of commandList) {
            if (!command.enabled())
                continue;
            const state = this.$api.variables.get(command.var, "number");
            if (state !== command.desired_pos()) {
                this.$api.variables.set(command.action || command.var, "number", command.desired_pos());
                let delay = command.delay;
                if (Number(this.store.delay) > 0) {
                    delay += Number(this.store.delay) || 450;
                }
                if (delay > 0) {
                    yield timeout(delay);
                }
            }
        }
    }))();
    return false;
});
