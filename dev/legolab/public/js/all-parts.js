document.addEventListener("DOMContentLoaded", () => {
  const partsContainer = document.getElementById("parts-container");
  const paginationControls = document.getElementById("pagination-controls");
  const searchButton = document.getElementById("search-btn");
  const partNameInput = document.getElementById("part-name");
  const partColorInput = document.getElementById("part-color");
  const pageInfo = document.getElementById("page-info");
  const nextPageButton = document.getElementById("next-page");
  const prevPageButton = document.getElementById("prev-page");
  const themeSelect = document.getElementById("theme-select");

  let currentPage = 1;
  // Fetch and display parts
  async function fetchParts(page = 1) {
    const partName = partNameInput.value.trim();
    const partColor = partColorInput.value.trim();
    const queryParams = new URLSearchParams({
      page,
      name: partName,
      color: partColor,
    });

    try {
      //   console.log(queryParams.toString());
      const response = await fetch(`api/all-parts?${queryParams.toString()}`);
      const data = await response.json();

      // Render parts
      partsContainer.innerHTML = "";
      if (data.parts.length === 0) {
        partsContainer.innerHTML = "<p>No parts found.</p>";
      } else {
        data.parts.forEach((part) => {
          const partDiv = document.createElement("div");
          partDiv.className = `inventory-item`;
          partDiv.innerHTML = `
                    <div class="inventory-item-2">
                        <img
                            src=${part.part_png || "images/part1.png"}
                            alt=${part.part_name}
                            class="part-image"
                        />
                        <div class="part-details">
                        <p><strong>Name:</strong> ${part.part_name}</p>
                        <p><strong>Color:</strong> ${part.part_color}</p>
                        <p><strong>Dimension:</strong> ${
                          part.part_dimensions
                        }</p>
                        </div>
                    </div>
                    <div>
                        <input type="number" min="1" placeholder="Quantity" class="quantity-input" id="quantity-${
                          part.part_id
                        }-${part.part_color}">
                        <button class="add-btn" onclick="addToInventory('${
                          part.part_id
                        }', '${part.part_color}')">Add to Inventory</button>
                    </div>
                    `;
          partsContainer.appendChild(partDiv);
        });
        pageInfo.textContent = `Page ${data.page} of ${data.pages}`;
      }

      // Render pagination controls
      //   renderPagination(data.page, data.pages);
      prevPageButton.disabled = data.page === 1;
      nextPageButton.disabled = data.page === data.pages;
    } catch (error) {
      console.error("Error fetching parts:", error);
    }
  }

  //   // Render pagination controls
  //   function renderPagination(current, total) {
  //     for (let i = 1; i <= total; i++) {
  //       const button = document.createElement("button");
  //       button.textContent = i;
  //       button.className = i === current ? "active" : "";
  //       button.addEventListener("click", () => fetchParts(i));
  //       paginationControls.appendChild(button);
  //     }
  //   }

  // Search button click handler
  searchButton.addEventListener("click", () => {
    currentPage = 1;
    fetchParts(currentPage);
  });

  nextPageButton.addEventListener("click", () => {
    currentPage += 1;
    fetchParts(currentPage);
  });

  prevPageButton.addEventListener("click", () => {
    currentPage -= 1;
    fetchParts(currentPage);
  });

  // Initial fetch
  fetchParts();

  const partImageInput = document.getElementById("image-input");
  const quantityInput = document.getElementById("quantity-input");
  const submitUploadBtn = document.getElementById("submit-upload-btn");
  const partImagePreview = document.getElementById("upload-part-image");

  partImageInput.addEventListener("change", () => {
    partImagePreview.src = URL.createObjectURL(partImageInput.files[0]);
  });

  submitUploadBtn.addEventListener("click", async () => {
    const imageFile = partImageInput.files[0];
    const quantity = parseInt(quantityInput.value);

    if (!imageFile || !quantity) {
      alert("Please select an image and enter a quantity.");
      return;
    }

    const partId = await getPartIdFromImage(imageFile);
    if (partId) {
      addPartToInventory(partId, quantity);
    }
  });

  // Fetch part ID from image using API
  const getPartIdFromImage = async (imageFile) => {
    try {
      console.log("Image - ", imageFile);
      const formData = new FormData();
      formData.append("image", imageFile, imageFile.name);
      const response = await fetch("/api/upload-to-brickognize", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        // More detailed error logging
        console.error("Full response:", await response.text());
        console.error(`HTTP Error: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      if (data && data.items && data.items.length > 0) {
        return data.items[0].id; // Return the first part id from the API response
      }
      alert("No part found.");
    } catch (error) {
      console.error("Error getting part ID:", error);
    }
  };

  // Add part to inventory
  const addPartToInventory = async (partId, quantity) => {
    try {
      const response = await fetch("/api/add-to-inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ part_id: partId, quantity }),
      });

      if (response.ok) {
        alert("Part added to inventory");
      } else {
        alert("Failed to add part to inventory");
      }
    } catch (error) {
      console.error("Error adding part to inventory:", error);
    }
  };

  const colorSelect = document.getElementById("color-select");

  const loadColors = async () => {
    try {
      const response = await fetch("/api/get-colors"); // API endpoint to fetch colors
      const data = await response.json();
      data.colors.forEach((color) => {
        const option = document.createElement("option");
        option.value = color;
        option.textContent = color;
        colorSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  // Call this function when the page loads
  loadColors();
});

async function addToInventory(partId, partColor) {
  console.log("Adding to inventory");
  const quantityInput = document.getElementById(
    `quantity-${partId}-${partColor}`
  );
  const quantity = parseInt(quantityInput.value);

  if (!quantity || quantity <= 0) {
    alert("Please enter a valid quantity.");
    return;
  }

  const response = await fetch("/api/add-to-inventory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      part_id: partId,
      part_color: partColor,
      part_quantity: quantity,
    }),
  });

  if (response.ok) {
    alert("Part added to inventory successfully!");
  } else {
    alert("Failed to add part to inventory.");
  }
}
