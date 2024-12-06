export default {
    //Dice
    //diceUrl: "./assets/Dice.glb",
    //diceUrl: "./assets/DiceT6.glb",
    //diceUrl: "./assets/GemDiceU.glb",
    diceUrl: "./assets/DefDice.glb",
    selectionMeshUrl: "./assets/DiceCollider.glb",
    
    diceModels: [
        "./assets/DefDice.glb", 
        "./assets/BrassCore.glb", 
        "./assets/Precious.glb", 
        "./assets/AlienDice.glb", 
        "./assets/MarioParty.glb", 
        "./assets/Gem.glb", 
        "./assets/Earth.glb", 
        "./assets/Titanium.glb", 
        "./assets/Gyroid.glb"
    ],
 
    //diceUrl: "./assets/AlienDice.glb",
    //selectionMeshUrl: "./assets/AlienCollider.glb",
    
   // diceUrl: "./assets/MarioParty.glb",
   // selectionMeshUrl: "./assets/MarioPartyCollider.glb",
    selectionMeshScale: 1.1,
    diceScale: 1.0,
    environmentUrl: `./assets/env/RoyalEsplanade.jpg`,
    //floorTexture: './assets/paper.jpg',
    //floorRepeat: 14,
    floorRoughness: 1,
    floorMetalness: 0,

    //Camera stuff
    cameraPosition: [0, 45, 20],
    cameraLookAt: [0, 0, 0],
    //freeCamera:true,  //Let the camera move for debugging...
    fov: 15,

    // physics
    restitution: .75,
    //How bouncy the dice are 0 to 1
    friction: .01,
    // How much friction
    diceForce: 10,
    //Throwing force of dice...

    //Appearance:
    playFieldScale: 6,
    // Scale of walls relative to screen
    environmentRotation: [Math.PI, 0, 0],
    //Rotate the environment map/background
    debugWalls: false,

    debugClicks: false,

    //Bloom/glow
    bloomThreshold: .8,
    bloomStrength: .7,
    bloomRadius: 1.5,
    bloomExposure: 2.2,

    //Misc experiments
    diceRoughness: .1,
    // Dice roughness override
    diceMetalness: .2,
    // Dice metalness override
    //diceUrl:`./assets/shiba.glb`,
    //diceScale: .5,
    //diceUrl: `./assets/cube.glb`

}
