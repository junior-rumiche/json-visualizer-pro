
export type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JsonObject 
  | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface JsonArray extends Array<JsonValue> {}

export interface AnalysisResult {
  title: string;
  summary: string;
  keyInsights: string[];
  schemaDetected: string;
  complexityScore: number; // 1-10
}

export interface NodeDetail {
  path: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  size: number; // characters for string, items for object/array
  depth: number;
}

export enum ViewMode {
  Dashboard = 'DASHBOARD',
  Tree = 'TREE'
}