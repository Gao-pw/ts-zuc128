import { ZUC128 } from "./index";
export type ZUCPlugin = <T extends typeof ZUC128>(
  Z: T
) => T & {
  new (...args: ConstructorParameters<T>): InstanceType<T>
};