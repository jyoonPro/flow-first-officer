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

const getSpeed = () => {
  const rawValue = this.$api.variables.get("L:ngx_SPDwindow", "number");
  if (rawValue <= 0) {
    return 0;
  } else if (rawValue < 1) {
    // Mach
    return Math.round(rawValue * 100) / 100;
  } else {
    return Math.round(rawValue);
  }
}

const isMach = () => this.$api.variables.get("L:ngx_SPDwindow", "number") < 1;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setSpeed = async (targetSpeed, retry) => {
  const speed = getSpeed();
  // Multiply 100 first because of float precision
  const difference = isMach() ? speed * 100 - targetSpeed * 100 : speed - targetSpeed;

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
  if (getSpeed() !== targetSpeed && retry > 0) setSpeed(targetSpeed, retry - 1);
}

scroll(cfg => {
  if (cfg.scroll > 0) {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 38408);
  } else {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 38407);
  }
});

search(["speed", "spd", "ias", "mach"], (query, callback) => {
  if (!query) return;

  const spl = query.split(" ");

  if (spl.length > 0) {
    let targetSpeed, isSpeedIntv;

    if (isMach()) {
      if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetSpeed = getSpeed();
      else targetSpeed = Math.round(Number(spl[1]) * 100) / 100;
      targetSpeed = Math.max(Math.min(targetSpeed, 0.82), 0.60);
    } else {
      if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetSpeed = getSpeed();
      else targetSpeed = Math.round(Number(spl[1]));
      targetSpeed = Math.max(Math.min(targetSpeed, 340), 100);
    }

    if (spl[1] === "intv" || spl[2] === "intv") isSpeedIntv = true;

    const result = {
      uid: "mcp_speed_result",
      label: "",
      subtext: (isMach() ? "Set MACH to " : "Set IAS to ") + targetSpeed + (isSpeedIntv ? " SPD INTV" : ""),
      is_note: true,
      execute: () => {
        (async () => {
          if (isSpeedIntv) {
            this.$api.variables.set("K:ROTOR_BRAKE", "number", 38701);
            await timeout(100);
          }
          await setSpeed(targetSpeed, 3);
          this.$api.variables.set("L:P42_FLOW_SET_OTTO", "number", 0);
        })();
      },
    };

    callback([result]);
  }
});

state(() => {
  return isMach() ? "MACH<br/>" + (getSpeed() > 0 ? getSpeed().toFixed(2) : "-.--") : "IAS<br/>" + getSpeed();
});
