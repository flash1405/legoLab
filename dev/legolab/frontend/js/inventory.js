document.addEventListener("DOMContentLoaded", async () => {
  const userId = sessionStorage.getItem("user_id");
  const inventoryContainer = document.getElementById("inventory-container");

  try {
    const response = await fetch(`/inventory?user_id=${userId}`);
    const inventory = await response.json();

    if (response.ok) {
      inventoryContainer.innerHTML = "";
      inventory.forEach((item) => {
        const inventoryItem = document.createElement("div");
        inventoryItem.classList.add("inventory-item");

        png_url = item.part_png ? item.part_png : "./images/part1.png";
        inventoryItem.innerHTML = `
                    <img src=${png_url} alt="LEGO Part Image" class="part-image">
                    <div class="part-details">
                        <p>${item.part_name}</p>
                        <p>Color: ${item.part_color}</p>
                        <p>Quantity: ${item.part_quantity}</p>
                    </div>
                    <div class="favorite-section">
                        Favorite
                        <span class="favorite-icon">★</span> 
                    </div>
                `;
        inventoryContainer.appendChild(inventoryItem);
      });
    } else {
      inventoryContainer.innerHTML =
        "<p>Failed to load inventory. Please try again later.</p>";
    }
  } catch (error) {
    console.error("Error loading inventory:", error);
    inventoryContainer.innerHTML =
      "<p>Error loading inventory. Please try again later.</p>";
  }
});
