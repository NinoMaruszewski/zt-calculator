import * as Papa from "papaparse";
import { saveAs } from "file-saver";
const CSV = require("csv-string");
import "../css/styles.css";

// Create web worker:
const calcWorker = new Worker("./zt-calculator.js", { type: "module" });
calcWorker.onmessage = (e) => {
    console.log(e.data);
    window.ztResults =
        "Temperature,Resistivity,Seebeck,Thermal Conductivity,zT,max Red efficiency,s,u,Red efficiency,Phi,efficiency,ZT\n" +
        CSV.stringify(e.data);
    document.querySelector("#downloadCalculatedCSV").style.display = "";
};

// Button bindings:
const uploadCSVButton = document.querySelector("#CSVFile");
const pasteCSVButton = document.querySelector("#setCSVPaste");
const calcButton = document.querySelector("#calculate");
const downloadButton = document.querySelector("#downloadCalculatedCSV");

// eslint-disable-next-line no-unused-vars
uploadCSVButton.addEventListener("change", (_e) => {
    Papa.parse(uploadCSVButton.files[0], {
        complete: (results) => {
            window.numResults = cleanCSV(results.data);

            if (window.numResults.length) {
                showCSVPreview(window.numResults);
            } else {
                window.alert("Invalid CSV!");
            }
        },
        dynamicTyping: true,
        worker: true,
        skipEmptyLines: true,
    });
});

// eslint-disable-next-line no-unused-vars
pasteCSVButton.addEventListener("click", (_e) => {
    Papa.parse(document.getElementById("CSVText").value, {
        complete: (results) => {
            window.numResults = cleanCSV(results.data);

            if (window.numResults.length) {
                showCSVPreview(window.numResults);
            } else {
                window.alert("Invalid CSV!");
            }
        },
        dynamicTyping: true,
        worker: true,
        skipEmptyLines: false,
    });
});

// eslint-disable-next-line no-unused-vars
calcButton.addEventListener("click", (_e) => {
    calcWorker.postMessage(window.numResults);
});

// eslint-disable-next-line no-unused-vars
downloadButton.addEventListener("click", (_e) => {
    const blobCSV = new Blob([window.ztResults], {
        type: "text/plain;charset=utf-8",
    });
    saveAs(blobCSV, "calculatedZT.csv");
});

function showCSVPreview(parsedCSV) {
    document.getElementById("CSVPreview").innerHTML = JSON.stringify(
        parsedCSV.slice(0, 3),
        null,
        4
    );
}

function cleanCSV(parsedCSV) {
    // Empty list for clean CSV and error row listing:
    let numericResults = [];
    let errorRows = [];

    // Check for header row:
    if (parsedCSV[0].some(isNaN)) {
        parsedCSV.slice(1).forEach((row, index) => {
            if (!row.some(isNaN) && row.length === 4) {
                numericResults.push(row);
            } else {
                errorRows.push(index);
            }
        });
    } else {
        parsedCSV.forEach((row, index) => {
            if (!row.some(isNaN) && row.length === 4) {
                numericResults.push(row);
            } else {
                errorRows.push(index);
            }
        });
    }

    if (errorRows.length && numericResults.length) {
        window.alert(
            `You have errors on rows:\n${errorRows
                .map((element) => element + 1)
                .join(", ")}.\nThese rows have now been pruned from the CSV.`
        );
    }
    return numericResults;
}
