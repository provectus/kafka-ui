import React from 'react';

type Callback = () => any;

const useInterval = (callback: Callback, delay: number) => {
  const savedCallback = React.useRef<Callback>();

  React.useEffect(
    () => {
      savedCallback.current = callback;
    },
    [callback],
  );

  React.useEffect(
    () => {
      const tick = () => {
        savedCallback.current && savedCallback.current()
      };

      if (delay !== null) {
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    },
    [delay],
  );
}

export default useInterval;
