// 所有註釋都是給我自己看的
const character = [
  {
    id: "player",
    name: "打工鸭",
    description: "特点是没有特点，非常均衡。",

    stats: {
      hp: {
        current: 60,
        max: 60
      },
      stamina: {
        current: 109,
        max: 109
      },
      hunger: {
        current: 115,
        max: 115
      },
      water: {
        current: 105,
        max: 105
      }
    },

    movement: {
      walkSpeed: 4.0,     // M/S
      runSpeed: 7.8,
      
    },


    armor: {
      body: 0.2,
      head: 0.2
    },

    // 战斗相关倍率
    combat: {
      gunDamageMultiplier: 1.07,
      gunRangeMultiplier: 1.0,
      gunHeadshotDamage: 0.07,

      meleeDamageMultiplier: 1.10,
      meleeCritChance: 0.70,
      meleeCritDamage: 0.0
    },

    // 承伤倍率
    resistance: {
      physical: 1.0,
      fire: 1.0,
      poison: 1.0,
      electric: 1.0,
      space: 1.0
    },

    // 声音和感知
    perception: {
      walkSoundRange: 8.0,
      runSoundRange: 16.0,
      viewAngle: 115.0,
      viewDistance: 46.6,
      detectDistance: 2.5 
    }
  }
];

export default character;