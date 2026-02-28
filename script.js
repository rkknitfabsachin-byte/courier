document.addEventListener("DOMContentLoaded", () => {
    // CONFIGURATION: Ensure you use the exact Web App URL from Google Apps Script
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw3ZOr-wcHWJjpxiXoLGj1TxS-XwBGJEz1rhJfyOW44GAEmwxbS0om6RmHfb5dimwol/exec";

    const form = document.getElementById("courierForm");
    const fileInput = document.getElementById("courierImage");
    const uploadWrapper = document.getElementById("uploadWrapper");
    const previewContainer = document.getElementById("previewContainer");
    const imagePreview = document.getElementById("imagePreview");
    const removeImageBtn = document.getElementById("removeImageBtn");

    const submitBtn = document.getElementById("submitBtn");
    const btnText = submitBtn.querySelector(".btn-text");
    const btnSpinner = document.getElementById("btnSpinner");
    const statusMessage = document.getElementById("statusMessage");
    const loadingOverlay = document.getElementById("loadingOverlay");

    const handlerSelect = document.getElementById("handlerName");
    const locationSelect = document.getElementById("location");

    let base64ImageData = null;

    // Set today's date automatically
    const dateInput = document.getElementById("dateOnCourier");
    dateInput.valueAsDate = new Date();

    // 1. Fetch Master Data from Google Sheets
    async function fetchMasterData() {
        if (!SCRIPT_URL.includes("/exec")) return;

        loadingOverlay.style.display = "flex";
        try {
            // doGet(e) returns the master data
            const response = await fetch(SCRIPT_URL);
            const data = await response.json();

            if (data.error) {
                showStatus("Error loading master data: " + data.error, "error");
                return;
            }

            populateDropdown(handlerSelect, data.handlers);
            populateDropdown(locationSelect, data.locations);

        } catch (error) {
            console.error("Fetch error:", error);
            showStatus("Could not fetch Master Data. Check your Apps Script deployment and permissions.", "error");
        } finally {
            loadingOverlay.style.display = "none";
        }
    }

    function populateDropdown(selectElement, options) {
        // Preserve the first (disabled) option
        const firstOption = selectElement.options[0];
        selectElement.innerHTML = '';
        selectElement.appendChild(firstOption);

        if (options && options.length) {
            options.forEach(opt => {
                const o = document.createElement("option");
                o.value = opt;
                o.textContent = opt;
                selectElement.appendChild(o);
            });
        }
    }

    // Initial Data Fetch
    fetchMasterData();

    // --- Image Handling ---
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showStatus('Invalid file type. Please select an image.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            base64ImageData = reader.result;
            imagePreview.src = base64ImageData;
            previewContainer.style.display = 'block';
        };
    }

    removeImageBtn.addEventListener('click', () => {
        base64ImageData = null;
        fileInput.value = '';
        previewContainer.style.display = 'none';
    });

    // --- Form Submission ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!form.checkValidity() || !base64ImageData) {
            if (!base64ImageData) {
                showStatus('Please capture or upload a photo.', 'error');
            } else {
                form.reportValidity();
            }
            return;
        }

        const formData = new FormData(form);
        const dataObj = {
            dateOnCourier: formData.get("dateOnCourier"),
            partyName: formData.get("partyName"),
            handlerName: formData.get("handlerName"),
            location: formData.get("location"),
            aboutCourier: formData.get("aboutCourier"),
            imageBase64: base64ImageData
        };

        setLoading(true);

        try {
            // Use no-cors for the POST request to avoid CORS issues from browser to Apps Script
            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify(dataObj)
            });

            showStatus("Courier entry logged successfully!", "success");
            form.reset();
            dateInput.valueAsDate = new Date();
            base64ImageData = null;
            previewContainer.style.display = 'none';
        } catch (error) {
            console.error(error);
            showStatus("Submission failed. Check your network or Apps Script setup.", "error");
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        btnText.style.display = isLoading ? "none" : "block";
        btnSpinner.style.display = isLoading ? "block" : "none";
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-box ${type}`;
        statusMessage.style.display = "block";
        if (type === 'success') {
            setTimeout(() => statusMessage.style.display = "none", 5000);
        }
    }
});
