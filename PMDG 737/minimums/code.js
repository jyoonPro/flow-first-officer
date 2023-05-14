this.store = {
  linked_instruments: true,
  reset_rotation_count: 5000,
};

this.$api.datastore.import(this.store);

settings_define({
  linked_instruments: {
    type: "checkbox",
    label: "Capt & F/O instruments linked",
    description: "This value should match the setting (SYNC CAPT AND F/O EFIS) in the PMDG CDU.",
    value: this.store.linked_instruments,
    changed: value => {
      this.store.linked_instruments = value;
      this.$api.datastore.export(this.store);
    },
  },
  reset_rotation_count: {
    type: "text",
    label: "Reset rotation count",
    description: "Number of left rotations to perform as a reset. Each rotation will decrement by 5. If you find this is not enough, increase this value.",
    value: this.store.reset_rotation_count,
    changed: value => {
      const rotation = Number(value);
      if (Number.isInteger(rotation) && rotation >= 0) {
        this.store.reset_rotation_count = rotation;
        this.$api.datastore.export(this.store);
      }
    },
  },
});

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

const isBaroSelected = (isCaptainSide) => this.$api.variables.get(isCaptainSide ? "L:switch_356_73X" : "L:switch_412_73X", "number") === 100;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setMinimums = async (targetMinimums, isCaptainSide, isBaro) => {
  if (isBaroSelected(isCaptainSide) !== isBaro) {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", isCaptainSide ? 35601 : 41201);
    await timeout(100);
  }

  // Reset to lowest point (Baro: -200, Radio: 0)
  for (let i = 0; i < this.store.reset_rotation_count + (isBaro ? 40 : 0); i++) {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", isCaptainSide ? 35501 : 41101);
  }

  await timeout(600);

  const difference = isBaro ? targetMinimums + 200 : targetMinimums;
  const {normalStep, extraStep} = getStepCount(difference);

  for (let i = 0; i < normalStep; i++) {
    await timeout(50);
    this.$api.variables.set("K:ROTOR_BRAKE", "number", isCaptainSide ? 35507 : 41107);
  }

  for (let i = 0; i < extraStep; i++) {
    await timeout(200);
    this.$api.variables.set("K:ROTOR_BRAKE", "number", isCaptainSide ? 35507 : 41107);
  }
};

scroll(cfg => {
  if (cfg.scroll > 0) {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 35508);
  } else {
    this.$api.variables.set("K:ROTOR_BRAKE", "number", 35507);
  }
});

search(["minimums", "mins", "min", "baro", "radio"], (query, callback) => {
  if (!query) return;

  const spl = query.split(" ");

  if (spl.length > 0) {
    let targetMinimums;
    let isBaro = true;
    if (!spl[1] || spl[1].length === 0 || !Number.isFinite(Number(spl[1]))) targetMinimums = 200;
    else targetMinimums = Number(spl[1]);
    targetMinimums = Math.max(Math.min(targetMinimums, this.store.reset_rotation_count * 5), 0);

    if (spl[0] === "radio") isBaro = false;

    const result = {
      uid: "mins_result",
      label: "",
      subtext: "Set minimums to " + targetMinimums + (isBaro ? " BARO" : " RADIO"),
      is_note: true,
      execute: () => {
        (async () => {
          await setMinimums(targetMinimums, true, isBaro);
          if (!this.store.linked_instruments) await setMinimums(targetMinimums, false, isBaro);
        })();
        this.$api.variables.set("L:P42_FLOW_SET_OTTO", "number", 0);
      },
    };

    callback([result]);
  }
});

state(() => {
  return "MINS<br/>+/-";
});
