declare module 'onnxruntime-web' {
  export class InferenceSession {
    run(feeds: Record<string, Tensor>): Promise<Record<string, Tensor>>;
    
    static create(
      uri: string,
      options?: InferenceSession.SessionOptions,
      progressCallback?: { progressCallback: (progress: number) => void }
    ): Promise<InferenceSession>;
  }
  
  export namespace InferenceSession {
    export interface SessionOptions {
      executionProviders?: string[];
      graphOptimizationLevel?: string;
    }
    
    export type ReturnType = Record<string, Tensor>;
  }
  
  export class Tensor {
    constructor(
      type: string, 
      data: Float32Array, 
      dims: number[]
    );
    
    data: Float32Array;
    dims: number[];
    type: string;
  }
  
  export namespace env {
    export namespace wasm {
      export let numThreads: number;
      export let simd: boolean;
    }
  }
} 