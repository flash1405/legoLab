document.addEventListener("DOMContentLoaded", () => {
  const buildsContainer = document.getElementById("builds-container");
  const paginationControls = document.getElementById("pagination-controls");
  const searchButton = document.getElementById("search-btn");
  const buildNameInput = document.getElementById("build-name");
  const buildThemeInput = document.getElementById("build-theme");
  const pageInfo = document.getElementById("page-info");
  const nextPageButton = document.getElementById("next-page");
  const prevPageButton = document.getElementById("prev-page");

  let currentPage = 1;

  // Fetch and display builds
  async function fetchBuilds(page = 1) {
    const buildName = buildNameInput.value.trim();
    const buildTheme = buildThemeInput.value.trim();
    const queryParams = new URLSearchParams({
      page,
      name: buildName,
      theme: buildTheme,
    });

    try {
      const response = await fetch(`/api/all-builds?${queryParams.toString()}`);
      const data = await response.json();

      // Render builds
      buildsContainer.innerHTML = "";
      if (data.builds.length === 0) {
        buildsContainer.innerHTML = "<p>No builds found.</p>";
      } else {
        data.builds.forEach((build) => {
          const buildDiv = document.createElement("div");
          buildDiv.className = "inventory-item";
          buildDiv.innerHTML = `
              <div class="inventory-item-2">
                <img
                            src=${build.build_png || "images/build1.png"}
                            alt=${build.build_name}
                            class="build-image"
                        />
                <div class="part-details">
                <p><strong>Name:</strong> ${build.build_name}</p>
                <p><strong>Rating:</strong> ${build.build_rating}</p>
                <p><strong>Theme:</strong> ${build.themes}</p>
                </div>
                <div class="part-details">
                <p><strong>Release Year:</strong> ${
                  build.build_release_year
                }</p>
                <p><strong>Age Rating:</strong> ${build.build_age_rating}</p>
                </div>
              </div>
                <button class="view-button" onclick="selectBuild('${
                  build.build_id
                }')">Select Build</button>
            `;
          buildsContainer.appendChild(buildDiv);
        });
        pageInfo.textContent = `Page ${data.page} of ${data.pages}`;
      }

      // Enable/Disable pagination buttons
      prevPageButton.disabled = data.page === 1;
      nextPageButton.disabled = data.page === data.pages;
    } catch (error) {
      console.error("Error fetching builds:", error);
    }
  }

  // Search button click handler
  searchButton.addEventListener("click", () => {
    currentPage = 1;
    fetchBuilds(currentPage);
  });

  // Pagination handling
  nextPageButton.addEventListener("click", () => {
    currentPage += 1;
    fetchBuilds(currentPage);
  });

  prevPageButton.addEventListener("click", () => {
    currentPage -= 1;
    fetchBuilds(currentPage);
  });

  // Initial fetch
  fetchBuilds();

  async function loadThemes() {
    try {
      const response = await fetch("/api/get-themes");
      const data = await response.json();
      data.themes.forEach((theme) => {
        const option = document.createElement("option");
        option.value = theme;
        option.textContent = theme;
        buildThemeInput.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading themes:", error);
    }
  }

  loadThemes();
});

async function selectBuild(buildId) {
  try {
    console.log("Setting active build to", String(buildId));
    const queryParams = new URLSearchParams({
      build_id: buildId,
    });
    const response = await fetch(
      `/api/set-active-build/?${queryParams.toString()}`,
      { method: "POST" }
    );
    alert("Active build set successfully");
  } catch (error) {
    alert("Failed to set active build");
    console.error("Internal Server Error:", error);
  }
}
