# Op-Guy-Rain

Roll the dice on better decisions - a decision-making app with LLM guidance.

## Overview

Op-Guy-Rain is a web application that helps users make decisions aligned with their values by providing personalized suggestions using DeepSeek's chat model. The app guides users through a questionnaire with easy-to-answer questions to understand their values, then generates tailored suggestions for immediately actionable activities.

## Features

- Enhanced Ikigai-based questionnaire with low-cognitive-load questions
- Multiple question formats (checkboxes, short text answers) for easier responses
- Interactive dice-rolling experience
- AI-powered suggestions using DeepSeek's chat model
- Clean, modern UI with intuitive user experience

## Questionnaire Design

The questionnaire is designed to reduce cognitive load while still capturing a comprehensive view of user values:

- **Multiple Choice Questions**: Allow users to select options rather than generate answers from scratch
- **Simple Prompts**: Short, direct questions that require minimal reflection
- **Balanced Coverage**: Each area of Ikigai (passion, mission, vocation, profession) is explored through two different question types
- **Natural Language**: Questions use conversational language that feels personal and engaging

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- DeepSeek API key

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd op-guy-rain
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your DeepSeek API key:
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

### Running the Application

1. Start the server:
   ```
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3001
   ```

## How It Works

1. **Enhanced Questionnaire**: Users answer ten Ikigai-inspired questions through a mix of checkbox selections and short text responses.

2. **Roll the Dice**: A fun, interactive dice roll adds an element of randomness to the suggestion process.

3. **AI Suggestion**: Using the DeepSeek chat model, the app generates a personalized suggestion for an immediately actionable activity that aligns with the user's values.

4. **Feedback**: Users can provide feedback on suggestions, helping to improve future recommendations.

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- AI: DeepSeek chat model ('deepseek-chat')

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the concept of Ikigai and decision-making psychology
- Built with the help of DeepSeek's powerful language models

## Troubleshooting

If you encounter any issues with the application, try the following steps:

### "Get Started" Button Not Working

If clicking the "Get Started" button doesn't do anything:

1. Open your browser's developer console (F12 or right-click > Inspect > Console)
2. Check for any JavaScript errors that might be preventing execution
3. Reload the page and try again
4. Make sure you're using a modern browser (Chrome, Firefox, Edge, Safari)

### API Connection Issues

If you're seeing errors related to the DeepSeek API:

1. Verify your API key is correct in the `.env` file
2. Ensure the server is running (check for the "Server running on port 3001" message)
3. Check your network connection
4. Verify that your DeepSeek API key is valid and has sufficient quota

### General Troubleshooting

- Clear your browser cache and cookies
- Try incognito/private browsing mode
- Restart the server with `npm start`
- Check the console logs for detailed error messages 