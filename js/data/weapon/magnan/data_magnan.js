const magnan = [
  {
    id: "M107",
    name: "M107",

    base: {
      gameId: 407,
      price: 23102,
      weight: 14,        
      quality: 6,
      tags: ["枪械", "武器", "马格南", "可维修"],

      description: "很猛，甚至不像是用来与有机生物作战的武器，重量也相当夸张。"
    },

    stats: {
      caliber: "MAG",          
      durability: 100,        
      damage: 50,            
      fireRate: 1.5,  
      magSize: 10,        
      reloadTime: 3.5,          
      bulletSpeed: 220,       
      range: 42.6,              

      critMultiplier: 1.7,  
      soundRange: 45.6,       
      aimTime: 1,          

      moveSpeedCoef: 0.65,    
      aimSpeedCoef: 0.4,
      explosiveDamageCoef: 1, 

      hipSpread: 40,       
      aimSpread: 6,       

      recoil: {
        vertical: 144.5,      
        horizontal: 190        
      }
    }
  },
];

export default magnan;
