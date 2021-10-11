import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';

const TextScroller: React.FunctionComponent<{
  text: string | JSX.Element;
}> = ({ text }) => {
  const [key, setKey] = useState(1);

  const scrolling = useSpring({
    from: { transform: 'translate(40%,0)' },
    to: { transform: 'translate(-20%,0)' },
    config: { duration: 15000 },
    reset: true,
    onRest() {
      setKey(key + 1);
    },
  });

  return (
    <div key={key}>
      <animated.div style={scrolling}>{text}</animated.div>
    </div>
  );
};

export default TextScroller;
