document.addEventListener("DOMContentLoaded", async () => {
  const activeBuildContainer = document.getElementById("active-build");
  const userPartsList = document.getElementById("user-parts-list");
  const missingPartsList = document.getElementById("missing-parts-list");
  const totalCostElement = document.getElementById("total-cost");

  async function fetchBuilderData() {
    try {
      const response = await fetch("/api/get-active-build");
      const data = await response.json();
      // Populate active build details
      const build = data.buildDetails;

      // sum over the required_quantity field in every element of data.requiredParts
      const totalParts = data.requiredParts.reduce(
        (acc, part) => acc + part.required_quantity,
        0
      );
      console.log(data);
      activeBuildContainer.innerHTML = `
          <div class="curr-build-details">
            <img src="${build.build_png}" alt="${build.build_name}" class="build-image" />
            <h3>${build.build_name}</h3>
            <p><strong>Rating:</strong> ${build.build_rating}</p>
            <p><strong>Release Year:</strong> ${build.build_release_year}</p>
            <p><strong>Age Rating:</strong> ${build.build_age_rating}</p>
            <p><strong>Total Parts:</strong> ${totalParts}</p>
          </div>
        `;

      // Populate user parts
      userPartsList.innerHTML = data.userInventory
        .map(
          (part) => `
              <div class="part-container">
                <img src="${part.part_png}" alt="${part.part_name}" class="part-image" />
                <div class="part-info">
                  <p><strong>Name:</strong> ${part.part_name}</p>
                  <p><strong>Color:</strong> ${part.part_color}</p>
                  <p><strong>Dimensions:</strong> ${part.part_dimensions}</p>
                  <p><strong>Quantity:</strong> ${part.user_quantity}</p>
                </div>
              </div>
            `
        )
        .join("");

      // Populate missing parts
      missingPartsList.innerHTML = data.missingParts
        .map(
          (part) => `
              <div class="part-container">
                <img src="${part.part_png}" alt="${part.part_name}" class="part-image" />
                <div class="part-info">
                  <p><strong>Name:</strong> ${part.part_name}</p>
                  <p><strong>Color:</strong> ${part.part_color}</p>
                  <p><strong>Dimensions:</strong> ${part.part_dimensions}</p>
                  <p><strong>Quantity:</strong> ${part.required_quantity}</p>
                  <p><strong>Price:</strong> $${part.lowest_price}</p>
                </div>
              </div>
            `
        )
        .join("");

      // Populate total cost
      totalCostElement.textContent = `Total Cost: $${data.totalCost}`;
    } catch (error) {
      console.error("Error fetching builder data:", error);
    }
  }

  fetchBuilderData();
});
