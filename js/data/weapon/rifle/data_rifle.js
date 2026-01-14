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
];

export default rifle;
