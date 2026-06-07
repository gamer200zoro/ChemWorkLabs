// Formula parser for chemical formulas and names

export interface ParsedFormula {
  elements: { symbol: string; count: number }[];
  isValid: boolean;
  error?: string;
}

export interface NormalizedInput {
  original: string;
  normalized: string;
  type: "formula" | "name" | "mixed";
}

// Common element symbols
const elementSymbols: { [key: string]: string } = {
  h: "H",
  he: "He",
  li: "Li",
  be: "Be",
  b: "B",
  c: "C",
  n: "N",
  o: "O",
  f: "F",
  ne: "Ne",
  na: "Na",
  mg: "Mg",
  al: "Al",
  si: "Si",
  p: "P",
  s: "S",
  cl: "Cl",
  ar: "Ar",
  k: "K",
  ca: "Ca",
  br: "Br",
  i: "I",
  fe: "Fe",
  cu: "Cu",
  zn: "Zn",
};

// Common compound name to formula mappings
const compoundNames: { [key: string]: string } = {
  "sodium chloride": "NaCl",
  salt: "NaCl",
  "table salt": "NaCl",
  water: "H2O",
  "carbon dioxide": "CO2",
  "calcium carbonate": "CaCO3",
  limestone: "CaCO3",
  chalk: "CaCO3",
  marble: "CaCO3",
  "hydrochloric acid": "HCl",
  "sodium hydroxide": "NaOH",
  "caustic soda": "NaOH",
  lye: "NaOH",
  "iron(iii) chloride": "FeCl3",
  "ferric chloride": "FeCl3",
  "sulfuric acid": "H2SO4",
  "oil of vitriol": "H2SO4",
  ammonia: "NH3",
  "copper(ii) sulfate": "CuSO4",
  "blue vitriol": "CuSO4",
  "calcium hydroxide": "Ca(OH)2",
  "slaked lime": "Ca(OH)2",
  "hydrated lime": "Ca(OH)2",
  "zinc chloride": "ZnCl2",
  "magnesium chloride": "MgCl2",
};

export function normalizeInput(input: string): NormalizedInput {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // Check if it's a known compound name
  if (compoundNames[lower]) {
    return {
      original: trimmed,
      normalized: compoundNames[lower],
      type: "name",
    };
  }

  // If it looks like a formula (contains numbers or parentheses)
  if (/\d|\(|\)/.test(trimmed)) {
    return {
      original: trimmed,
      normalized: trimmed,
      type: "formula",
    };
  }

  // Otherwise treat as element names or formula
  return {
    original: trimmed,
    normalized: trimmed,
    type: "mixed",
  };
}

export function parseFormula(formula: string): ParsedFormula {
  try {
    const elements: { symbol: string; count: number }[] = [];
    let i = 0;

    while (i < formula.length) {
      // Handle opening parenthesis
      if (formula[i] === "(") {
        // Find matching closing parenthesis
        let depth = 1;
        let j = i + 1;
        while (j < formula.length && depth > 0) {
          if (formula[j] === "(") depth++;
          if (formula[j] === ")") depth--;
          j++;
        }

        // Get the multiplier after the closing parenthesis
        let multiplier = 1;
        if (j < formula.length && /\d/.test(formula[j])) {
          let k = j;
          while (k < formula.length && /\d/.test(formula[k])) {
            k++;
          }
          multiplier = parseInt(formula.substring(j, k));
          j = k;
        }

        // Parse the content inside parentheses
        const innerFormula = formula.substring(i + 1, j - 1 - String(multiplier).length);
        const innerElements = parseFormula(innerFormula);

        if (!innerElements.isValid) {
          return innerElements;
        }

        // Add inner elements with multiplier
        for (const elem of innerElements.elements) {
          const existing = elements.find((e) => e.symbol === elem.symbol);
          if (existing) {
            existing.count += elem.count * multiplier;
          } else {
            elements.push({
              symbol: elem.symbol,
              count: elem.count * multiplier,
            });
          }
        }

        i = j;
      } else if (/[A-Z]/.test(formula[i])) {
        // Parse element symbol
        let symbol = formula[i];
        let j = i + 1;

        while (j < formula.length && /[a-z]/.test(formula[j])) {
          symbol += formula[j];
          j++;
        }

        // Parse count
        let count = 1;
        if (j < formula.length && /\d/.test(formula[j])) {
          let k = j;
          while (k < formula.length && /\d/.test(formula[k])) {
            k++;
          }
          count = parseInt(formula.substring(j, k));
          j = k;
        }

        const existing = elements.find((e) => e.symbol === symbol);
        if (existing) {
          existing.count += count;
        } else {
          elements.push({ symbol, count });
        }

        i = j;
      } else if (formula[i] === ")") {
        i++;
      } else {
        i++;
      }
    }

    return {
      elements,
      isValid: elements.length > 0,
    };
  } catch (error) {
    return {
      elements: [],
      isValid: false,
      error: "Invalid formula syntax",
    };
  }
}

export function parseElementInput(input: string): ParsedFormula {
  const normalized = normalizeInput(input);
  return parseFormula(normalized.normalized);
}

export function formulaToString(elements: { symbol: string; count: number }[]): string {
  return elements.map((e) => (e.count > 1 ? `${e.symbol}${e.count}` : e.symbol)).join("");
}

export function getElementsFromFormula(
  formula: string
): { symbol: string; count: number }[] {
  const parsed = parseFormula(formula);
  return parsed.isValid ? parsed.elements : [];
}
