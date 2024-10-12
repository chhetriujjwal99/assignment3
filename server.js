/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Ujjwal Chhetri
*  Student ID: 158798223
*  Date: 2024/10/11
********************************************************************************/

const express = require("express");
const legoData = require("./modules/legoSets");
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;
const Sequelize = require('sequelize'); // Assuming this is needed for legoData initialization

// Serve static files
app.use(express.static(path.join(__dirname, '/public')));

// Set views directory for rendering HTML files
app.set('views', path.join(__dirname, '/views'));

// Initialize the Lego data and start the server
legoData.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is up and running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to initialize lego data: ", error);
});

// Home route - serving home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/home.html'));
});

// About route - serving about page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

// Fetch all Lego sets or filter by theme
app.get('/lego/sets', async (req, res) => {
    try {
        const theme = req.query.theme;
        const sets = await legoData.getAllSets();

        if (theme) {
            const filteredSets = sets.filter(set => set.theme.toLowerCase() === theme.toLowerCase());
            if (filteredSets.length > 0) {
                res.json(filteredSets);
            } else {
                res.status(404).send(`No Lego sets found for theme: ${theme}`);
            }
        } else {
            res.json(sets);
        }
    } catch (error) {
        console.error("Error fetching Lego sets: ", error);
        res.status(500).send('Internal server error');
    }
});

// Fetch a specific Lego set by set number
app.get('/lego/sets/:set_num', async (req, res) => {
    try {
        const setNum = req.params.set_num;
        const sets = await legoData.getAllSets();
        const set = sets.find(s => s.set_num === setNum);

        if (set) {
            res.json(set);
        } else {
            res.status(404).send(`Lego set with number ${setNum} not found.`);
        }
    } catch (error) {
        console.error("Error fetching Lego set: ", error);
        res.status(500).send('Internal server error');
    }
});

// Directory listing route
app.get("/files", (req, res) => {
    const directoryPath = path.join(__dirname, "data");

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error("Error reading directory: ", err);
            return res.status(500).send("Unable to scan directory");
        }
        res.json(files);
    });
});

// Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
});
