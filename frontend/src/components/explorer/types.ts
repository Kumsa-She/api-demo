export type Endpoint = {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  exampleBody?: string;
  exampleHeaders?: Record<string, string>;
};

export type HeaderRow = {
  id: number;
  key: string;
  value: string;
};

export type MockResponse = {
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  body: string;
  headers: { name: string; value: string }[];
};

export type TraceStage = {
  id: string;
  label: string;
  detail: string;
  durationMs: number;
  status: 'ok' | 'fail';
};