// ============================================
// TUTORIAL 8: STUDENT WORK FILE
// Complete the three library integration examples
// ============================================

import {
    handleAnimationError,
    getRestaurantCoordinates,
    handleMapError,
    handleChartError,
    createRestaurantCards,
    clearExistingMap,
    restaurants,
    clickToLoad
 } from './tutorial-support.js';

// Global variables for your library instances
let myChart = null;
let myMap = null;

// Wait for page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tutorial 8: Student work file ready!');
    
    // Set up your event listeners
    // Set up event listeners - note the arrow function to pass the button
    document.querySelector('#load-data-button').addEventListener('click', function(event) {
        clickToLoad(event.target); // Pass the button that was clicked
    });
    document.querySelector('#chart-button').addEventListener('click', createMyChart);
    document.querySelector('#map-button').addEventListener('click', createMyMap);
    document.querySelector('#animation-button').addEventListener('click', animateMyCards);
});

// ============================================
// EXAMPLE 1: CHART.JS
// ============================================

function createMyChart() {
    if (typeof Chart === 'undefined') {
        alert('Chart.js not available. Check console.');
        return;
    }

    if (restaurants.length === 0) {
        alert('No data loaded. Click "Load Data" first.');
        return;
    }

    const cuisineCounts = {};
    restaurants.forEach(function(restaurant) {
        const cuisine = restaurant.cuisine || 'Unknown';
        cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
    });

    const chartLabels = Object.keys(cuisineCounts);
    const chartData = Object.values(cuisineCounts);

    console.log('Chart data prepared:', { labels: chartLabels, data: chartData });

    try {
        const canvas = document.querySelector('#restaurant-chart');
        const ctx = canvas.getContext('2d');

        if (myChart) {
            myChart.destroy();
            myChart = null;
        }

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Number of Restaurants',
                    data: chartData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 205, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Restaurant Distribution by Cuisine Type'
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: true,
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 1,
                            precision: 0
                        },
                        title: {
                            display: true,
                            text: 'Number of Restaurants'
                        }
                    }
                }
            }
        });

        console.log('Chart created successfully!');
    } catch (error) {
        handleChartError(error);
    }
}

// ============================================
// EXAMPLE 2: LEAFLET.JS
// ============================================

function createMyMap() {
    if (typeof L === 'undefined') {
        alert('Leaflet.js not available. Check console.');
        return;
    }

    if (restaurants.length === 0) {
        alert('No data loaded. Click "Load Data" first.');
        return;
    }

    try {
        clearExistingMap();
        myMap = null;

        myMap = L.map('restaurant-map').setView([38.9897, -76.9378], 12);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(myMap);

        const restaurantsWithLocation = restaurants.filter(function(restaurant) {
            return restaurant.neighborhood && restaurant.neighborhood !== 'Unknown';
        });

        restaurantsWithLocation.forEach(function(restaurant, index) {
            const coords = getRestaurantCoordinates(restaurant, index);
            const marker = L.marker(coords);
            const popupContent = `
                <div style="text-align: center;">
                    <strong>${restaurant.name || 'Unknown Restaurant'}</strong><br>
                    <em>${restaurant.cuisine || 'Unknown'} cuisine</em><br>
                    Rating: ${restaurant.rating || 'N/A'}★<br>
                    <small>${restaurant.neighborhood || 'Unknown location'}</small>
                </div>
            `;
            marker.bindPopup(popupContent).addTo(myMap);
        });

        window.myMap = myMap;
        console.log(`Map created with ${restaurantsWithLocation.length} restaurants!`);
    } catch (error) {
        handleMapError(error);
    }
}

// ============================================
// EXAMPLE 3: GSAP
// ============================================

function animateMyCards() {
    if (typeof gsap === 'undefined') {
        alert('GSAP not available. Check console.');
        return;
    }

    if (restaurants.length === 0) {
        alert('No data loaded. Click "Load Data" first.');
        return;
    }

    try {
        createRestaurantCards();

        gsap.fromTo('.restaurant-card',
            {
                opacity: 0,
                scale: 0.8,
                y: 50
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.2,
                ease: 'back.out(1.7)'
            }
        );

        console.log('Animation created successfully!');
    } catch (error) {
        handleAnimationError(error);
    }
}

// ============================================
// DEBUGGING HELPERS (for your console)
// ============================================

function testMyWork() {
    console.log('Testing your implementations...');
    
    if (restaurants.length > 0) {
        console.log('Data loaded:', restaurants.length, 'restaurants');
        
        // Test each function
        console.log('Testing Chart.js...');
        createMyChart();
        
        setTimeout(() => {
            console.log('Testing Leaflet.js...');
            createMyMap();
            
            setTimeout(() => {
                console.log('Testing GSAP...');
                animateMyCards();
            }, 1000);
        }, 1000);
    } else {
        console.log('No restaurant data loaded. Make sure tutorial-support.js is included.');
    }
}

// Call testMyWork() in the console to test all your implementations