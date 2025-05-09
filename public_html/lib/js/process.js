const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const selectedFileName = document.getElementById("selectedFileName");
const statistics = document.getElementById("statistics");
const durationEl = document.getElementById("duration");
const filamentWeightEl = document.getElementById("filamentWeight");
const loader = document.getElementById("loader");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const processBtn = document.getElementById("processBtn");
const loopCountInput = document.getElementById("loopCount");
let selectedFile = null;
let baseStatistics = null;

// Toast notification
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = isError ? "show error" : "show";
  setTimeout(() => (toast.className = ""), 3000);
}

// Validate file input
function validateFile(file) {
  if (!file.name.endsWith(".3mf")) {
    showToast("Only .3mf files are supported.", true);
    return false;
  }
  if (file.size > 15 * 1024 * 1024) {
    showToast("File size must be less than 15 MB.", true);
    return false;
  }
  return true;
}

// Format seconds to readable duration
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
}

// Update statistics
function updateStatistics(loopCount) {
  if (!baseStatistics) return;
  durationEl.textContent = formatDuration(baseStatistics.duration * loopCount);
  filamentWeightEl.textContent = `${(
    baseStatistics.filamentWeight * loopCount
  ).toFixed(1)}g`;
}

// Extract statistics
function extractStatistics(gcode) {
  let duration = 14250;
  let filamentWeight = 115.6;

  gcode.split("\n").forEach((line) => {
    if (line.includes("; total estimated time:")) {
      const match = line.match(/total estimated time: (\d+)m (\d+)s/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        duration = minutes * 60 + seconds;
      }
    }
    if (line.includes("; total filament weight [g] :")) {
      const match = line.match(/total filament weight \[g\] : ([\d.]+)/);
      if (match) {
        filamentWeight = parseFloat(match[1]);
      }
    }
  });

  return { duration, filamentWeight };
}

// Handle G-code multiplication
function multiplyGcode(gcode, loopCount) {
  const trimmed = gcode.trim();
  return Array(loopCount).fill(trimmed).join("\n");
}

// Trigger file download
function triggerDownload(blob, filename) {
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;
  downloadLink.click();
}

// Handle selected file
async function handleFile(file) {
  if (!validateFile(file)) return;
  selectedFile = file;
  selectedFileName.textContent = `Selected: ${file.name}`;
  showToast(`File "${file.name}" selected.`);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const metaFiles = Object.keys(zip.files).filter((name) =>
      name.match(/^Metadata\/plate_.*\.gcode$/)
    );
    if (metaFiles.length !== 1) {
      statistics.style.display = "none";
      showToast("No valid G-code file found inside 3MF.", true);
      return;
    }
    const gcode = await zip.files[metaFiles[0]].async("string");
    baseStatistics = extractStatistics(gcode);
    updateStatistics(parseInt(loopCountInput.value));
    statistics.style.display = "block";
  } catch (error) {
    showToast("Error extracting statistics.", true);
    statistics.style.display = "none";
  }
}

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.style.background = "#d3550020";
});

dropzone.addEventListener("dragleave", () => {
  dropzone.style.background = "#d355000d";
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.style.background = "#d355000d";
  handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    handleFile(fileInput.files[0]);
  }
  fileInput.value = "";
});

loopCountInput.addEventListener("input", () => {
  const loopCount = parseInt(loopCountInput.value) || 1;
  updateStatistics(loopCount);
});

// Process and download
async function processFile() {
  if (!selectedFile) {
    showToast("No file selected.", true);
    return;
  }

  const loopCount = parseInt(document.getElementById("loopCount").value);
  let outputName = document.getElementById("outputName").value.trim();
  if (!outputName) {
    outputName =
      selectedFile.name.replace(/\.3mf$/i, "") + `_loop_${loopCount}`;
  }

  if (loopCount < 1 || loopCount > 100) {
    showToast("Loop count must be between 1 and 100.", true);
    return;
  }

  const estimatedOutputSize = selectedFile.size * loopCount;
  if (estimatedOutputSize > 150 * 1024 * 1024) {
    showToast("Output file may exceed 150 MB. Reduce loop count.", true);
    return;
  }

  const startTime = performance.now();

  try {
    processBtn.classList.add("disabled");
    loader.style.display = "block";
    progressBar.style.width = "0%";
    progressText.textContent = "0%";

    const arrayBuffer = await selectedFile.arrayBuffer();
    progressBar.style.width = "20%";
    progressText.textContent = "20%";

    const zip = await JSZip.loadAsync(arrayBuffer);
    progressBar.style.width = "40%";
    progressText.textContent = "40%";

    const metaFiles = Object.keys(zip.files).filter((name) =>
      name.match(/^Metadata\/plate_.*\.gcode$/)
    );
    if (metaFiles.length !== 1) {
      showToast("No valid G-code file found inside 3MF.", true);
      return;
    }

    const gcodePath = metaFiles[0];
    const originalGcode = await zip.files[gcodePath].async("string");

    progressBar.style.width = "60%";
    progressText.textContent = "60%";

    const repeatedGcode = multiplyGcode(originalGcode, loopCount);
    zip.file(gcodePath, repeatedGcode);

    progressBar.style.width = "80%";
    progressText.textContent = "80%";

    const newZip = await zip.generateAsync({ type: "blob" });

    progressBar.style.width = "100%";
    progressText.textContent = "100%";

    triggerDownload(newZip, `${outputName}.3mf`);
    showToast("File processed and downloaded successfully!");

    const endTime = performance.now();
    console.log(
      `File Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(
      `Processing Time: ${((endTime - startTime) / 1000).toFixed(2)} s`
    );

    fileInput.value = "";
    selectedFile = null;
    baseStatistics = null;
    selectedFileName.textContent = "";
    loopCountInput.value = 1;
    document.getElementById("outputName").value = "";
    statistics.style.display = "none";
    progressBar.style.width = "0%";
    progressText.textContent = "0%";
  } catch (error) {
    console.error(error);
    showToast(`Error processing the file: ${error.message}`, true);
  } finally {
    setTimeout(() => {
      loader.style.display = "none";
    }, 500);
    processBtn.classList.remove("disabled");
  }
}
