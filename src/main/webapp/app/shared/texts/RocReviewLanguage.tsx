import React from 'react';

const RocReviewLanguage = () => {
  return (
    <div className={'alert alert-warning'}>
      Only send to MSK ROC review based on either one of the following triggers:
      <ol style={{ listStyleType: 'lower-alpha' }}>
        <li>
          The licensee is located in any of the following countries - Burma,
          Cambodia, Cuba, China (including Hong Kong and Macau), Iran, North
          Korea, Russia, Syria, Venezuela, or Belarus; or
        </li>
        <li>
          The request is for one of the following license types: (i) Use in a
          commercial product, or (ii) Research use in a commercial setting.
        </li>
      </ol>
    </div>
  );
};

export default RocReviewLanguage;
