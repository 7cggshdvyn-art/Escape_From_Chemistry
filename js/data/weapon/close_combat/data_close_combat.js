const closeCombat = [
  {
    id: "Cleaver",
    name: "切肉刀",

    base: {
      gameId: 305,
      price: 175,
      weight: 0.65,
      quality: 1,
      tags: ["武器", "近战武器", "绑定装备"],

      description: "看起来很粗犷的刀，不是很锋利。"
    },

    stats: {
      damage: 24,
      critMultiplier: 1.5, // 150.0%
      attackRange: 1.55,
      attackSpeed: 1.8,
      staminaCost: 0,
      bleedChance: 0.4, // 40%

      critChance: 0.2, // 20.0%
      armorPen: 1
    }
  }
];

export default closeCombat;
