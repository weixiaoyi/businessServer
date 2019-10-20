import LRU from "lru-cache";
const cache = new LRU({
  max: 500,
  maxAge: 3 * 60 * 60 * 1000 // 1小时
});

export default cache;
