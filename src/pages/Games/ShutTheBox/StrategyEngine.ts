// StrategyEngine.ts
type PinStateInt = 0 | 1; // 0 = Open/Selected, 1 = Shut
type PinArray = [PinStateInt, PinStateInt, PinStateInt, PinStateInt, PinStateInt, PinStateInt, PinStateInt, PinStateInt, PinStateInt];

export class ShutTheBoxStrategy {
  private strategyMap: Map<string, string>;

  constructor() {
    this.strategyMap = new Map<string, string>();
  }

  public loadStrategy(rawText: string): void {
    const lines = rawText.split('\n');
    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;
      // Format: (2,sum,p1...p9)=action
      const parts = cleanLine.split('=');
      if (parts.length === 2) {
        this.strategyMap.set(parts[0].trim(), parts[1].trim());
      }
    }
    console.log(`[AI] Strategy loaded with ${this.strategyMap.size} states.`);
  }

  public getBestMove(diceSum: number, pins: PinArray): number[] | null {
    // PRISM keys usually use phase 2 for decision making in STB
    const key = `(2,${diceSum},${pins.join(',')})`;
    const actionString = this.strategyMap.get(key);

    if (!actionString) return null;

    return this.decodeAction(actionString);
  }

  private decodeAction(action: string): number[] {
    // Example: "shutforresult7_3_4" -> [3, 4]
    const parts = action.split('_');
    const pinsToShut: number[] = [];
    // Start at index 1 to skip the "shutforresultX" part
    for (let i = 1; i < parts.length; i++) {
      pinsToShut.push(parseInt(parts[i], 10));
    }
    return pinsToShut;
  }
}