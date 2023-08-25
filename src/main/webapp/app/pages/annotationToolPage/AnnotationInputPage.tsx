import React, { useState } from 'react';
import { observer } from 'mobx-react';
import inputFileStore from './InputFileStore';
import { Alert } from 'react-bootstrap';
import { Tab, Tabs, TabPanel } from 'react-responsive-tabs';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import 'react-responsive-tabs/styles.css';

interface FileUploadBoxProps {
  fileType: string;
  fileIndex: number;
}

const FileUploadBox: React.FC<FileUploadBoxProps> = ({
  fileType,
  fileIndex,
}) => {
  const [isUploaded, setIsUploaded] = useState(false);
  const [showColumnInfoModal, setShowColumnInfoModal] = useState(false);
  const [iconClassName, setIconClassName] = useState('fa fa-upload');

  const handleIconClick = () => {
    if (!isUploaded) {
      // Trigger file input click programmatically
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.txt'; // Add accepted file types here
      fileInput.onchange = event => {
        const selectedFile = (event.target as HTMLInputElement).files?.[0];
        if (selectedFile) {
          setIsUploaded(true);
          setIconClassName('fa fa-trash');

          // Read file content using FileReader
          const reader = new FileReader();
          reader.onload = () => {
            const fileContent = reader.result as string;

            // Store the file content in the InputFileStore
            inputFileStore.setFileContent(fileIndex, fileContent);

            // implement check to validate file first
            inputFileStore.incrementValidFileCount();
          };
          reader.readAsText(selectedFile);
        }
      };
      fileInput.click();
    } else {
      // implement delete the file from store
      setIsUploaded(false);
      setIconClassName('fa fa-upload');
    }
  };

  const toggleColumnInfoModal = () => {
    setShowColumnInfoModal(!showColumnInfoModal);
  };

  const boxStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px',
    // margin: '5px',
    borderRadius: '10px',
    width: '250px',
    textAlign: 'left',
    border: isUploaded ? '1px solid green' : '1px solid grey',
  } as React.CSSProperties;

  const fileInfoStyle = {
    fontWeight: 'bold',
    fontSize: '14px',
  } as React.CSSProperties;

  const fileTextStyle = {
    fontStyle: 'italic',
    fontSize: '10px',
  } as React.CSSProperties;

  const iconStyle = {
    cursor: 'pointer',
  } as React.CSSProperties;

  const clickStyle = {
    color: 'blue',
    textDecoration: 'underline',
    cursor: 'pointer',
  } as React.CSSProperties;

  return (
    <div style={boxStyle}>
      <div>
        <div style={fileInfoStyle}>{fileType}</div>
        <div style={fileTextStyle}>
          See required/optional columns{' '}
          <span style={clickStyle} onClick={toggleColumnInfoModal}>
            here
          </span>
          .
        </div>
      </div>
      <i
        className={iconClassName}
        style={iconStyle}
        onClick={handleIconClick}
      ></i>
      {/* <ColumnInfoModal
        fileType={fileType}
        show={showColumnInfoModal}
        onHide={toggleColumnInfoModal}
      /> */}
    </div>
  );
};

const AnnotationInputPage: React.FC = () => {
  // have a store
  // page maintains class --> maintain the store --> manage the functional components
  // method processing file changes the state for the annotate button
  // bootstrap -error warning, etc
  // string constants to enumerations
  // file type and tab type can use enumerations

  const [selectedTab, setSelectedTab] = useState(0); // Set initial selected tab

  const handleTabChange = (newTabIndex: number) => {
    setSelectedTab(newTabIndex); // Update the selected tab when a tab is clicked
  };

  return (
    <div>
      <Alert variant="warning">
        <strong>
          All data uploaded to the tool only stay within your browser. We never
          upload your data to our server.
        </strong>
      </Alert>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between', // Spacing between boxes will be even
        }}
      >
        <FileUploadBox fileType="Single Nucleotide Mutation" fileIndex={0} />
        <FileUploadBox fileType="Copy Number Alterations" fileIndex={1} />
        <FileUploadBox fileType="Structural Variant" fileIndex={2} />
        <FileUploadBox fileType="Clinical Data" fileIndex={3} />
      </div>

      <br />
      <div style={{ fontSize: '10px' }}>
        <span>
          Visualize your input data below. Load in sample data for all four file
          types here.
        </span>
        <br />
        <span>
          Note: with the Clinical Data file uploaded, its contents will override
          perspective columns in other files.
        </span>
      </div>

      {/* <Tabs
      /> */}
    </div>
  );
};

export default AnnotationInputPage;
