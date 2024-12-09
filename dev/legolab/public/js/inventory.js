// Add event listener for each favorite button and delete button
const toggleFavorite = async (partId, part_color) => {
  console.log("Toggling favorite for part", partId, part_color);
  try {
    const button = document.querySelector(
      `#inventory-item-${partId} .favorite-btn`
    );
    const isFavorite = button.getAttribute("data-favorite") === "true";
    const queryParams = new URLSearchParams({
      part_id: partId,
      part_color: part_color,
    });
    const response = await fetch(`/api/favorite?${queryParams}`, {
      method: isFavorite ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (data.success) {
      const newFavoriteStatus = !isFavorite;
      button.setAttribute("data-favorite", newFavoriteStatus);
      button.classList.toggle("favorite", newFavoriteStatus);
      button.querySelector(".favorite-text").textContent = newFavoriteStatus
        ? "Unfavorite"
        : "Favorite";
      alert("Part added to favorites!");
    } else {
      alert("Error adding part to favorites.");
    }
  } catch (error) {
    console.error("Error adding part to favorites:", error);
  }
};

const deleteInventoryItem = async (partId, part_color) => {
  console.log("Deleting part", partId);
  const queryParams = new URLSearchParams({
    part_id: partId,
    part_color: part_color,
  });
  try {
    const response = await fetch(`/api/delete/?${queryParams}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (data.success) {
      // Remove the part from the DOM
      const partElement = document.getElementById(`inventory-item-${partId}`);
      partElement.remove();
      alert("Part deleted successfully!");
    } else {
      alert("Error deleting part.");
    }
  } catch (error) {
    console.error("Error deleting part:", error);
  }
};
