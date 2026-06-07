// Data loader for atoms, compounds, and reactions

export interface Atom {
  id: string;
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: number;
  group: number;
  period: number;
  valency: number[];
  electronegativity: number;
  radius: number;
  category: string;
  color: string;
  commonOxidationStates: number[];
  electronConfiguration: string;
  commonBonds: string[];
  description: string;
}

export interface Compound {
  id: string;
  name: string;
  formula: string;
  composition: { element: string; count: number }[];
  molarMass: number;
  bondType: string;
  category: string;
  stability: number;
  confidence: number;
  description: string;
  commonNames: string[];
  state: string;
  color: string;
  solubility: string;
  reactionHistory: string[];
  generationRule: string;
  deviceOrigin: string;
  groupOrigin: string | null;
}

export interface ReactionRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  conditions: string[];
  products: string;
  stabilityBoost: number;
  confidence: number;
  examples: Array<{ reactants: string[]; products: string[] }>;
}

let atomsCache: Atom[] | null = null;
let compoundsCache: Compound[] | null = null;
let reactionsCache: any = null;
let glossaryCache: any = null;

export async function loadAtoms(): Promise<Atom[]> {
  if (atomsCache) return atomsCache;
  try {
    const response = await fetch("/data/atoms.json");
    const data = await response.json();
    atomsCache = data.atoms;
    return atomsCache || [];
  } catch (error) {
    console.error("Failed to load atoms:", error);
    return [];
  }
}

export async function loadCompounds(): Promise<Compound[]> {
  if (compoundsCache) return compoundsCache;
  try {
    const response = await fetch("/data/compounds.json");
    const data = await response.json();
    compoundsCache = data.compounds;
    return compoundsCache || [];
  } catch (error) {
    console.error("Failed to load compounds:", error);
    return [];
  }
}

export async function loadReactions(): Promise<any> {
  if (reactionsCache) return reactionsCache;
  try {
    const response = await fetch("/data/reactions.json");
    const data = await response.json();
    reactionsCache = data;
    return reactionsCache;
  } catch (error) {
    console.error("Failed to load reactions:", error);
    return { reactionRules: [], stabilityFactors: {}, commonReactions: [] };
  }
}

export async function loadGlossary(): Promise<any> {
  if (glossaryCache) return glossaryCache;
  try {
    const response = await fetch("/data/glossary.json");
    const data = await response.json();
    glossaryCache = data;
    return glossaryCache;
  } catch (error) {
    console.error("Failed to load glossary:", error);
    return { glossary: [], studyTopics: [], quizzes: [] };
  }
}

export async function getAtomBySymbol(symbol: string): Promise<Atom | null> {
  const atoms = await loadAtoms();
  return atoms.find((a) => a.symbol.toLowerCase() === symbol.toLowerCase()) || null;
}

export async function getCompoundByFormula(formula: string): Promise<Compound | null> {
  const compounds = await loadCompounds();
  return (
    compounds.find((c) => c.formula.toLowerCase() === formula.toLowerCase()) || null
  );
}

export async function searchCompounds(query: string): Promise<Compound[]> {
  const compounds = await loadCompounds();
  const lowerQuery = query.toLowerCase();
  return compounds.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.formula.toLowerCase().includes(lowerQuery) ||
      c.commonNames.some((cn) => cn.toLowerCase().includes(lowerQuery))
  );
}

export async function getReactionRules(): Promise<ReactionRule[]> {
  const reactions = await loadReactions();
  return reactions.reactionRules || [];
}
