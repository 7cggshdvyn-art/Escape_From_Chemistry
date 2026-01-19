const shotgun = [
  {
    id: "MP-155",
    name: "MP-155",

    base: {
      gameId: 250,
      price: 1703,
      weight: 3.8,
      quality: 2,
      tags: ["武器", "枪械", "霰弹枪", "可修理"],

      description: "泵动式霰弹枪，虽然需要手动装填，但载弹量在霰弹枪中相当不错。"
    },

    stats: {
      caliber: "S", 
      durability: 100,
      damage: 55,
      fireRate: 5.2,
      magSize: 8,
      reloadTime: 0.4, 
      bulletSpeed: 100,
      range: 16.8,

      critMultiplier: 1.1, 
      soundRange: 24.8,
      aimTime: 0.65,

      moveSpeedCoef: 1,
      aimSpeedCoef: 0.6,
      explosiveDamageCoef: 1,

      hipSpread: 66,
      aimSpread: 56.3,

      recoil: {
        vertical: 94.5,
        horizontal: 68 
      }
    }
  },
];

export default shotgun;
