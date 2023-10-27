const isMach = () => {
  return this.$api.variables.get("L:XMLVAR_AirSpeedIsInMach", "number");

  // return this.$api.variables.get("A:AUTOPILOT MANAGED SPEED IN MACH", "bool");
}

const getSpeed = () => {
  if (isMach()) {
    // Mach
    return Math.round(this.$api.variables.get("A:AUTOPILOT MACH HOLD VAR", "number") * 100) / 100;
  } else {
    return Math.round(this.$api.variables.get("A:AUTOPILOT AIRSPEED HOLD VAR", "knots"));
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setSpeed = async (targetSpeed, retry) => {
  const speed = getSpeed();
  // Multiply 100 first because of float precision
  const difference = isMach() ? speed * 100 - targetSpeed * 100 : speed - targetSpeed;

  if (difference < 0) {
    for (let i = 0; i < -difference; i++) {
      await timeout(50);
      this.$api.variables.set("B:AUTOPILOT_Speed_Inc", "number", 1);
    }
  } else if (difference > 0) {
    for (let i = 0; i < difference; i++) {
      await timeout(50);
      this.$api.variables.set("B:AUTOPILOT_Speed_Dec", "number", 1);
    }
  }

  // In case of frame/instruction drops
  await timeout(200);
  if (getSpeed() !== targetSpeed && retry > 0) setSpeed(targetSpeed, retry - 1);
}

scroll(cfg => {
  if (cfg.scroll > 0) {
    this.$api.variables.set("B:AUTOPILOT_Speed_Dec", "number", 1);
  } else {
    this.$api.variables.set("B:AUTOPILOT_Speed_Inc", "number", 1);
  }
});

search(["speed", "spd", "ias", "mach"], (query, callback) => {
  if (!query) return;

  console.log(isMach());

  const spl = query.split(" ");

  if (spl.length > 0) {
    let targetSpeed, isSpeedIntv;

    if (isMach()) {
      if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetSpeed = getSpeed();
      else targetSpeed = Math.round(Number(spl[1]) * 100) / 100;
      targetSpeed = Math.max(Math.min(targetSpeed, 0.95), 0.40);
    } else {
      if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetSpeed = getSpeed();
      else targetSpeed = Math.round(Number(spl[1]));
      targetSpeed = Math.max(Math.min(targetSpeed, 399), 100);
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
            this.$api.variables.set("B:AUTOPILOT_SpeedMach_Mode_Push", "number", 1);
            await timeout(100);
          }
          await setSpeed(targetSpeed, 3);
        })();
        this.$api.variables.set("L:P42_FLOW_SET_OTTO", "number", 0);
      },
    };

    callback([result]);
  }
});

state(() => {
  return isMach() ? "MACH<br/>" + getSpeed().toFixed(3) : "IAS<br/>" + getSpeed();
});
