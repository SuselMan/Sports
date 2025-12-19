import { useEffect, useState } from 'react';

function useDbReload<T>(loader: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const v = await loader();
        if (alive) setData(v);
      } finally {
        if (alive) setLoading(false);
      }
    };

    const onChange = () => load();
    load();
    window.addEventListener('sports-db-change', onChange);
    return () => {
      alive = false;
      window.removeEventListener('sports-db-change', onChange);
    };
  }, [loader]);

  return { data, loading };
}

export { useDbReload };


