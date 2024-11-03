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
	margin: 100px 0;
`;

const StyledForm = styled.form`
	display: flex;
	gap: 40px;
`;

const DashboardWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;

	th,
	tr,
	td {
		min-width: 100px;
		text-align: center;
	}
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

	const handleSelect = async (e,column) => {
		const selectedValue = e.target.value;
		console.log(column)
		const newProcessedData = {
			...processedData,
			inferred_analysis: {
				...processedData.inferred_analysis,
				[column]: {
					...processedData.inferred_analysis[column],
					inferred_type: selectedValue,
				},
			},
		};
		setProcessedData(newProcessedData);
	}

	return (
		<Container className='App'>
			<h1>Data Type Inference Tool</h1>
			<StyledForm>
				<input
					type='file'
					onChange={handleFileChange}
					accept='.csv,.xls,.xlsx'
				/>
				<button
					type='submit'
					disabled={!file || loading}
					onClick={handleSubmit}>
					{loading ? "Processing..." : "Process File"}
				</button>
			</StyledForm>

			{error && <p className='error'>{error}</p>}

			{processedData && (
				<DashboardWrapper>
					<h2>Processed Data</h2>
					<h3>Original vs Inferred Types</h3>
					<table>
						<thead>
							<tr>
								<th>Column</th>
								<th>Original Type</th>
								<th>Inferred Type</th>
								<th>Edit</th>
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
										<td>
											<select onChange={(e)=>{handleSelect(e, column)}}>
												<option value=''>Select another type</option>
												<option value='object'>object</option>
												<option value='boolean'>boolean</option>
												<option value='int64'>int64</option>
												<option value='float64'>float64</option>
												<option value='datetime64'>datetime64</option>
												<option value='category'>category</option>
												<option value='complex'>complex</option>
											</select>
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
				</DashboardWrapper>
			)}
		</Container>
	);
}

export default App;


