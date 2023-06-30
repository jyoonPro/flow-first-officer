const getAltitude = () => this.$api.variables.get("L:MSATR_FGCP_SELALT", "number");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setAltitude = async (targetAltitude, retry) => {
  const altitude = getAltitude();
  const difference = targetAltitude - altitude;

  this.$api.variables.set("B:AUTOPILOT_AUTOPILOT_Knob_Altitude_Set", "number", difference);
  this.$api.variables.set("L:MSATR_FGCP_ALTSEL_DELTA", "number", difference / 100);

  // In case of frame/instruction drops
  await timeout(200);
  if (getAltitude() !== targetAltitude && retry > 0) setAltitude(targetAltitude, retry - 1);
};

scroll(cfg => {
  if (cfg.scroll > 0) {
    this.$api.variables.set("B:AUTOPILOT_AUTOPILOT_Knob_Altitude_Set", "number", -1);
    this.$api.variables.set("L:MSATR_FGCP_ALTSEL_DELTA", "number", -1);
  } else {
    this.$api.variables.set("B:AUTOPILOT_AUTOPILOT_Knob_Altitude_Set", "number", 1);
    this.$api.variables.set("L:MSATR_FGCP_ALTSEL_DELTA", "number", 1);
  }
});

search(["altitude", "alt", "fl"], (query, callback) => {
  if (!query) return;

  const spl = query.split(" ");

  if (spl.length > 0) {
    let targetAltitude;
    if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetAltitude = getAltitude();
    else targetAltitude = Number(spl[1]);
    if (spl[0] === "fl") targetAltitude *= 100;
    targetAltitude = Math.round(targetAltitude / 100) * 100
    targetAltitude = Math.max(Math.min(targetAltitude, 30000), 0);

    const result = {
      uid: "mcp_altitude_result",
      label: "",
      subtext: "Set altitude to " + targetAltitude,
      is_note: true,
      execute: () => {
        (async () => {
          await setAltitude(targetAltitude, 3);
        })();
        this.$api.variables.set("L:P42_FLOW_SET_OTTO", "number", 0);
      },
    };

    callback([result]);
  }
});

state(() => {
  return "ALT<br/>" + getAltitude();
});
