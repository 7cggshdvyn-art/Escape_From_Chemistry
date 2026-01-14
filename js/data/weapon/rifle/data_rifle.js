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
];

export default rifle;
