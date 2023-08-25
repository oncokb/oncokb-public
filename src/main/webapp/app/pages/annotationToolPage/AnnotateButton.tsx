// import React, { useState, useEffect } from 'react';
// import { Alert, Modal, Button, Form } from 'react-bootstrap';
// import classnames from 'classnames';

// interface FileUploadBoxProps {
//   fileType: string;
// }

// interface ColumnInfoModalProps {
//   fileType: string;
//   show: boolean;
//   onHide: () => void;
//   // Add props for required and optional columns if needed
// }

// const ColumnInfoModal: React.FC<ColumnInfoModalProps> = ({
//   fileType,
//   show,
//   onHide,
// }) => {
//   const [requiredCols, setRequiredCols] = useState('');
//   const [optionalCols, setOptionalCols] = useState('');

//   useEffect(() => {
//     if (fileType === 'Single Nucleotide Mutation') {
//       setRequiredCols('SNM');
//       setOptionalCols('SNM');
//     } else {
//       setRequiredCols('');
//       setOptionalCols('');
//     }
//   }, [fileType]);

//   return (
//     <Modal show={show} onHide={onHide}>
//       <Modal.Header closeButton>
//         <Modal.Title>Required and Optional Columns for {fileType}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         Required: {requiredCols}
//         <br />
//         Optional: {optionalCols}
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onHide}>
//           Close
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// const FileUploadBox: React.FC<FileUploadBoxProps> = ({ fileType }) => {
//   const [isUploaded, setIsUploaded] = useState(false);
//   const [showColumnInfoModal, setShowColumnInfoModal] = useState(false);
//   const [iconClassName, setIconClassName] = useState('fa fa-upload');

//   const handleIconClick = () => {
//     if (!isUploaded) {
//       setIsUploaded(true);
//       setIconClassName('fa fa-trash');
//     }
//   };

//   const toggleColumnInfoModal = () => {
//     setShowColumnInfoModal(!showColumnInfoModal);
//   };

//   const boxStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: '10px',
//     // margin: '5px',
//     borderRadius: '10px',
//     width: '250px',
//     textAlign: 'left',
//     border: isUploaded ? '1px solid green' : '1px solid grey',
//   } as React.CSSProperties;

//   const fileInfoStyle = {
//     fontWeight: 'bold',
//     fontSize: '14px',
//   } as React.CSSProperties;

//   const fileTextStyle = {
//     fontStyle: 'italic',
//     fontSize: '10px',
//   } as React.CSSProperties;

//   const iconStyle = {
//     cursor: 'pointer',
//   } as React.CSSProperties;

//   const clickStyle = {
//     color: 'blue',
//     textDecoration: 'underline',
//     cursor: 'pointer',
//   } as React.CSSProperties;

//   return (
//     <div style={boxStyle}>
//       <div>
//         <div style={fileInfoStyle}>{fileType}</div>
//         <div style={fileTextStyle}>
//           See required/optional columns{' '}
//           <span style={clickStyle} onClick={toggleColumnInfoModal}>
//             here
//           </span>
//           .
//         </div>
//       </div>
//       <i
//         className={iconClassName}
//         style={iconStyle}
//         onClick={handleIconClick}
//       ></i>
//       <ColumnInfoModal
//         fileType={fileType}
//         show={showColumnInfoModal}
//         onHide={toggleColumnInfoModal}
//       />
//     </div>
//   );
// };

// const SeeData: React.FC<FileUploadBoxProps> = ({ fileType }) => {
//   const [exampleData, setExampleData] = useState('');

//   // const handleExampleDataChange = (event: React.FormEvent<HTMLFormElement>) => {
//   //   setExampleData(event.target.value);
//   // };

//   const handleAnnotateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     // Perform the annotation logic here with the exampleData
//   };

//   return (
//     <Form onSubmit={handleAnnotateSubmit}>
//       <Form.Group controlId="exampleDataTextarea">
//         <Form.Control
//           as="textarea"
//           rows={10}
//           value={exampleData}
//           // onChange={handleExampleDataChange}
//         />
//       </Form.Group>
//       <Button type="submit">Annotate</Button>
//     </Form>
//   );
// };

// const AnnotationInputPage: React.FC = () => {
//   const [selectedTab, setSelectedTab] = useState('SNM'); // Set initial selected tab

//   const handleTabChange = (newTab: string) => {
//     setSelectedTab(newTab); // Update the selected tab when a tab is clicked
//   };

//   return (
//     <div>
//       <Alert variant="warning">
//         <strong>
//           All data uploaded to the tool only stay within your browser. We never
//           upload your data to our server.
//         </strong>
//       </Alert>
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between', // Spacing between boxes will be even
//         }}
//       >
//         <FileUploadBox fileType="Single Nucleotide Mutation" />
//         <FileUploadBox fileType="Copy Number Alterations" />
//         <FileUploadBox fileType="Structural Variant" />
//         <FileUploadBox fileType="Clinical Data" />
//       </div>
//       <br />
//       <div style={{ fontSize: '10px' }}>
//         <span>
//           Visualize your input data below. Load in sample data for all four file
//           types here.
//         </span>
//         <br />
//         <span>
//           Note: with the Clinical Data file uploaded, its contents will override
//           perspective columns in other files.
//         </span>
//       </div>
//       {/* <AnnotationTabComponent
//       selectedTab={selectedTab}
//       onTabChange={handleTabChange}
//       />
//       <SeeData fileType="Single Nucleotide Mutation" /> */}
//     </div>
//   );
// };

// export default AnnotationInputPage;

// // -----------------------------------------

// const AnnotationInputPage: React.FC = () => {
//   const [fileContents, setFileContents] = useState<string[]>([]);
//   const [activeTabIndex, setActiveTabIndex] = useState<number | null>(null);
//   const [iconClassName, setIconClassName] = useState('fa fa-upload');

//   const handleFileUpload = (index: number, file: File | null) => {
//     if (file) {
//       setIconClassName('fa fa-trash');

//       const reader = new FileReader();
//       reader.onload = () => {
//         const newFileContents = [...fileContents];
//         newFileContents[index] = reader.result as string;
//         setFileContents(newFileContents);
//       };
//       reader.readAsText(file);
//     }
//   };

//   const handleTabChange = (index: number) => {
//     setActiveTabIndex(index);
//   };

//   // have a store
//   // page maintains class --> maintain the store --> manage the functional components
// // method processing file changes the state for the annotate button
// // bootstrap -error warning, etc
// // string constants to enumerations
// // file type and tab type can use enumerations
//   return (
//     <div>
//       <h1>File Upload and Tab Display</h1>
//       <div className="file-upload-boxes">
//         {[0, 1, 2, 3].map((index) => (
//           <div key={index} className="file-upload-box">
//             <i
//               className={iconClassName}
//               // style={iconStyle}
//             ></i>
//             <input
//               type="file"
//               accept=".txt"
//               onChange={(e) => handleFileUpload(index, e.target.files ? e.target.files[0] : null)}
//             />
//           </div>
//         ))}
//       </div>

//       {/* <Tabs selectedIndex={activeTabIndex} onSelect={(index: number) => handleTabChange(index)}>
//         {fileContents.map((_, index) => (
//           <Tab key={index}>Tab {index + 1}</Tab>
//         ))}
//         {fileContents.map((content, index) => (
//           <TabPanel key={index}>
//             <AvForm>
//               <AvField
//                 type="textarea"
//                 name="fileContent"
//                 label="File Content"
//                 value={content || ''}
//                 disabled={!content}
//                 rows={10}
//               />
//             </AvForm>
//           </TabPanel>
//         ))}
//       </Tabs> */}

//     </div>
//   );
// };
