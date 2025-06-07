import init, { BlackScholesCalculator } from './pkg/black_scholes_calculator.js';

let calculator;
let pricesChart, deltaChart, gammaChart, thetaChart, vegaChart, rhoChart;
let callDistributionChart, putDistributionChart;

async function run() {
    await init();
    calculator = new BlackScholesCalculator();
    
    // Initialize charts
    initializeCharts();
    
    // Set up event listeners
    document.getElementById('calculate').addEventListener('click', calculate);
    document.getElementById('update-charts').addEventListener('click', updateCharts);
    document.getElementById('variable-select').addEventListener('change', onVariableChange);
    
    // Initialize range unit display
    onVariableChange();
    
    // Calculate on load
    calculate();
}

function initializeCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Variable'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Value'
                }
            }
        }
    };

    // Prices Chart
    pricesChart = new Chart(document.getElementById('pricesChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Call Price',
                data: [],
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1
            }, {
                label: 'Put Price',
                data: [],
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    title: {
                        display: true,
                        text: 'Option Price ($)'
                    }
                }
            }
        }
    });

    // Delta Chart
    deltaChart = new Chart(document.getElementById('deltaChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Call Delta',
                data: [],
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1
            }, {
                label: 'Put Delta',
                data: [],
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    title: {
                        display: true,
                        text: 'Delta'
                    }
                }
            }
        }
    });

    // Gamma Chart
    gammaChart = new Chart(document.getElementById('gammaChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Gamma',
                data: [],
                borderColor: '#9c27b0',
                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    title: {
                        display: true,
                        text: 'Gamma'
                    }
                }
            }
        }
    });

    // Theta Chart
    thetaChart = new Chart(document.getElementById('thetaChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Call Theta',
                data: [],
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.1
            }, {
                label: 'Put Theta',
                data: [],
                borderColor: '#ff5722',
                backgroundColor: 'rgba(255, 87, 34, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    title: {
                        display: true,
                        text: 'Theta (daily)'
                    }
                }
            }
        }
    });

    // Vega Chart
    vegaChart = new Chart(document.getElementById('vegaChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Vega',
                data: [],
                borderColor: '#ff9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    title: {
                        display: true,
                        text: 'Vega'
                    }
                }
            }
        }
    });

    // Rho Chart
    rhoChart = new Chart(document.getElementById('rhoChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Call Rho',
                data: [],
                borderColor: '#00bcd4',
                backgroundColor: 'rgba(0, 188, 212, 0.1)',
                tension: 0.1
            }, {
                label: 'Put Rho',
                data: [],
                borderColor: '#e91e63',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    title: {
                        display: true,
                        text: 'Rho'
                    }
                }
            }
        }
    });

    // Call Distribution Chart
    callDistributionChart = new Chart(document.getElementById('callDistributionChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Probability Density',
                data: [],
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.1,
                yAxisID: 'y',
                fill: true
            }, {
                label: 'Call Payoff',
                data: [],
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 3,
                tension: 0,
                yAxisID: 'y1',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                annotation: {
                    annotations: {
                        strike: {
                            type: 'line',
                            xMin: 0,
                            xMax: 0,
                            borderColor: 'rgba(255, 99, 132, 0.5)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: 'Strike',
                                position: 'start'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Stock Price at Maturity ($)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Probability Density'
                    },
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Option Payoff ($)'
                    },
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });

    // Put Distribution Chart
    putDistributionChart = new Chart(document.getElementById('putDistributionChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Probability Density',
                data: [],
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.1,
                yAxisID: 'y',
                fill: true
            }, {
                label: 'Put Payoff',
                data: [],
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                borderWidth: 3,
                tension: 0,
                yAxisID: 'y1',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                annotation: {
                    annotations: {
                        strike: {
                            type: 'line',
                            xMin: 0,
                            xMax: 0,
                            borderColor: 'rgba(255, 99, 132, 0.5)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: 'Strike',
                                position: 'start'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Stock Price at Maturity ($)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Probability Density'
                    },
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Option Payoff ($)'
                    },
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });
}

function calculate() {
    const spot = parseFloat(document.getElementById('spot').value);
    const strike = parseFloat(document.getElementById('strike').value);
    const volatility = parseFloat(document.getElementById('volatility').value) / 100;
    const rate = parseFloat(document.getElementById('rate').value) / 100;
    const maturity = parseFloat(document.getElementById('maturity').value);

    // Calculate option prices
    const prices = calculator.calculate_option_prices(spot, strike, rate, volatility, maturity);
    document.getElementById('call-price').textContent = `$${prices.call_price.toFixed(2)}`;
    document.getElementById('put-price').textContent = `$${prices.put_price.toFixed(2)}`;

    // Calculate Greeks
    const greeks = calculator.calculate_greeks(spot, strike, rate, volatility, maturity);
    displayGreeks(greeks);
    
    // Update distribution charts
    updateDistributionCharts(spot, strike, rate, volatility, maturity);

    // Update charts with current parameter as variable
    updateCharts();
}

function displayGreeks(greeks) {
    const greeksDisplay = document.getElementById('greeks-display');
    greeksDisplay.innerHTML = `
        <div class="greek-item">
            <h4>Call Delta</h4>
            <p>${greeks.delta_call.toFixed(4)}</p>
        </div>
        <div class="greek-item">
            <h4>Put Delta</h4>
            <p>${greeks.delta_put.toFixed(4)}</p>
        </div>
        <div class="greek-item">
            <h4>Gamma</h4>
            <p>${greeks.gamma.toFixed(4)}</p>
        </div>
        <div class="greek-item">
            <h4>Call Theta</h4>
            <p>${greeks.theta_call.toFixed(4)}</p>
        </div>
        <div class="greek-item">
            <h4>Put Theta</h4>
            <p>${greeks.theta_put.toFixed(4)}</p>
        </div>
        <div class="greek-item">
            <h4>Vega</h4>
            <p>${greeks.vega.toFixed(4)}</p>
        </div>
        <div class="greek-item">
            <h4>Call Rho</h4>
            <p>${greeks.rho_call.toFixed(4)}</p>
        </div>
        <div class="greek-item">
            <h4>Put Rho</h4>
            <p>${greeks.rho_put.toFixed(4)}</p>
        </div>
    `;
}

function updateDistributionCharts(spot, strike, rate, volatility, maturity) {
    // Get distribution data
    const distributionData = calculator.calculate_distribution(
        spot, strike, rate, volatility, maturity, 200
    );
    
    // Format labels
    const labels = distributionData.stock_prices.map(price => price.toFixed(2));
    
    // Update Call Distribution Chart
    callDistributionChart.data.labels = labels;
    callDistributionChart.data.datasets[0].data = distributionData.probabilities;
    callDistributionChart.data.datasets[1].data = distributionData.call_payoffs;
    
    // Update strike line position
    const strikeIndex = distributionData.stock_prices.findIndex(price => price >= strike);
    if (callDistributionChart.options.plugins.annotation) {
        callDistributionChart.options.plugins.annotation.annotations.strike.xMin = strikeIndex;
        callDistributionChart.options.plugins.annotation.annotations.strike.xMax = strikeIndex;
    }
    
    callDistributionChart.update();
    
    // Update Put Distribution Chart
    putDistributionChart.data.labels = labels;
    putDistributionChart.data.datasets[0].data = distributionData.probabilities;
    putDistributionChart.data.datasets[1].data = distributionData.put_payoffs;
    
    // Update strike line position
    if (putDistributionChart.options.plugins.annotation) {
        putDistributionChart.options.plugins.annotation.annotations.strike.xMin = strikeIndex;
        putDistributionChart.options.plugins.annotation.annotations.strike.xMax = strikeIndex;
    }
    
    putDistributionChart.update();
}

function onVariableChange() {
    const variable = document.getElementById('variable-select').value;
    const rangeUnit = document.getElementById('range-unit');
    
    switch(variable) {
        case 'spot':
        case 'strike':
            rangeUnit.textContent = '$';
            break;
        case 'volatility':
        case 'rate':
            rangeUnit.textContent = '%';
            break;
        case 'maturity':
            rangeUnit.textContent = 'years';
            break;
    }
}

function updateCharts() {
    const spot = parseFloat(document.getElementById('spot').value);
    const strike = parseFloat(document.getElementById('strike').value);
    const volatility = parseFloat(document.getElementById('volatility').value) / 100;
    const rate = parseFloat(document.getElementById('rate').value) / 100;
    const maturity = parseFloat(document.getElementById('maturity').value);
    
    const variable = document.getElementById('variable-select').value;
    const range = parseFloat(document.getElementById('range-input').value);
    const steps = 50;

    // Get parameter sweep data
    const sweepData = calculator.parameter_sweep(
        spot, strike, rate, volatility, maturity,
        variable, range, steps
    );

    // Format x-axis labels
    let xLabels = sweepData.x_values.map(v => v.toFixed(2));
    let xAxisLabel = '';
    
    switch(variable) {
        case 'spot':
            xAxisLabel = 'Spot Price ($)';
            break;
        case 'strike':
            xAxisLabel = 'Strike Price ($)';
            break;
        case 'volatility':
            xAxisLabel = 'Volatility (%)';
            break;
        case 'rate':
            xAxisLabel = 'Interest Rate (%)';
            break;
        case 'maturity':
            xAxisLabel = 'Time to Maturity (years)';
            break;
    }

    // Update all chart x-axis labels
    const charts = [pricesChart, deltaChart, gammaChart, thetaChart, vegaChart, rhoChart];
    charts.forEach(chart => {
        chart.options.scales.x.title.text = xAxisLabel;
    });

    // Update Prices Chart
    pricesChart.data.labels = xLabels;
    pricesChart.data.datasets[0].data = sweepData.call_prices;
    pricesChart.data.datasets[1].data = sweepData.put_prices;
    pricesChart.update();

    // Update Delta Chart
    deltaChart.data.labels = xLabels;
    deltaChart.data.datasets[0].data = sweepData.delta_calls;
    deltaChart.data.datasets[1].data = sweepData.delta_puts;
    deltaChart.update();

    // Update Gamma Chart
    gammaChart.data.labels = xLabels;
    gammaChart.data.datasets[0].data = sweepData.gammas;
    gammaChart.update();

    // Update Theta Chart
    thetaChart.data.labels = xLabels;
    thetaChart.data.datasets[0].data = sweepData.theta_calls;
    thetaChart.data.datasets[1].data = sweepData.theta_puts;
    thetaChart.update();

    // Update Vega Chart
    vegaChart.data.labels = xLabels;
    vegaChart.data.datasets[0].data = sweepData.vegas;
    vegaChart.update();

    // Update Rho Chart
    rhoChart.data.labels = xLabels;
    rhoChart.data.datasets[0].data = sweepData.rho_calls;
    rhoChart.data.datasets[1].data = sweepData.rho_puts;
    rhoChart.update();
}

run();