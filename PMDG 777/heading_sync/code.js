let isUserScrolling, scrollIdleTimeout;

// Account for PMDG knob acceleration
function getStepCount(target) {
  let normalStep, extraStep;

  if (target <= 4) {
    normalStep = target;
    extraStep = 0;
  } else if (target <= 14) {
    normalStep = 4 + Math.floor((target - 4) / 2);
    extraStep = target % 2;
  } else if (target <= 29) {
    normalStep = 9 + Math.floor((target - 14) / 3);
    extraStep = (target - 14) % 3;
  } else if (target <= 49) {
    normalStep = 14 + Math.floor((target - 29) / 4);
    extraStep = (target - 29) % 4;
  } else {
    normalStep = 19 + Math.floor((target - 49) / 5);
    extraStep = (target - 49) % 5;
  }

  return {normalStep, extraStep};
}

function getSignedAngleDifference(a, b) {
  const angle = ((a - b) % 360 + 540) % 360 - 180;
  return angle < -180 ? angle + 360 : angle;
}

const getMcpHeading = () => this.$api.variables.get("L:ngx_HDGWindow", "number");
const getTrueHeading = () => Math.round(this.$api.variables.get("A:PLANE HEADING DEGREES GYRO", "degrees"));

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setMcpHeading = async (targetHeading, retry) => {
  const mcpHeading = getMcpHeading();
  const angleDifference = getSignedAngleDifference(mcpHeading, targetHeading);

  if (angleDifference < 0) {
    const {normalStep, extraStep} = getStepCount(-angleDifference);

    for (let i = 0; i < normalStep; i++) {
      await timeout(50);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 218007);
    }

    for (let i = 0; i < extraStep; i++) {
      await timeout(700);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 218007);
    }
  } else if (angleDifference > 0) {
    const {normalStep, extraStep} = getStepCount(angleDifference);

    for (let i = 0; i < normalStep; i++) {
      await timeout(50);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 218008);
    }

    for (let i = 0; i < extraStep; i++) {
      await timeout(700);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", 218008);
    }
  }

  // In case of frame/instruction drops
  await timeout(200);
  if (getMcpHeading() !== targetHeading && retry > 0) setMcpHeading(targetHeading, retry - 1);
}

run(() => {
  setMcpHeading(getTrueHeading(), 3)
  return false;
});

scroll(cfg => {
  clearTimeout(scrollIdleTimeout);
  isUserScrolling = true;

  if (cfg.scroll > 0) {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 218008);
  } else {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 218007);
  }

  scrollIdleTimeout = setTimeout(() => {
    isUserScrolling = false;
  }, 1500);
});

search(["heading", "hdg"], (query, callback) => {
  if (!query) return;

  const spl = query.split(" ");

  if (spl.length > 0) {
    let targetHeading;
    if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetHeading = getTrueHeading();
    else targetHeading = Number(spl[1]);
    targetHeading = Math.round(targetHeading % 360);

    const result = {
      uid: "heading_sync_result",
      label: "",
      subtext: "Set MCP heading to " + targetHeading,
      is_note: true,
      execute: () => {
        (async () => {
          await setMcpHeading(targetHeading, 3);
        })();
        this.$api.variables.set("L:P42_FLOW_SET_OTTO", "number", 0);
      },
    };

    callback([result]);
  }
});

state(() => {
  return isUserScrolling ? "SEL<br/>" + getMcpHeading() : "HDG<br/>" + getTrueHeading();
});
