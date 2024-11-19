// Replace with the user ID from your session or authentication logic
const userId = "1";

// Fetch all parts from the backend and render them
async function fetchAndRenderParts() {
  console.log("here");
  const response = await fetch(
    `/parts/?name=${document.getElementById("search-input").textContent}`
  );
  const parts = await response.json();

  const partsList = document.getElementById("parts-list");
  partsList.innerHTML = ""; // Clear existing parts

  parts.forEach((part) => {
    const partItem = document.createElement("div");
    partItem.classList.add("part-item");
    const partImage =
      part.part_png && part.part_png.trim() !== ""
        ? part.part_png
        : "../images/part1.png";
    partItem.innerHTML = `
            <img src="${partImage}" alt="LEGO Part Image" class="part-image">
            <div class="part-details">
                <p>Name: ${part.part_name}</p>
                <p>Color: ${part.part_color}</p>
                <p>Dimensions: ${part.part_dimensions}</p>
            </div>
            <div class="add-section">
                <input type="number" min="1" placeholder="Quantity" class="quantity-input" id="quantity-${part.part_id}-${part.part_color}">
                <button class="add-btn" onclick="addToInventory('${part.part_id}', '${part.part_color}')">Add to Inventory</button>
            </div>
        `;
    partsList.appendChild(partItem);
  });
}

// Add part to user's inventory
async function addToInventory(partId, partColor) {
  const quantityInput = document.getElementById(
    `quantity-${partId}-${partColor}`
  );
  const quantity = parseInt(quantityInput.value);

  if (!quantity || quantity <= 0) {
    alert("Please enter a valid quantity.");
    return;
  }

  const response = await fetch("/inventory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
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

// Fetch and render parts on page load
fetchAndRenderParts();
