// import React, { useState } from 'react';
// import axios from 'axios';

// function App() {
//   const [file, setFile] = useState(null);
//   const [data, setData] = useState(null);

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleFileUpload = () => {
//     const formData = new FormData();
//     formData.append('file', file);

//     axios.post('http://127.0.0.1:8000/upload/', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     }).then((response) => {
//       setData(response.data.data);
//     }).catch((error) => {
//       console.error('Error uploading file:', error);
//     });
//   };

//   return (
//     <div>
//       <h1>Data Type Inference</h1>
//       <input type="file" onChange={handleFileChange} />
//       <button onClick={handleFileUpload}>Upload</button>

//       {data && (
//         <div>
//           <h2>Processed Data:</h2>
//           <pre>{JSON.stringify(data, null, 2)}</pre>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	margin-top: 100px;
`;

function App() {
	const [file, setFile] = useState(null);
	const [processedData, setProcessedData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (processedData) {
			console.log("Processed Data has been updated:", processedData);
		}
	}, [processedData]);

	const handleFileChange = (event) => {
		setFile(event.target.files[0]);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setError(null);

		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await axios.post(
				"http://127.0.0.1:8000/process/",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
			const sanitizedData = response.data.data.replace(/NaN/g, "null");
			const res = JSON.parse(sanitizedData);
			if (res) {
				setProcessedData(res);
			}
		} catch (err) {
			setError("An error occurred while processing the file.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container className='App'>
			<h1>Data Type Inference Tool</h1>
			<form onSubmit={handleSubmit}>
				<input
					type='file'
					onChange={handleFileChange}
					accept='.csv,.xls,.xlsx'
				/>
				<button type='submit' disabled={!file || loading}>
					{loading ? "Processing..." : "Process File"}
				</button>
			</form>

			{error && <p className='error'>{error}</p>}

			{processedData && (
				<div>
					<h2>Processed Data</h2>
					<h3>Original vs Inferred Types</h3>
					<table>
						<thead>
							<tr>
								<th>Column</th>
								<th>Original Type</th>
								<th>Inferred Type</th>
							</tr>
						</thead>
						<tbody>
							{Object.entries(processedData.original_analysis).map(
								([column, type]) => (
									<tr key={column}>
										<td>{column}</td>
										<td>{type.inferred_type}</td>
										<td>
											{processedData.inferred_analysis[column]?.inferred_type}
										</td>
									</tr>
								)
							)}
						</tbody>
					</table>

					<h3>Data Sample</h3>
					<table>
						<thead>
							<tr>
								{Object.keys(processedData.data_sample[0]).map((key) => (
									<th key={key}>{key}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{processedData.data_sample.map((row, index) => (
								<tr key={index}>
									{Object.values(row).map((value, i) => (
										<td key={i}>
											{value !== null ? value.toString() : "null"}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</Container>
	);
}


export default App;
