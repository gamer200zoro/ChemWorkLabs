// Reaction engine for predicting chemical reactions

import { Atom, Compound } from "./dataLoader";
import { ParsedFormula } from "./formulaParser";

export interface ReactionResult {
  reactants: string[];
  products: string[];
  reactionType: string;
  stability: number;
  confidence: number;
  explanation: string;
  rulesApplied: string[];
  energyType?: "exothermic" | "endothermic";
}

export interface ReactionPrediction {
  primary: ReactionResult;
  alternatives: ReactionResult[];
  hasWarnings: boolean;
  warnings: string[];
}

export class ReactionEngine {
  private atoms: Atom[];
  private compounds: Compound[];

  constructor(atoms: Atom[], compounds: Compound[]) {
    this.atoms = atoms;
    this.compounds = compounds;
  }

  predictReaction(
    reactant1: string,
    reactant2: string
  ): ReactionPrediction {
    const results: ReactionResult[] = [];
    const warnings: string[] = [];

    // Try ionic bonding
    const ionicResult = this.tryIonicBonding(reactant1, reactant2);
    if (ionicResult) results.push(ionicResult);

    // Try covalent bonding
    const covalentResult = this.tryCovalentBonding(reactant1, reactant2);
    if (covalentResult) results.push(covalentResult);

    // Try acid-base reaction
    const acidBaseResult = this.tryAcidBase(reactant1, reactant2);
    if (acidBaseResult) results.push(acidBaseResult);

    // Try combination
    const combinationResult = this.tryCombination(reactant1, reactant2);
    if (combinationResult) results.push(combinationResult);

    // Sort by stability and confidence
    results.sort((a, b) => {
      const scoreA = a.stability * 0.6 + a.confidence * 0.4;
      const scoreB = b.stability * 0.6 + b.confidence * 0.4;
      return scoreB - scoreA;
    });

    if (results.length === 0) {
      warnings.push("No standard reaction patterns matched these reactants");
      return {
        primary: {
          reactants: [reactant1, reactant2],
          products: [],
          reactionType: "unknown",
          stability: 0,
          confidence: 0,
          explanation: "Unable to predict reaction",
          rulesApplied: [],
        },
        alternatives: [],
        hasWarnings: true,
        warnings,
      };
    }

    return {
      primary: results[0],
      alternatives: results.slice(1),
      hasWarnings: warnings.length > 0,
      warnings,
    };
  }

  private tryIonicBonding(reactant1: string, reactant2: string): ReactionResult | null {
    const atom1 = this.atoms.find((a) => a.symbol === reactant1 || a.name.toLowerCase() === reactant1.toLowerCase());
    const atom2 = this.atoms.find((a) => a.symbol === reactant2 || a.name.toLowerCase() === reactant2.toLowerCase());

    if (!atom1 || !atom2) return null;

    const isIonic =
      (atom1.category === "metal" && atom2.category === "nonmetal") ||
      (atom1.category === "metal" && atom2.category === "halogen") ||
      (atom1.category === "metal" && atom2.category === "noble_gas");

    if (!isIonic) return null;

    const electronegativityDiff = Math.abs(atom1.electronegativity - atom2.electronegativity);
    if (electronegativityDiff < 1.7) return null;

    // Determine valencies
    const val1 = atom1.valency[0];
    const val2 = atom2.valency[0];

    // Create formula
    let formula = "";
    if (val1 === val2) {
      formula = `${atom1.symbol}${atom2.symbol}`;
    } else {
      formula = `${atom1.symbol}${val2}${atom2.symbol}${val1}`;
    }

    const compound = this.compounds.find((c) => c.formula === formula);

    return {
      reactants: [reactant1, reactant2],
      products: [formula],
      reactionType: "ionic_bonding",
      stability: compound?.stability || 85,
      confidence: 90,
      explanation: `${atom1.name} (metal) transfers electrons to ${atom2.name} (nonmetal), forming ionic compound ${formula}`,
      rulesApplied: ["electronegativity_difference", "metal_nonmetal_bonding"],
      energyType: "exothermic",
    };
  }

  private tryCovalentBonding(reactant1: string, reactant2: string): ReactionResult | null {
    const atom1 = this.atoms.find((a) => a.symbol === reactant1 || a.name.toLowerCase() === reactant1.toLowerCase());
    const atom2 = this.atoms.find((a) => a.symbol === reactant2 || a.name.toLowerCase() === reactant2.toLowerCase());

    if (!atom1 || !atom2) return null;

    const isCovalent =
      atom1.category === "nonmetal" && atom2.category === "nonmetal";

    if (!isCovalent) return null;

    // Determine counts based on valency
    const val1 = atom1.valency[0];
    const val2 = atom2.valency[0];

    let formula = "";
    if (val1 === val2) {
      formula = `${atom1.symbol}${atom2.symbol}`;
    } else {
      formula = `${atom1.symbol}${val2}${atom2.symbol}${val1}`;
    }

    const compound = this.compounds.find((c) => c.formula === formula);

    return {
      reactants: [reactant1, reactant2],
      products: [formula],
      reactionType: "covalent_bonding",
      stability: compound?.stability || 80,
      confidence: 85,
      explanation: `${atom1.name} and ${atom2.name} share electrons to form covalent compound ${formula}`,
      rulesApplied: ["nonmetal_bonding", "valency_matching"],
      energyType: "exothermic",
    };
  }

  private tryAcidBase(reactant1: string, reactant2: string): ReactionResult | null {
    const isAcid = (name: string) => name.toLowerCase().includes("acid");
    const isBase = (name: string) => name.toLowerCase().includes("base") || name.toLowerCase().includes("hydroxide");

    const r1IsAcid = isAcid(reactant1);
    const r2IsBase = isBase(reactant2);
    const r1IsBase = isBase(reactant1);
    const r2IsAcid = isAcid(reactant2);

    if (!((r1IsAcid && r2IsBase) || (r1IsBase && r2IsAcid))) return null;

    // Simple acid-base: HCl + NaOH -> NaCl + H2O
    const products = ["salt", "H2O"];

    return {
      reactants: [reactant1, reactant2],
      products,
      reactionType: "acid_base",
      stability: 95,
      confidence: 95,
      explanation: "Acid-base neutralization reaction producing salt and water",
      rulesApplied: ["acid_base_neutralization"],
      energyType: "exothermic",
    };
  }

  private tryCombination(reactant1: string, reactant2: string): ReactionResult | null {
    // Simple combination: A + B -> AB
    const formula = `${reactant1}${reactant2}`;
    const compound = this.compounds.find((c) => c.formula === formula);

    if (!compound) return null;

    return {
      reactants: [reactant1, reactant2],
      products: [formula],
      reactionType: "combination",
      stability: compound.stability,
      confidence: 75,
      explanation: `Combination reaction: ${reactant1} and ${reactant2} combine to form ${formula}`,
      rulesApplied: ["combination_reaction"],
      energyType: "exothermic",
    };
  }

  calculateStability(formula: string, atoms: Atom[]): number {
    // Simple stability calculation based on known compounds
    const compound = this.compounds.find((c) => c.formula === formula);
    if (compound) return compound.stability;

    // Estimate based on element properties
    let score = 50;
    // Add points for known stable patterns
    if (formula.includes("O")) score += 10;
    if (formula.includes("H")) score += 5;

    return Math.min(score, 100);
  }
}
