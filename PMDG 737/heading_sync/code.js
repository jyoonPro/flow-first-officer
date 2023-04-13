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

function getSignedAngleDifference(a, b) {
  const angle = ((a - b) % 360 + 540) % 360 - 180;
  return angle < -180 ? angle + 360 : angle;
}

const getMcpHeading = () => this.$api.variables.get("L:ngx_HDGWindow", "number");
const getTrueHeading = () => Math.round(this.$api.variables.get("A:PLANE HEADING DEGREES GYRO", "degrees"));

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setMcpHeading = async targetHeading => {
  const mcpHeading = getMcpHeading();
  const angleDifference = getSignedAngleDifference(mcpHeading, targetHeading);

  if (angleDifference < 0) {
    const {normalStep, extraStep} = getStepCount(-angleDifference);

    for (let i = 0; i < normalStep; i++) {
      await timeout(10);
      this.$api.variables.set("K:HEADING_BUG_INC", "degrees", 0);
    }

    for (let i = 0; i < extraStep; i++) {
      await timeout(200);
      this.$api.variables.set("K:HEADING_BUG_INC", "degrees", 0);
    }
  } else if (angleDifference > 0) {
    const {normalStep, extraStep} = getStepCount(angleDifference);

    for (let i = 0; i < normalStep; i++) {
      await timeout(10);
      this.$api.variables.set("K:HEADING_BUG_DEC", "degrees", 0);
    }

    for (let i = 0; i < extraStep; i++) {
      await timeout(200);
      this.$api.variables.set("K:HEADING_BUG_DEC", "degrees", 0);
    }
  }
}

run(() => {
  setMcpHeading(getTrueHeading())
  return false;
});

state(() => {
  return 'HDG<br/>' + getTrueHeading();
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
        setMcpHeading(targetHeading);
        this.$api.variables.set("L:P42_FLOW_SET_OTTO", "number", 0);
      },
    };

    callback([result]);
  }
});
