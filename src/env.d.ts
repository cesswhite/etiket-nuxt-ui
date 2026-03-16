// Runtime globals available in Node.js 16+ and all modern browsers
declare class TextEncoder {
  encode(input?: string): Uint8Array
}

declare function btoa(data: string): string
declare function atob(data: string): string
