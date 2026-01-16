const rifle = [
  {
    id: "AK-47",
    name: "AK-47",

    base: {
      gameId: 240,
      price: 3550,
      weight: 4.3,        
      quality: 3,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "经典的制式步枪，威力较大，结构简单，维护方便，但后坐力较大，精度一般。"
    },

    stats: {
      caliber: "AR",          
      durability: 120,        
      damage: 16,            
      fireRate: 10,  
      magSize: 30,        
      reloadTime: 3,          
      bulletSpeed: 118,       
      range: 23,              

      critMultiplier: 1.45,  
      soundRange: 27.2,       
      aimTime: 0.65,          

      moveSpeedCoef: 0.85,    
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 37.5,       
      aimSpread: 10.79,       

      recoil: {
        vertical: 49.5,      
        horizontal: 54        
      }
    }
  },
  {
    id: "AK-103",
    name: "AK-103",

    base: {
      gameId: 238,
      price: 6049,
      weight: 3.4,        
      quality: 4,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "AK-47的现代化版本，继承了其可靠性的同时，在各方面也有进一步的提升。"
    },

    stats: {
      caliber: "AR",          
      durability: 120,        
      damage: 17,            
      fireRate: 10.87,   
      magSize: 30,       
      reloadTime: 2.9,          
      bulletSpeed: 118,       
      range: 24.7,              

      critMultiplier: 1.45,  
      soundRange: 28.9,       
      aimTime: 0.6,          

      moveSpeedCoef: 0.85,    
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 34.6,       
      aimSpread: 10.36,       

      recoil: {
        vertical: 45.95,      
        horizontal: 47.8        
      }
    }
  },
  {
    id: "ADAR 2-15",
    name: "ADAR 2-15",

    base: {
      gameId: 652,
      price: 1633,
      weight: 2.879,        
      quality: 2,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "制式武器的民用版本，虽然威力较低，但有着优秀的稳定性和更好的配件支持。"
    },

    stats: {
      caliber: "AR",          
      durability: 100,        
      damage: 12,            
      fireRate: 13.5,   
      magSize: 30,       
      reloadTime: 2.7,          
      bulletSpeed: 105,       
      range: 25.6,              

      critMultiplier: 1.25,  
      soundRange: 29.9,       
      aimTime: 0.5,          

      moveSpeedCoef: 0.85,   
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 39,       
      aimSpread: 9.72,       

      recoil: {
        vertical: 40.5,      
        horizontal: 45        
      }
    }
  },
  {
    id: "AS Val",
    name: "AS Val",

    base: {
      gameId: 681,
      price: 10648,
      weight: 2.5,        
      quality: 5,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "自带消音器的特种步枪，射速快，精度高但载弹量有限。"
    },

    stats: {
      caliber: "AR",          
      durability: 100,        
      damage: 12,            
      fireRate: 18,   
      magSize: 20,       
      reloadTime: 3,          
      bulletSpeed: 85,       
      range: 21.8,              

      critMultiplier: 1.2,  
      soundRange: 7.8,       
      aimTime: 0.5,          

      moveSpeedCoef: 0.85,   
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 33,       
      aimSpread: 10.64,       

      recoil: {
        vertical: 30.15,      
        horizontal: 27        
      }
    }
  },
  {
    id: "DT MDR-556",
    name: "DT MDR-556",

    base: {
      gameId: 682,
      price: 7354,
      weight: 4.4,        
      quality: 4,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "还在测试阶段的制式步枪，模块化程度非常高，但不知什么原因，本来可以卸下的枪管和黄色的外壳绑定在了一起。"
    },

    stats: {
      caliber: "AR",          
      durability: 100,        
      damage: 15,            
      fireRate: 13,   
      magSize: 30,       
      reloadTime: 2,          
      bulletSpeed: 110,       
      range: 25.6,              

      critMultiplier: 1.3,  
      soundRange: 29.9,       
      aimTime: 0.45,          

      moveSpeedCoef: 0.85,    
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 25.5,       
      aimSpread: 8.14,       

      recoil: {
        vertical: 21,      
        horizontal: 19.8        
      }
    }
  },
  {
    id: "MF",
    name: "MF",

    base: {
      gameId: 242,
      price: 3956,
      weight: 2.85,        
      quality: 3,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "装备非常广泛的制式武器，精度高，后坐力小的同时能支持大部分配件的安装。"
    },

    stats: {
      caliber: "AR",          
      durability: 100,        
      damage: 13,            
      fireRate: 13.5,   
      magSize: 30,       
      reloadTime: 2.7,          
      bulletSpeed: 102,       
      range: 24.7,              

      critMultiplier: 1.3,  
      soundRange: 28.9,       
      aimTime: 0.45,          

      moveSpeedCoef: 0.85,   
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 30,       
      aimSpread: 7.8,       

      recoil: {
        vertical: 36,      
        horizontal: 36        
      }
    }
  },
  {
    id: "MF-Poison",
    name: "MF-毒液",

    base: {
      gameId: 1238,
      price: 3956,
      weight: 3.85,        
      quality: 4,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "让射出的子弹裹上浓缩浆质，会让命中的目标中毒。"
    },

    stats: {
      caliber: "AR",          
      durability: 100,        
      damage: 13,            
      fireRate: 14.5,   
      magSize: 30,       
      reloadTime: 2.7,          
      bulletSpeed: 102,       
      range: 24.7,              

      critMultiplier: 1.3,  
      soundRange: 28.9,       
      aimTime: 0.45,          

      moveSpeedCoef: 0.85,  
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 30,       
      aimSpread: 7.8,       

      recoil: {
        vertical: 36,      
        horizontal: 36       
      },

      debuff: {
        type: "poison",
        rate: 0.25
      }
    }
  },
  {
    id: "MK-47",
    name: "MK-47",

    base: {
      gameId: 1286,
      price: 10049,
      weight: 3.22,        
      quality: 5,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "结合了AK-47与MF优点的现代枪械，保证了威力的同时，枪械的精度也得到了保证。"
    },

    stats: {
      caliber: "AR",          
      durability: 120,        
      damage: 17,            
      fireRate: 12,   
      magSize: 30,       
      reloadTime: 2.6,          
      bulletSpeed: 126,       
      range: 25.4,              

      critMultiplier: 1.4,  
      soundRange: 29.2,       
      aimTime: 0.52,          

      moveSpeedCoef: 0.85,
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 30.6,       
      aimSpread: 9.16,       

      recoil: {
        vertical: 42.95,      
        horizontal: 46        
      }
    }
  },
  {
    id: "MMG",
    name: "MMG",

    base: {
      gameId: 256,
      price: 4242,
      weight: 3.1,        
      quality: 3,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "MF的前身，各方面都非常均衡的制式武器。"
    },

    stats: {
      caliber: "AR",          
      durability: 100,        
      damage: 12.5,            
      fireRate: 14,   
      magSize: 30,       
      reloadTime: 2.7,          
      bulletSpeed: 102,       
      range: 28.3,              

      critMultiplier: 1.2,  
      soundRange: 22.7,       
      aimTime: 0.45,          

      moveSpeedCoef: 0.85,
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 31.5,       
      aimSpread: 7.54,       

      recoil: {
        vertical: 31.5,      
        horizontal: 27        
      }
    }
  },
  {
    id: "MMG-Frozen",
    name: "MMG-冰封",

    base: {
      gameId: 1362,
      price: 5242,
      weight: 3.1,        
      quality: 4,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "使用了特殊技术改造的MMG，传闻这种技术曾被用于改变天气。"
    },

    stats: {
      caliber: "AR",          
      durability: 100,        
      damage: 12,            
      fireRate: 14.5,   
      magSize: 30,       
      reloadTime: 2.7,          
      bulletSpeed: 105,       
      range: 28.3,              

      critMultiplier: 1.5,  
      soundRange: 32.7,       
      aimTime: 0.45,          

      moveSpeedCoef: 0.85,
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 31.5,       
      aimSpread: 8.24,       

      recoil: {
        vertical: 34.5,      
        horizontal: 27   
      },
      
      debuff: {
        type: "frozen",
        rate: 0.5
      }
    }
  },
  {
    id: "RPD",
    name: "RPD",

    base: {
      gameId: 244,
      price: 12181,
      weight: 5.8,        
      quality: 5,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "RPK的前辈，使用弹鼓供弹，载弹量非常大，火力支援能力不逊于RPK。"
    },

    stats: {
      caliber: "AR",          
      durability: 150,        
      damage: 16,            
      fireRate: 12.5,   
      magSize: 135,       
      reloadTime: 5.8,          
      bulletSpeed: 97,       
      range: 27.6,              

      critMultiplier: 1.45,  
      soundRange: 33.4,       
      aimTime: 0.85,          

      moveSpeedCoef: 0.78,
      aimSpeedCoef: 0.4,
      explosiveDamageCoef: 1, 

      hipSpread: 34.2,       
      aimSpread: 10.1,       

      recoil: {
        vertical: 38.35,      
        horizontal: 39.4        
      }
    }
  },
  {
    id: "RPK",
    name: "RPK",

    base: {
      gameId: 1500,
      price: 12181,
      weight: 5.8,        
      quality: 5,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "RPK的前辈，使用弹鼓供弹，载弹量非常大，火力支援能力不逊于RPK。"
    },

    stats: {
      caliber: "AR",          
      durability: 100,        
      damage: 18,            
      fireRate: 11,   
      magSize: 75,       
      reloadTime: 5.7,          
      bulletSpeed: 90,       
      range: 28.3,              

      critMultiplier: 1.45,  
      soundRange: 32.7,       
      aimTime: 0.8,          

      moveSpeedCoef: 0.78,
      aimSpeedCoef: 0.4,
      explosiveDamageCoef: 1, 

      hipSpread: 39,       
      aimSpread: 10.35,       

      recoil: {
        vertical: 45.45,      
        horizontal: 54        
      }
    }
  },
  {
    id: "StG 77",
    name: "StG 77",

    base: {
      gameId: 653,
      price: 3658,
      weight: 3.6,        
      quality: 3,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "无托结构设计，短小紧凑后坐力较小，且自带光学瞄准镜。"
    },

    stats: {
      caliber: "AR",          
      durability: 100,        
      damage: 14,            
      fireRate: 12.5,   
      magSize: 30,       
      reloadTime: 4,          
      bulletSpeed: 107,       
      range: 26.5,              

      critMultiplier: 1.35,  
      soundRange: 30.8,       
      aimTime: 0.65,          

      moveSpeedCoef: 0.85,
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 32.2,       
      aimSpread: 9.27,       

      recoil: {
        vertical: 30.25,      
        horizontal: 35.2        
      }
    }
  },
  {
    id: "StG 77A3",
    name: "StG 77A3",

    base: {
      gameId: 654,
      price: 4539,
      weight: 3.7,        
      quality: 3,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "StG 77的改进型，去掉了光学瞄准镜并提高了配件的支持。"
    },

    stats: {
      caliber: "AR",          
      durability: 100,        
      damage: 14,            
      fireRate: 12.5,   
      magSize: 30,       
      reloadTime: 4,          
      bulletSpeed: 107,       
      range: 26.5,              

      critMultiplier: 1.35,  
      soundRange: 30.8,       
      aimTime: 0.5,          

      moveSpeedCoef: 0.85,
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 32.2,       
      aimSpread: 10.44,       

      recoil: {
        vertical: 24.5,      
        horizontal: 25.3        
      }
    }
  },
  {
    id: "VPO-136",
    name: "VPO-136",

    base: {
      gameId: 659,
      price: 630,
      weight: 3.6,        
      quality: 1,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "基于AK-47设计的半自动民用步枪，可靠性很高。"
    },

    stats: {
      caliber: "AR",          
      durability: 120,        
      damage: 14,            
      fireRate: 10,   
      magSize: 30,       
      reloadTime: 3,          
      bulletSpeed: 120,       
      range: 24.7,              

      critMultiplier: 1.40,  
      soundRange: 28.9,       
      aimTime: 0.6,          

      moveSpeedCoef: 0.85,
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 46.8,       
      aimSpread: 11.6,       

      recoil: {
        vertical: 51.75,      
        horizontal: 56.7        
      }
    }
  },
  {
    id: "PalaGun",
    name: "啪啦枪",

    base: {
      gameId: 916,
      price: 16364,
      weight: 4.6,        
      quality: 6,
      tags: ["枪械", "武器", "步枪", "可维修", "特殊"],

      description: "载弹量相当巨大，有极强的火力压制能力"
    },

    stats: {
      caliber: "En-L",          
      durability: 100,        
      damage: 16,            
      fireRate: 15,   
      magSize: 150,       
      reloadTime: 5,          
      bulletSpeed: 90,       
      range: 31.3,              

      critMultiplier: 1.45,  
      soundRange: 35.9,       
      aimTime: 0.9,          

      moveSpeedCoef: 0.81,
      aimSpeedCoef: 0.4,
      explosiveDamageCoef: 1, 

      hipSpread: 36.1,       
      aimSpread: 10.79,       

      recoil: {
        vertical: 38.6,      
        horizontal: 54     
      },

      debuff: {
        type: "burn",
        rate: 0.35,
        type: "DeArmor",
        rate: 100
      }
    }
  },
  {
    id: "Fire Ak-47",
    name: "带火AK-47",

    base: {
      gameId: 862,
      price: 3550,
      weight: 4.3,        
      quality: 5,
      tags: ["枪械", "武器", "步枪", "可维修"],

      description: "被风暴侵蚀的AK，觉醒了特殊的属性"
    },

    stats: {
      caliber: "AR",          
      durability: 120,        
      damage: 17,            
      fireRate: 10,   
      magSize: 30,       
      reloadTime: 3,          
      bulletSpeed: 100,       
      range: 24,              

      critMultiplier: 1.45,  
      soundRange: 28.2,       
      aimTime: 0.65,          

      moveSpeedCoef: 0.85,
      aimSpeedCoef: 0.45,
      explosiveDamageCoef: 1, 

      hipSpread: 37.5,       
      aimSpread: 10.79,       

      recoil: {
        vertical: 49.5,      
        horizontal: 54    
      },

      debuff: {
        type: "burn",
        rate: 0.25
      }
    }
  },
];

export default rifle;
