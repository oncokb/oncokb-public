import React from 'react';

interface AnnotateButtonProps {
  isValid: boolean;
  onClick: () => void;
}

const AnnotateButton: React.FC<AnnotateButtonProps> = ({
  isValid,
  onClick,
}) => {
  return (
    <button
      className={`annotate-button ${isValid ? 'blue' : 'gray'}`}
      onClick={onClick}
    >
      Annotate
    </button>
  );
};

export default AnnotateButton;
