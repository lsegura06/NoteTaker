const express = require("express");
const app = express();
const PORT = 3001;
const path = require("path");
const uniqid = require("uniqid");
const fs = require("fs");
const util = require("util");

const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) => {
        if (err) console.error(err);
        else console.info(`\nData written to ${destination}`);
    });

const readAndAppend = (content, file) => {
    fs.readFile(file, "utf8", (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeToFile(file, parsedData);
        }
    });
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/notes", (req, res) =>
    res.sendFile(path.join(__dirname, "./public/notes.html"))
);

app.get("/api/notes", (req, res) => {
    readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

app.post("/api/notes", (req, res) => {
    console.info(`${req.method} request received to add note`);
    const { title, text } = req.body;
    if (req.body) {
        const newNote = {
            title,
            text,
            id: uniqid(),
        };
        readAndAppend(newNote, "./db/db.json");
        res.json(`added successfully `);
    } else {
        res.error("Error in adding note");
    }
});

app.delete("/api/notes/:id", (req, res) => {
    console.info(`${req.method} request received to delete note`);
    fs.readFile("./db/db.json", "utf8", (err, data) => {
        let myArray = JSON.parse(data);
        const deleteID = req.params.id;
        const deleteData = myArray.filter((myArrayAaron) => myArrayAaron.id !== deleteID);
        writeToFile("./db/db.json", deleteData);
        res.json(`Removed! ${deleteID}`);
    });
});

app.listen(PORT, () => console.info(`Server listening on port ${PORT}`));
