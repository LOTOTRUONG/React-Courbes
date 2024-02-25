import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

const LineChart = () => {
    // State variables
    const [aggregates, setAggregates] = useState([]);
    const [activityBranches, setActivityBranches] = useState([]);
    const [selectedAggregate, setSelectedAggregate] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [carbonFootprintData, setCarbonFootprintData] = useState([]);
    const [error, setError] = useState(null);

    // Fetch metadata for aggregates and activity branches
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [aggregatesResponse, branchesResponse] = await Promise.all([
                    axios.get('https://api.lasocietenouvelle.org/metadata/aggregates'),
                    axios.get('https://api.lasocietenouvelle.org/metadata/branches')
                ]);
                setAggregates(aggregatesResponse.data.meta);
                setActivityBranches(branchesResponse.data.meta);
            } catch (error) {
                console.error('Error fetching metadata:', error);
                setError('Failed to fetch metadata');
            }
        };

        fetchMetadata();
    }, []);

    // Fetch carbon footprint data based on selected aggregate and activity branch
    const fetchCarbonFootprintData = async () => {
        if (selectedAggregate && selectedBranch) {
            try {
                const response = await axios.get(`https://api.lasocietenouvelle.org/macrodata/macro_fpt_a38?indic=HAZ&branch=${selectedBranch}&aggregate=${selectedAggregate}&area=FRA&currency=CPEUR`);
                setCarbonFootprintData(response.data);
            } catch (error) {
                console.error('Error fetching carbon footprint data:', error);
                setError('Failed to fetch carbon footprint data');
            }
        }
    };

    // Function to render the chart
    useEffect(() => {
        if (carbonFootprintData.length > 0) {
            renderChart();
        }
    }, [carbonFootprintData]);

    const handleSubmit = () => {
        fetchCarbonFootprintData();
    };

    const renderChart = () => {
        const ctx = document.getElementById('carbonFootprintChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: carbonFootprintData.map(entry => entry.year),
                datasets: [{
                    label: 'Carbon Footprint Data',
                    data: carbonFootprintData.map(entry => entry.value),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1
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
                                color: 'black'
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year',
                            font: {
                                weight: 'bold',
                                color: 'black'
                            }
                        }
                    }
                }
            }
        });
    };

    // Event handlers for dropdown menu changes
    const handleAggregateChange = (event) => {
        setSelectedAggregate(event.target.value);
    };

    const handleBranchChange = (event) => {
        setSelectedBranch(event.target.value);
    };

    return (
        <center>
            <div className="container">
                <h1>Courbes d'évolution</h1>
                <div className="dropdowns">
                    <div className="dropdown">
                        <select id="aggregate" value={selectedAggregate} onChange={handleAggregateChange}>
                            <option value="">Select an aggregate</option>
                            {aggregates.map((aggregate) => (
                                <option key={aggregate.code} value={aggregate.code}>
                                    {aggregate.label} - {aggregate.code}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown">
                        <select id="branch" value={selectedBranch} onChange={handleBranchChange}>
                            <option value="">Select an activity branch</option>
                            {activityBranches.map((branch) => (
                                <option key={branch.code} value={branch.code}>
                                    {branch.label} - {branch.code}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <button onClick={handleSubmit} disabled={!selectedAggregate || !selectedBranch}>Submit</button>
                {error && <div className="error">{error}</div>}
                <canvas id="carbonFootprintChart"></canvas>
            </div>
        </center>
    );
};

export default LineChart;
