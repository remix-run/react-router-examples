declare module "jsurl" {
  export function parse(value: string | null): unknown;
  export function stringify(value: unknown): string;
}
