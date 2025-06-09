// Array of Filipino pop culture trivia
const filipinoTrivia = [
  "The term 'kilig' is a Filipino word that describes the feeling of romantic excitement, typically experienced when something romantic or heart-fluttering occurs. It's a unique emotion that doesn't have a direct translation in English.",
  "Jollibee, the Filipino fast-food chain, is more popular than McDonald's in the Philippines. Its Chickenjoy and Jolly Spaghetti are iconic Filipino comfort foods.",
  "The Philippines has the world's longest Christmas season, starting as early as September and ending in January. The tradition of 'Simbang Gabi' (Night Mass) is a nine-day series of masses leading up to Christmas.",
  "'Balikbayan' boxes, care packages sent by overseas Filipino workers to their families, have become a cultural phenomenon, often filled with goods from abroad.",
  "The 'jeepney' was originally made from U.S. military jeeps left over from World War II. Today, they're colorful symbols of Filipino ingenuity and public transportation.",
  "Karaoke is extremely popular in the Philippines, so much so that it's common to find karaoke machines in many Filipino homes. The country even has its own version called 'videoke'.",
  "The Philippines is home to the world's largest shoeshine stand, as recognized by the Guinness World Records, located in Manila.",
  "Filipino time' humorously refers to the cultural tendency of starting events 30 minutes to an hour later than the scheduled time.",
  "The 'boodle fight' is a communal way of eating where food is placed on banana leaves and eaten with bare hands, promoting camaraderie and equality among diners.",
  "The 'pamamanhikan' is a pre-wedding tradition where the groom's family visits the bride's family to formally ask for her hand in marriage, often bringing food and gifts.",
  "The 'tricycle' is a popular mode of transportation in the Philippines, consisting of a motorcycle with a sidecar, often colorfully decorated and personalized.",
  "Filipinos celebrate their 'monthsary' (monthly anniversary) in relationships, not just yearly anniversaries.",
  "The 'bayanihan' spirit refers to the Filipino value of communal unity and cooperation, famously illustrated by the image of neighbors carrying a bamboo house to a new location.",
  "The 'sari-sari' store is a ubiquitous neighborhood convenience store in the Philippines, often operated from the front of someone's home and selling items in small, affordable quantities.",
  "The 'pabitin' is a popular party game where children jump to grab hanging treats from a suspended bamboo frame, often seen at children's parties."
];

// Function to display a random trivia
function displayRandomTrivia() {
  const triviaContainer = document.getElementById('trivia-content');
  if (triviaContainer) {
    const randomIndex = Math.floor(Math.random() * filipinoTrivia.length);
    triviaContainer.innerHTML = `<p>${filipinoTrivia[randomIndex]}</p>`;
  }
}

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', displayRandomTrivia);

// Make the function available globally for potential manual refreshes
window.refreshTrivia = displayRandomTrivia;
