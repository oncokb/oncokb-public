import React, { useState, useEffect } from 'react';
import { Alert, Modal, Button, Form } from 'react-bootstrap';
import classnames from 'classnames';

interface FileUploadBoxProps {
  fileType: string;
}

interface ColumnInfoModalProps {
  fileType: string;
  show: boolean;
  onHide: () => void;
  // Add props for required and optional columns if needed
}

const ColumnInfoModal: React.FC<ColumnInfoModalProps> = ({
  fileType,
  show,
  onHide,
}) => {
  const [requiredCols, setRequiredCols] = useState('');
  const [optionalCols, setOptionalCols] = useState('');

  useEffect(() => {
    if (fileType === 'Single Nucleotide Mutation') {
      setRequiredCols('SNM');
      setOptionalCols('SNM');
    } else {
      setRequiredCols('');
      setOptionalCols('');
    }
  }, [fileType]);

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Required and Optional Columns for {fileType}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Required: {requiredCols}
        <br />
        Optional: {optionalCols}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const FileUploadBox: React.FC<FileUploadBoxProps> = ({ fileType }) => {
  const [isUploaded, setIsUploaded] = useState(false);
  const [showColumnInfoModal, setShowColumnInfoModal] = useState(false);
  const [iconClassName, setIconClassName] = useState('fa fa-upload');

  const handleIconClick = () => {
    if (!isUploaded) {
      setIsUploaded(true);
      setIconClassName('fa fa-trash');
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
      <ColumnInfoModal
        fileType={fileType}
        show={showColumnInfoModal}
        onHide={toggleColumnInfoModal}
      />
    </div>
  );
};

const SeeData: React.FC<FileUploadBoxProps> = ({ fileType }) => {
  const [exampleData, setExampleData] = useState('');

  // const handleExampleDataChange = (event: React.FormEvent<HTMLFormElement>) => {
  //   setExampleData(event.target.value);
  // };

  const handleAnnotateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Perform the annotation logic here with the exampleData
  };

  return (
    <Form onSubmit={handleAnnotateSubmit}>
      <Form.Group controlId="exampleDataTextarea">
        <Form.Control
          as="textarea"
          rows={10}
          value={exampleData}
          // onChange={handleExampleDataChange}
        />
      </Form.Group>
      <Button type="submit">Annotate</Button>
    </Form>
  );
};

const AnnotationInputPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('SNM'); // Set initial selected tab

  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab); // Update the selected tab when a tab is clicked
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
        <FileUploadBox fileType="Single Nucleotide Mutation" />
        <FileUploadBox fileType="Copy Number Alterations" />
        <FileUploadBox fileType="Structural Variant" />
        <FileUploadBox fileType="Clinical Data" />
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
      {/* <AnnotationTabComponent
      selectedTab={selectedTab}
      onTabChange={handleTabChange}
      />
      <SeeData fileType="Single Nucleotide Mutation" /> */}
    </div>
  );
};

export default AnnotationInputPage;
