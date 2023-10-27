let isUserScrolling, scrollIdleTimeout;

function getSignedAngleDifference(a, b) {
  const angle = ((a - b) % 360 + 540) % 360 - 180;
  return angle < -180 ? angle + 360 : angle;
}

const getMcpHeading = () => this.$api.variables.get("A:AUTOPILOT HEADING LOCK DIR:0", "degrees");
const getTrueHeading = () => Math.round(this.$api.variables.get("A:PLANE HEADING DEGREES GYRO", "degrees"));

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setMcpHeading = async (targetHeading, retry) => {
  const mcpHeading = getMcpHeading();
  const angleDifference = getSignedAngleDifference(mcpHeading, targetHeading);

  if (angleDifference < 0) {
    for (let i = 0; i < -angleDifference; i++) {
      await timeout(50);
      this.$api.variables.set("B:AUTOPILOT_Heading_Inc", "number", 1);
    }
  } else if (angleDifference > 0) {
    for (let i = 0; i < angleDifference; i++) {
      await timeout(50);
      this.$api.variables.set("B:AUTOPILOT_Heading_Dec", "number", 1);
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
    this.$api.variables.set("B:AUTOPILOT_Heading_Dec", "number", 1);
  } else {
    this.$api.variables.set("B:AUTOPILOT_Heading_Inc", "number", 1);
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
