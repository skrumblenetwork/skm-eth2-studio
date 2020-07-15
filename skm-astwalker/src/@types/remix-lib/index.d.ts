// Type definitiosn for the things we need from skm-lib

declare module "skm-lib" {
  export module util {
    export function findLowerBound(target: number, array: Array<number>): number;
  }
}
