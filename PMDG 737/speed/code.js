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

const getSpeed = () => Math.round(this.$api.variables.get("L:ngx_SPDwindow", "number"));

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setSpeed = async (targetSpeed) => {
  const speed = getSpeed();
  const difference = speed - targetSpeed;

  if (difference < 0) {
    const {normalStep, extraStep} = getStepCount(-difference);

    for (let i = 0; i < normalStep; i++) {
      await timeout(50);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 38407);
    }

    for (let i = 0; i < extraStep; i++) {
      await timeout(200);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 38407);
    }
  } else if (difference > 0) {
    const {normalStep, extraStep} = getStepCount(difference);

    for (let i = 0; i < normalStep; i++) {
      await timeout(50);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 38408);
    }

    for (let i = 0; i < extraStep; i++) {
      await timeout(200);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 38408);
    }
  }

  // In case of frame/instruction drops
  await timeout(200);
  if (getSpeed() !== targetSpeed) setSpeed(targetSpeed);
}

scroll(cfg => {
  if (cfg.scroll > 0) {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 38408);
  } else {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 38407);
  }
});

search(["speed", "spd", "ias"], (query, callback) => {
  if (!query) return;

  const spl = query.split(" ");

  if (spl.length > 0) {
    let targetSpeed;
    if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetSpeed = getSpeed();
    else targetSpeed = Number(spl[1]);
    targetSpeed = Math.max(Math.min(targetSpeed, 340), 100);

    const result = {
      uid: "mcp_speed_result",
      label: "",
      subtext: "Set IAS to " + targetSpeed,
      is_note: true,
      execute: () => {
        (async () => {
          await setSpeed(targetSpeed);
          this.$api.variables.set("L:P42_FLOW_SET_OTTO", "number", 0);
        })();
      },
    };

    callback([result]);
  }
});

state(() => {
  return "IAS<br/>" + getSpeed();
});
