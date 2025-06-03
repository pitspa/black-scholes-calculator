/* tslint:disable */
/* eslint-disable */
export class BlackScholesCalculator {
  free(): void;
  constructor();
  calculate_option_prices(spot: number, strike: number, rate: number, volatility: number, time_to_maturity: number): any;
  calculate_greeks(spot: number, strike: number, rate: number, volatility: number, time_to_maturity: number): any;
  parameter_sweep(base_spot: number, base_strike: number, base_rate: number, base_volatility: number, base_maturity: number, parameter: string, range: number, steps: number): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_blackscholescalculator_free: (a: number, b: number) => void;
  readonly blackscholescalculator_new: () => number;
  readonly blackscholescalculator_calculate_option_prices: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
  readonly blackscholescalculator_calculate_greeks: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
  readonly blackscholescalculator_parameter_sweep: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => any;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
