const getSpeed = () => {
  const rawValue = this.$api.variables.get("L:ngx_SPDwindow", "number");
  if (rawValue <= 0) {
    return 0;
  } else if (rawValue < 1) {
    // Mach
    return Math.round(rawValue * 1000) / 1000;
  } else {
    return Math.round(rawValue);
  }
}

const isMach = () => {
  const rawValue = this.$api.variables.get("L:ngx_SPDwindow", "number");

  // Altitude above FL260 OR speed window indicates mach value
  if (rawValue <= 0) return this.$api.variables.get("A:INDICATED ALTITUDE CALIBRATED", "feet") > 31000;
  else return rawValue > 0 && rawValue < 1;
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setSpeed = async (targetSpeed, retry) => {
  const speed = getSpeed();
  // Multiply 100 first because of float precision
  const difference = isMach() ? speed * 1000 - targetSpeed * 1000 : speed - targetSpeed;

  if (difference < 0) {
    for (let i = 0; i < -difference; i++) {
      await timeout(50);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 21007);
    }
  } else if (difference > 0) {
    for (let i = 0; i < difference; i++) {
      await timeout(50);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 21008);
    }
  }

  // In case of frame/instruction drops
  await timeout(200);
  if (getSpeed() !== targetSpeed && retry > 0) setSpeed(targetSpeed, retry - 1);
}

scroll(cfg => {
  if (cfg.scroll > 0) {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 21008);
  } else {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 21007);
  }
});

search(["speed", "spd", "ias", "mach"], (query, callback) => {
  if (!query) return;

  const spl = query.split(" ");

  if (spl.length > 0) {
    let targetSpeed, isSpeedIntv;
    let isTargetMach = isMach();

    if (spl[0] === "mach") isTargetMach = true;
    else if (spl[0] === "ias") isTargetMach = false;

    if (isTargetMach) {
      if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetSpeed = getSpeed();
      else targetSpeed = Math.round(Number(spl[1]) * 1000) / 1000;
      targetSpeed = Math.max(Math.min(targetSpeed, 0.950), 0.400);
    } else {
      if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetSpeed = getSpeed();
      else targetSpeed = Math.round(Number(spl[1]));
      targetSpeed = Math.max(Math.min(targetSpeed, 399), 100);
    }

    if (spl[1] === "intv" || spl[2] === "intv") isSpeedIntv = true;

    const result = {
      uid: "mcp_speed_result",
      label: "",
      subtext: !isSpeedIntv && getSpeed() === 0 ? `Activate speed window first or type "${spl[0]} ${spl[1]} intv" to intervene` : ((isTargetMach ? "Set MACH to " : "Set IAS to ") + targetSpeed + (isSpeedIntv ? " SPD INTV" : "")),
      is_note: true,
      execute: () => {
        if (!isSpeedIntv && getSpeed() === 0) return;

        (async () => {
          if (isSpeedIntv) {
            this.$api.variables.set("K:ROTOR_BRAKE", "number", 210001);
            await timeout(1500);

            // Switch IAS/Mach if units are different
            if (isTargetMach !== isMach()) {
              this.$api.variables.set("K:ROTOR_BRAKE", "number", 20801);
              await timeout(1500);
            }
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
  return isMach() ?
    "MACH<br/>" + (getSpeed() > 0 ? getSpeed().toFixed(3) : "-.---") :
    "IAS<br/>" + (getSpeed() || "---");
});
