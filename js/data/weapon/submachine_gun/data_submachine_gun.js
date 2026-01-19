const submachine_gun = [
  { 
    id: "AK-74U",
    name: "AK-74U",

    base: {
      gameId: 252,
      price: 1510,
      weight: 2.71,        
      quality: 2,
      tags: ["枪械", "武器", "冲锋枪", "可维修"],

      description: "基于AK-47进行了短管设计，因为威力下降，被鸭鸭们降格为了冲锋枪。"
    },

    stats: {
      caliber: "S",          
      durability: 100,        
      damage: 12,            
      fireRate: 12,  
      magSize: 30,        
      reloadTime: 2.7,          
      bulletSpeed: 83,       
      range: 21.5,              

      critMultiplier: 1.25,  
      soundRange: 25.6,       
      aimTime: 0.45,          

      moveSpeedCoef: 0.95,    
      aimSpeedCoef: 0.55,
      explosiveDamageCoef: 1, 

      hipSpread: 18,       
      aimSpread: 11.24,       

      recoil: {
        vertical: 31.5,      
        horizontal: 29.7        
      }
    }
  },
];

export default submachine_gun;
