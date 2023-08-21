import React from 'react';

interface ButtonProps {
  fileType: string;
  onFileUpload: (file: File) => void;
}

const ButtonComponent: React.FC<ButtonProps> = ({ fileType, onFileUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  return (
    <div className="upload-button">
      <div className="button-title">{fileType}</div>
      <label className="upload-label">
        <input type="file" accept=".txt" onChange={handleFileChange} />
      </label>
    </div>
  );
};

export default ButtonComponent;
