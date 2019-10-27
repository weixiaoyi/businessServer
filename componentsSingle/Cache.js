import LRU from "lru-cache";
const cache = new LRU({
  max: 500,
  maxAge: 12 * 60 * 60 * 1000 // 1小时
});

export default cache;
