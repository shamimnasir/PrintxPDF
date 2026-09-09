// libheif-js ships Emscripten typings for the raw C API only; the HeifDecoder /
// HeifImage wrappers we actually use are declared here. Loaded via dynamic
// import() only, so the 2 MB WASM bundle never enters the main chunk.
declare module 'libheif-js/libheif-wasm/libheif-bundle.mjs' {
  export interface HeifImage {
    get_width(): number
    get_height(): number
    is_primary(): boolean
    has_alpha_channel(): boolean
    /** Fills `target` with interleaved RGBA; calls back with null on failure. */
    display(target: ImageData, cb: (result: ImageData | null) => void): void
    free(): void
  }
  export interface HeifDecoder {
    decode(data: Uint8Array): HeifImage[]
  }
  export interface LibHeif {
    HeifDecoder: new () => HeifDecoder
  }
  const factory: (opts?: Record<string, unknown>) => Promise<LibHeif> | LibHeif
  export default factory
}
