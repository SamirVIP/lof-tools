import { useState, useEffect } from 'react';

export function useAuth() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const unlocked = localStorage.getItem('lof-tools-auth') === 'true';
    setIsUnlocked(unlocked);
  }, []);

  const unlock = (password: string) => {
    if (password === 'lofassets') {
      localStorage.setItem('lof-tools-auth', 'true');
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    localStorage.removeItem('lof-tools-auth');
    setIsUnlocked(false);
  };

  return { isUnlocked, unlock, lock };
}
