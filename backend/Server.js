const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/reverse-geocode', async (req, res) => {
    const { lat, lng } = req.query;

    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${lat},${lng}`,
                key: apiKey,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error("Geocoding Error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });

        res.status(500).json({
            message: 'Error fetching location data',
            error: {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            },
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
