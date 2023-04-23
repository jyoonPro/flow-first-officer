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

const getLeftMcpCourse = () => this.$api.variables.get("L:ngx_CRSwindowL", "number");
const getRightMcpCourse = () => this.$api.variables.get("L:ngx_CRSwindowR", "number");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setMcpCourse = async (targetCourse, isLeft) => {
  const mcpCourse = isLeft ? getLeftMcpCourse() : getRightMcpCourse();
  const angleDifference = getSignedAngleDifference(mcpCourse, targetCourse);

  if (angleDifference < 0) {
    const {normalStep, extraStep} = getStepCount(-angleDifference);

    for (let i = 0; i < normalStep; i++) {
      await timeout(50);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", isLeft ? 37607 : 40907);
    }

    for (let i = 0; i < extraStep; i++) {
      await timeout(200);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", isLeft ? 37607 : 40907);
    }
  } else if (angleDifference > 0) {
    const {normalStep, extraStep} = getStepCount(angleDifference);

    for (let i = 0; i < normalStep; i++) {
      await timeout(50);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", isLeft ? 37608 : 40908);
    }

    for (let i = 0; i < extraStep; i++) {
      await timeout(200);
      this.$api.variables.set("K:ROTOR_BRAKE", "number", isLeft ? 37608 : 40908);
    }
  }

  // In case of frame/instruction drops
  await timeout(200);
  if (isLeft && getLeftMcpCourse() !== targetCourse || !isLeft && getRightMcpCourse() !== targetCourse) setMcpCourse(targetCourse);
}

run(() => {
  (async () => {
    await setMcpCourse(getLeftMcpCourse(), false);
  })();
  return false;
});

scroll(cfg => {
  if (cfg.scroll > 0) {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 37608);
  } else {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 37607);
  }
});

search(["course", "crs"], (query, callback) => {
  if (!query) return;

  const spl = query.split(" ");

  if (spl.length > 0) {
    let targetCourse;
    if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetCourse = getLeftMcpCourse();
    else targetCourse = Number(spl[1]);
    targetCourse = Math.round(targetCourse % 360);

    const result = {
      uid: "mcp_course_result",
      label: "",
      subtext: "Set MCP course to " + targetCourse,
      is_note: true,
      execute: () => {
        (async () => {
          await setMcpCourse(targetCourse, true);
          await setMcpCourse(targetCourse, false);
          this.$api.variables.set("L:P42_FLOW_SET_OTTO", "number", 0);
        })();
      },
    };

    callback([result]);
  }
});

state(() => {
  return "CRS<br/>" + getLeftMcpCourse();
});
