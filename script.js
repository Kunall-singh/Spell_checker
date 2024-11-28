// Load the dictionary file
let dictionary = [];

fetch('dictionary.txt')
  .then(response => response.text())
  .then(data => {
    dictionary = data.split('\n').map(word => word.trim());
  })
  .catch(error => console.error('Error loading dictionary:', error));

// Helper function to check if a character is a vowel
function isVowel(char) {
  return 'aeiou'.includes(char.toLowerCase());
}

// Dynamic Programming function to calculate alignment penalty
function calculatePenalty(word1, word2) {
  const n = word1.length;
  const m = word2.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  // Initialize base cases
  for (let i = 0; i <= n; i++) dp[i][0] = i * 2; // Gap penalties
  for (let j = 0; j <= m; j++) dp[0][j] = j * 2;

  // Fill the DP table
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // Match
      } else if (
        (isVowel(word1[i - 1]) && isVowel(word2[j - 1])) ||
        (!isVowel(word1[i - 1]) && !isVowel(word2[j - 1]))
      ) {
        dp[i][j] = dp[i - 1][j - 1] + 1; // Consonant/Consonant or Vowel/Vowel mismatch
      } else {
        dp[i][j] = dp[i - 1][j - 1] + 3; // Vowel/Consonant mismatch
      }
      dp[i][j] = Math.min(
        dp[i][j], // Substitution
        dp[i - 1][j] + 2, // Gap in word2
        dp[i][j - 1] + 2 // Gap in word1
      );
    }
  }
  return dp[n][m];
}

// Function to compute costs for all words in the dictionary
function computeCosts(userInput) {
  const wordCosts = {};
  dictionary.forEach(word => {
    wordCosts[word] = calculatePenalty(word, userInput);
  });
  return wordCosts;
}

// Function to get the top 10 suggestions
function getTopSuggestions(wordCosts) {
  return Object.entries(wordCosts)
    .sort((a, b) => a[1] - b[1]) // Sort by penalty
    .slice(0, 10) // Get top 10
    .map(entry => entry[0]); // Return only words
}

// Main function to handle user input and display suggestions
function findSuggestions() {
  const userInput = document.getElementById('userInput').value;
  if (!userInput.trim()) {
    alert('Please enter a word.');
    return;
  }
  const wordCosts = computeCosts(userInput);
  const suggestions = getTopSuggestions(wordCosts);
  const suggestionsList = document.getElementById('suggestions');
  suggestionsList.innerHTML = ''; // Clear previous suggestions
  suggestions.forEach(word => {
    const listItem = document.createElement('li');
    listItem.textContent = word;
    suggestionsList.appendChild(listItem);
  });
}
