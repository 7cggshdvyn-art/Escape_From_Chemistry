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
      explosiveDamageCoef: 1, 

      hipSpread: 33,       
      aimSpread: 10.64,       

      recoil: {
        vertical: 30.15,      
        horizontal: 27        
      }
    }
  },
];

export default rifle;
