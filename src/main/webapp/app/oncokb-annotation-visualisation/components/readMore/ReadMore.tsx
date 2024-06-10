import React, { useState } from 'react';

const ReadMoreCell = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleReadMore = () => setIsExpanded(!isExpanded);

  const renderText = () => {
    if (isExpanded) {
      return (
        <>
          {text}
          <span
            style={{ color: 'blue', cursor: 'pointer', marginLeft: '5px' }}
            onClick={toggleReadMore}
          >
            Read less
          </span>
        </>
      );
    }
    const limitedText =
      text.length > 150 ? text.substring(0, 150) + '...' : text;
    return (
      <>
        {limitedText}
        {text.length > 100 && (
          <span
            style={{ color: 'blue', cursor: 'pointer', marginLeft: '5px' }}
            onClick={toggleReadMore}
          >
            Read more
          </span>
        )}
      </>
    );
  };

  return <div>{renderText()}</div>;
};

export default ReadMoreCell;
