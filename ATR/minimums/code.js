const isBaroSelected = (isCaptainSide) => this.$api.variables.get(isCaptainSide ? "L:MSATR_DH_TOGGLE_1" : "L:MSATR_DH_TOGGLE_2", "number") === 1;

const getLeftMinimums = () => this.$api.variables.get("L:MSATR_DH_VALUE_1", "number");
const getRightMinimums = () => this.$api.variables.get("L:MSATR_DH_VALUE_2", "number");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setMinimums = async (targetMinimums, isCaptainSide, isBaro, retry) => {
  if (isBaroSelected(isCaptainSide) !== isBaro) {
    this.$api.variables.set(`B:INSTRUMENT_Knob_DH_MDA_SET_${isCaptainSide ? 1 : 2}_${isBaro ? "On" : "Off"}`, "number", isBaro ? 1 : 0);
    await timeout(100);
  }

  const minimums = isCaptainSide ? getLeftMinimums() : getRightMinimums();
  const difference = targetMinimums - minimums;

  this.$api.variables.set(`B:INSTRUMENT_Knob_DH_MDA_VALUE_${isCaptainSide ? 1 : 2}_Set`, "number", difference);
  this.$api.variables.set(`L:MSATR_DH_SET_${isCaptainSide ? 1 : 2}_DELTA`, "number", difference);

  // In case of frame/instruction drops
  await timeout(200);
  if (isCaptainSide && getLeftMinimums() !== targetMinimums || !isCaptainSide && getRightMinimums() !== targetMinimums) setMinimums(targetMinimums, isCaptainSide, retry - 1);
};

run(() => {
  (async () => {
    await setMinimums(getLeftMinimums(), false, isBaroSelected(true), 3);
  })();
  return false;
});

scroll(cfg => {
  if (cfg.scroll > 0) {
    this.$api.variables.set("B:INSTRUMENT_Knob_DH_MDA_VALUE_1_Set", "number", -1);
    this.$api.variables.set("L:MSATR_DH_SET_1_DELTA", "number", -1);
  } else {
    this.$api.variables.set("B:INSTRUMENT_Knob_DH_MDA_VALUE_1_Set", "number", -1);
    this.$api.variables.set("L:MSATR_DH_SET_1_DELTA", "number", 1);
  }
});

search(["minimums", "mins", "min", "baro", "mda", "da", "radio", "mdh", "dh"], (query, callback) => {
  if (!query) return;

  const spl = query.split(" ");

  if (spl.length > 0) {
    let targetMinimums;
    let isBaro = true;
    if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetMinimums = 200;
    else targetMinimums = Number(spl[1]);
    targetMinimums = Math.max(Math.min(targetMinimums, 19990), 0);

    if (spl[0] === "radio" || spl[0] === "mdh" || spl[0] === "dh") isBaro = false;

    const result = {
      uid: "mins_result",
      label: "",
      subtext: "Set minimums to " + targetMinimums + (isBaro ? " BARO (MDA)" : " RADIO (DH)"),
      is_note: true,
      execute: () => {
        (async () => {
          await setMinimums(targetMinimums, true, isBaro, 3);
          await setMinimums(targetMinimums, false, isBaro, 3);
        })();
        this.$api.variables.set("L:P42_FLOW_SET_OTTO", "number", 0);
      },
    };

    callback([result]);
  }
});

state(() => {
  return `${isBaroSelected(true) ? "MDA" : "DH"}<br/>` + getLeftMinimums();
});
