// item.logic.test.ts (Primeri unit testova)

describe("Item Service Logic", () => {
  
  // TEST 1: Naming Suffix Logic
  it("should correctly append 'of Strength' when Strength is the highest bonus", () => {
    const item = { name: "Sunslayer", bonusStrength: 10, bonusAgility: 5 };
    const stats = [
      { name: "Strength", value: item.bonusStrength },
      { name: "Agility", value: item.bonusAgility }
    ];
    
    const highest = stats.reduce((prev, current) => (prev.value > current.value ? prev : current));
    const displayName = `${item.name} of ${highest.name}`;
    
    expect(displayName).toBe("Sunslayer of Strength");
  });

  // TEST 2: Stats Calculation Logic
  it("should correctly sum base stats and item bonuses", () => {
    const baseStrength = 18;
    const items = [
      { bonusStrength: 10 },
      { bonusStrength: 5 }
    ];
    
    const totalStrength = baseStrength + items.reduce((sum, i) => sum + i.bonusStrength, 0);
    
    expect(totalStrength).toBe(33);
  });

  // TEST 3: Validation logic
it("should fail if character name is missing during creation", () => {
    const reqBody: any = { health: 100 }; 
    
    const isValid = reqBody.hasOwnProperty('name') && reqBody.name !== undefined && reqBody.name !== "";
    
    expect(isValid).toBe(false);
  })});
