import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    // State variables
    const [aggregates, setAggregates] = useState([]);
    const [activityBranches, setActivityBranches] = useState([]);
    const [selectedAggregate, setSelectedAggregate] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [carbonFootprintData, setCarbonFootprintData] = useState([]);

    // Fetch metadata for aggregates and activity branches
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const aggregatesResponse = await axios.get('https://api.lasocietenouvelle.org/metadata/aggregates');
                const branchesResponse = await axios.get('https://api.lasocietenouvelle.org/metadata/branches');
                setAggregates(aggregatesResponse.data.meta);
                setActivityBranches(branchesResponse.data.meta);
            } catch (error) {
                console.error('Error fetching metadata:', error);
            }
        };

        fetchMetadata();
    }, []);


    // Fetch carbon footprint data based on selected aggregate and activity branch
    useEffect(() => {
        const fetchCarbonFootprintData = async () => {
            if (selectedAggregate && selectedBranch) {
                try {
                    const options = {method: 'GET', headers: {accept: 'application/json'}};

                    const response = await axios.get(`https://api.lasocietenouvelle.org/macrodata/macro_fpt_a38?indic=GHG&branch=${selectedBranch}&aggregate=${selectedAggregate}&area=FRA&currency=CPEUR`, options);
                    const data = response.data.data;
                    const years = data.map(entry => entry.year);
                    const values = data.map(entry => entry.value);
                    setCarbonFootprintData({ years, values });
                } catch (error) {
                    console.error('Error fetching carbon footprint data:', error);
                }
            }
        };

        fetchCarbonFootprintData();
    }, [selectedAggregate, selectedBranch]);


    // Event handlers for dropdown menu changes
    const handleAggregateChange = (event) => {
        setSelectedAggregate(event.target.value);
    };

    const handleBranchChange = (event) => {
        setSelectedBranch(event.target.value);
    };

// useEffect hook to render chart whenever carbonFootprintData changes
    useEffect(() => {
        // Function to render the chart
        const renderChart = () => {
            const ctx = document.getElementById('carbonFootprintChart').getContext('2d');

            // Check if there's an existing chart instance associated with the canvas
            const existingChart = Chart.getChart(ctx);
            if (existingChart) {
                existingChart.destroy(); // Destroy the existing chart
            }


            // Render the new chart
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: carbonFootprintData.years,
                    datasets: [{
                        label: 'Carbon Footprint Data',
                        data: carbonFootprintData.values,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'gCO2e/€',
                                font: {
                                    weight: 'bold',
                                    color: 'black',
                                    size: 18
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Year',
                                font: {
                                    weight: 'bold',
                                    color: 'black',
                                    size: 18
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        };

        renderChart(); // Call renderChart when carbonFootprintData changes
    }, [carbonFootprintData]); // Only carbonFootprintData is needed as a dependency


    return (
        <center>
            <div style={{maxHeight: '100vh'}}>
                <h1 className="my-3 fs-2 text-center text-uppercase">Courbes d'évolution</h1>
                <div className="card w-75 mx-0 my-auto">
                    <div className="card-body">
                        <div className="d-flex mb-5 mt-3">
                            <div className="mx-3 w-50 d-flex align-items-center">
                                <select id="aggregate" value={selectedAggregate} onChange={handleAggregateChange} className="form-select">
                                    <option value="">Select an aggregate</option>
                                    {aggregates.map((aggregate) => (
                                        <option key={aggregate.code} value={aggregate.code}>
                                            {aggregate.code} - {aggregate.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mx-3 w-50 d-flex align-items-center">
                                <select id="branch" value={selectedBranch} onChange={handleBranchChange} className="form-select">
                                    <option value="">Select an activity branch</option>
                                    {activityBranches.map((branch) => (
                                        <option key={branch.code} value={branch.code}>
                                            {branch.code} - {branch.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{width: '90%'}}>
                            <canvas id="carbonFootprintChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </center>
    );
};

export default App;