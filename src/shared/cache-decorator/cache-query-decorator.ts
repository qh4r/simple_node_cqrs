import { CacheDecorator } from "./cache-decorator";

function createCacheKey(target: Object, args: any[]) {
  const cacheKey = `Queries:${target.constructor.name}`;
  const arg = args[0];
  return `${cacheKey}:${Object.keys(arg)
    .map(key => arg[key])
    .join("_")}`;
}

export interface CacheQueryProps {
  duration?: number;
}

export function CacheQuery({ duration }: CacheQueryProps = { duration: 60 * 15 }) {
  return CacheDecorator(createCacheKey, duration);
}
