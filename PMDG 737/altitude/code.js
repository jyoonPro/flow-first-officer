// Account for PMDG knob acceleration
function getStepCount(target) {
  let normalStep, extraStep;

  if (target < 3) {
    normalStep = 1;
    extraStep = target - 1;
  } else if (target < 6) {
    normalStep = 2;
    extraStep = target - 3;
  } else if (target < 10) {
    normalStep = 3;
    extraStep = target - 6;
  } else {
    normalStep = 4 + Math.floor((target - 10) / 5);
    extraStep = target % 5;
  }

  return {normalStep, extraStep};
}

const getAltitude = () => this.$api.variables.get("L:ngx_ALTwindow", "number");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setAltitude = async (targetAltitude, retry) => {
  const altitude = getAltitude();
  const difference = altitude - targetAltitude;

  if (difference < 0) {
    const {normalStep, extraStep} = getStepCount(-difference / 100);

    for (let i = 0; i < normalStep; i++) {
      await timeout(50);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 40007);
    }

    for (let i = 0; i < extraStep; i++) {
      await timeout(200);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 40007);
    }
  } else if (difference > 0) {
    const {normalStep, extraStep} = getStepCount(difference / 100);

    for (let i = 0; i < normalStep; i++) {
      await timeout(50);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 40008);
    }

    for (let i = 0; i < extraStep; i++) {
      await timeout(200);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 40008);
    }
  }

  // In case of frame/instruction drops
  await timeout(200);
  if (getAltitude() !== targetAltitude && retry > 0) setAltitude(targetAltitude, retry - 1);
}

scroll(cfg => {
  if (cfg.scroll > 0) {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 40008);
  } else {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 40007);
  }
});

search(["altitude", "alt", "fl"], (query, callback) => {
  if (!query) return;

  const spl = query.split(" ");

  if (spl.length > 0) {
    let targetAltitude, isAltIntv;
    if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetAltitude = getAltitude();
    else targetAltitude = Number(spl[1]);
    if (spl[0] === "fl") targetAltitude *= 100;
    targetAltitude = Math.round(targetAltitude / 100) * 100
    targetAltitude = Math.max(Math.min(targetAltitude, 50000), 0);

    if (spl[1] === "intv" || spl[2] === "intv") isAltIntv = true;

    const result = {
      uid: "mcp_altitude_result",
      label: "",
      subtext: "Set altitude to " + targetAltitude + (isAltIntv ? " ALT INTV" : ""),
      is_note: true,
      execute: () => {
        (async () => {
          await setAltitude(targetAltitude, 3);
          if (isAltIntv) {
            await timeout(100);
            this.$api.variables.set("K:ROTOR_BRAKE", "number", 88501);
          }
          this.$api.variables.set("L:P42_FLOW_SET_OTTO", "number", 0);
        })();
      },
    };

    callback([result]);
  }
});

state(() => {
  return "ALT<br/>" + getAltitude();
});
