/**
 * Utilities for handling JSON parsing and formatting
 */

/**
 * Convert unquoted property names to valid JSON
 */
export function fixJson(str: string): string {
  // Remove any markdown formatting
  str = str.replace(/```json\n|\n```/g, "");
  
  // Remove any leading/trailing whitespace
  str = str.trim();
  
  // If the string starts with "{" but doesn't end with "}", find the last "}"
  if (str.startsWith("{") && !str.endsWith("}")) {
    const lastBrace = str.lastIndexOf("}");
    if (lastBrace > 0) {
      str = str.substring(0, lastBrace + 1);
    }
  }
  
  // Fix unquoted property names
  str = str.replace(/(\s*?)(\w+?)\s*:/g, '"$2":');
  
  // Fix single quotes to double quotes
  str = str.replace(/'/g, '"');
  
  // Remove comments
  str = str.replace(/\/\/.*/g, "");
  
  // Fix trailing commas
  str = str.replace(/,(\s*[}\]])/g, "$1");
  
  // Fix missing commas between elements
  str = str.replace(/}(\s*){/g, "},{");
  str = str.replace(/](\s*)\[/g, "],[");
  str = str.replace(/}(\s*)\[/g, "},[");
  str = str.replace(/](\s*){/g, "],{");
  
  // Fix missing quotes around string values
  str = str.replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ':"$1"$2');
  
  // Fix unterminated strings
  const matches = str.match(/:\s*"[^"]*$/gm);
  if (matches) {
    matches.forEach(match => {
      const fixedMatch = match + '"';
      str = str.replace(match, fixedMatch);
    });
  }
  
  // Add missing commas between properties
  str = str.replace(/}(\s*)"(\w+)":/g, '},$1"$2":');
  str = str.replace(/](\s*)"(\w+)":/g, '],$1"$2":');
  
  // Remove any remaining newlines and extra spaces
  str = str.replace(/\s+/g, " ").trim();
  
  return str;
}

/**
 * Parse JSON with error handling
 */
export function parseJson<T>(str: string, context: string): T {
  try {
    const jsonStr = fixJson(str);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Failed to parse ${context}:`, error);
    console.error("Raw response:", str);
    throw error;
  }
}
