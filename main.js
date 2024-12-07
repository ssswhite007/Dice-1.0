import config from "./config.js";

import { Renderer } from "./renderer.js";

let currentRound = 0;
let throwResult = [1, 2, 3, 4, 5];
//import {ThreeFace} from "./comnub/three-face.js"
import { broadcastData } from "./comnub/index.js";
import { SimpleDice } from "./simple-dice.js";

let {
  THREE,
  scene,
  camera,
  renderer,
  controls,
  ambientLight,
  directionalLight,
  events,
  gui,
  glbLoader,
  raycasting,
  postProcessing,
} = new Renderer(config);

if (postProcessing) {
  if (config.bloomThreshold)
    postProcessing.params.bloomThreshold = config.bloomThreshold;
  if (config.bloomStrength)
    postProcessing.params.bloomStrength = config.bloomStrength;
  if (config.bloomRadius)
    postProcessing.params.bloomRadius = config.bloomRadius;
  if (config.bloomExposure)
    postProcessing.params.bloomExposure = config.bloomExposure;
}

let simpleDice = await SimpleDice({
  THREE,
  renderer,
  scene,
  camera,
  glbLoader,
  raycasting,
  events,
  config,
  directionalLight,
  ambientLight,
});

gui.hide();

let triggers = {
  diceThrown: false,
  rollFinished: false,
  allHeld: false,
};

let disposeTime = 0;
let popMsgs = [];
setInterval(() => {
  if (performance.now() < disposeTime + (popMsgs.length ? 100 : 2000))
    return;

  if (popup.style.display != "none") {
    popup.blur();
    popup.style.display = "none";
  }
  if (popMsgs.length) {
    popup.innerText = popMsgs.shift();
    console.log(popup.innerText);
    popup.style.display = "";
    disposeTime = performance.now();
  }
}, 100);

let popMsg = (str) => {
  popMsgs.push(str);
};

document.addEventListener("popmsg", (e) => {
  popMsg(e.detail);
});
//new CustomEvent('popmsg',{detail:'got pointerdown'}))

document.body.addEventListener("local-data", (e) => {
  let { data } = e.detail;
});

document.body.addEventListener("remote-data", (e) => {
  let { data } = e.detail;

  popMsg("remote player data:" + JSON.stringify(data));
  if (data.type == "throw") {
    triggers.isLocalThrower = false;
    if (simpleDice.allDiceHeld()) {
      //Dice tray is full so...
      //Empty the tray..  and start a new round...
      simpleDice.diceTray.makeEmpty();
      currentRound = 0;
    }
    config.desiredResult = data.values;
    simpleDice.cannonDice.throwMe(
      data.throwData.throwDirection,
      data.throwData.throwStrength
    );
  } else if (data.type == "hold") {
    simpleDice.toggleDiceHold(simpleDice.cannonDice.diceArray[data.id]);
  }
  config.refuelRenderer();
});

config.ondicethrown = (throwData) => {
  //popMsg("ondicethrown.")
  triggers.diceThrown = true;
  triggers.isLocalThrower = true;
  if (simpleDice.allDiceHeld()) currentRound = 0;
};

let isLocalThrower = false;
config.onrollsimulated = () => {
  //popMsg("onrollfinished.")
  triggers.rollSimulated = true;
  if (triggers.isLocalThrower) {
    let values = simpleDice.cannonDice.diceArray.map((d) => d.value);
    // config.desiredResult = values;
    config.desiredResult = throwResult;
    console.log("sending values:", simpleDice.cannonDice.diceArray);
    let { throwDirection, throwStrength } = simpleDice.cannonDice;
    broadcastData({
      type: "throw",
      values,
      throwData: { throwDirection, throwStrength },
    }); //,simpleDice.hands[0]})
  }
};

config.ontogglehold = (die, id) => {
  if (triggers.isLocalThrower) {
    broadcastData({ type: "hold", id }); //,simpleDice.hands[0]})
  }
};

config.onrollfinished = () => {
  //popMsg("onrollfinished.")
  triggers.rollFinished = true;
  currentRound = 0;
};

config.onallheld = () => {
  popMsg("onallheld.");
  triggers.allHeld = true;
};

function* GameLoopFn() {
  let handString = (hands) =>
    !hands.length
      ? ""
      : "Roll:" +
        currentRound +
        "\nHand:" +
        hands[0].name +
        "\n" +
        hands[0].unicodeDisplay +
        "\nScore:" +
        hands[0].score;
  config.onhandschanged = (hands) => {
    popMsg(handString(hands));
  };
  popMsg("Click and drag to Roll!");
  while (true) {
    yield;
    triggers.rollFinished = false;
    while (!triggers.rollFinished) yield;
    currentRound++;
    if (currentRound == 3 || simpleDice.allDiceHeld()) {
      simpleDice.cannonDice.allowRoll = false;
      /*
                  triggers.allHeld = false;
                  simpleDice.holdAll();
                  while(!triggers.allHeld) yield;
                  */
      simpleDice.cannonDice.diceArray.forEach((d, i) => {
        if (!d.held) config.ontogglehold && config.ontogglehold(d, i); //cannonDice.diceArray.indexOf(die));
      });
      simpleDice.cannonDice.diceArray.forEach(
        (d) => !d.held && simpleDice.toggleDiceHold(d)
      );
      //simpleDice.holdAll();
      currentRound = 0;
      simpleDice.cannonDice.allowRoll = true;
      popMsg("Round over!\n" + handString(simpleDice.diceTray.hands));
    } else popMsg("Roll: " + currentRound);
    try {
      //let json = await (await fetch('./nextStep')).json()
    } catch (e) {
      console.log(e);
    }
  }
}

let gameLoop = GameLoopFn();
setInterval(() => {
  let result = gameLoop.next();
}, 1000);


var initialRender = (function () {
    var init = async function (dice1, dice2, dice3, dice4, dice5) {
        simpleDice.ChangeDesign(config.diceModels, 0, dice1);
        simpleDice.ChangeDesign(config.diceModels, 1, dice2);
        simpleDice.ChangeDesign(config.diceModels, 2, dice3);
        simpleDice.ChangeDesign(config.diceModels, 3, dice4);
        simpleDice.ChangeDesign(config.diceModels, 4, dice5);
        config.refuelRenderer();
  };

  return {
    init: init,
  };
})();

var SettingMode = (function () {
  var bindEvents = function () {
    $("#settingsButton").click(function () {
      $("#settingsMenu").toggle();
    });

    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", function () {
        let model = getSelectedDiceModel();
        initialRender.init(
          model.dice1,
          model.dice2,
          model.dice3,
          model.dice4,
          model.dice5
        );
      });
    });

    document.querySelectorAll('#throw-result input[type="number"]').forEach((input) => {
      input.addEventListener('change', function () {
        throwResult = Array.from(document.querySelectorAll('#throw-result input[type="number"]')).map(input => parseInt(input.value, 10));
      });
    });

    document.querySelectorAll('input[name="hi-dice"]').forEach((input) => {
      input.addEventListener('change', function () {
        config.debugClicks = input.checked;
      });
    });

    document.querySelectorAll('#dice-to-house input[type="checkbox"]').forEach((input) => {
      input.addEventListener('change', function () {
        simpleDice.toggleDiceHold(simpleDice.cannonDice.diceArray[input.value]);
      });
    });
  };

  var getSelectedDiceModel = function () {
    const selectedValues = {};

    for (let i = 1; i <= 5; i++) {
      const selectedDice = document.querySelector(
        `input[name="dice${i}"]:checked`
      );
      if (selectedDice) {
        if (selectedDice.value == "DefDice") selectedValues[`dice${i}`] = 0;
        if (selectedDice.value == "BrassCore") selectedValues[`dice${i}`] = 1;
        if (selectedDice.value == "Precious") selectedValues[`dice${i}`] = 2;
      } else {
        selectedValues[`dice${i}`] = 1; // No selection for this dice
      }
    }
    return selectedValues;
  };

  var init = function () {
    bindEvents();
  };

  return {
    init: init,
  };
})();

$(document).ready(function () {
  SettingMode.init();
});
