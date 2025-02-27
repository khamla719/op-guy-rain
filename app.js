// Main app initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing app...");
    // Initialize the app
    try {
        initializeApp();
        console.log("App initialized successfully");
    } catch (error) {
        console.error("Error during initialization:", error);
    }
});

function initializeApp() {
    // Set up event listeners
    const startBtn = document.getElementById('start-btn');
    console.log("Start button found:", startBtn);
    
    startBtn.addEventListener('click', function() {
        console.log("Start button clicked, starting questionnaire...");
        startQuestionnaire();
    });
    document.getElementById('prev-question-btn').addEventListener('click', showPrevQuestion);
    document.getElementById('next-question-btn').addEventListener('click', showNextQuestion);
    document.getElementById('roll-btn').addEventListener('click', rollDice);
    document.getElementById('roll-again-btn').addEventListener('click', resetToRollScreen);
    document.getElementById('like-btn').addEventListener('click', () => provideFeedback('like'));
    document.getElementById('dislike-btn').addEventListener('click', () => provideFeedback('dislike'));
    document.getElementById('view-prompt-btn').addEventListener('click', showPromptModal);
    
    // Set up modal close functionality
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closePromptModal);
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('prompt-modal');
        if (event.target === modal) {
            closePromptModal();
        }
    });

    // Load any saved user data
    loadUserData();
}

// Screen navigation
function showScreen(screenId) {
    try {
        console.log(`Attempting to show screen: ${screenId}`);
        
        // Check if the screen exists
        const targetScreen = document.getElementById(screenId);
        if (!targetScreen) {
            console.error(`Screen with ID '${screenId}' not found`);
            return;
        }
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            console.log(`Removed 'active' class from: ${screen.id}`);
        });
        
        // Show the specified screen
        targetScreen.classList.add('active');
        console.log(`Added 'active' class to: ${screenId}`);
    } catch (error) {
        console.error(`Error showing screen '${screenId}':`, error);
    }
}

// User data management
let userData = {
    answers: {},
    feedback: []
};

function loadUserData() {
    const savedData = localStorage.getItem('opGuyRainUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
}

function saveUserData() {
    localStorage.setItem('opGuyRainUserData', JSON.stringify(userData));
}

// Questionnaire functionality
const ikigaiQuestions = [
    {
        id: 'activities',
        text: 'What activities or hobbies make you lose track of time?',
        description: 'Describe moments when you felt deeply engaged and joyful.',
        type: 'text'
    },
    {
        id: 'strengths',
        text: 'What strengths or talents do you feel come naturally to you?',
        description: 'Share examples of skills you excel in effortlessly.',
        type: 'text'
    },
    {
        id: 'values',
        text: 'Which core values or principles guide your decisions in life?',
        description: 'Reflect on the beliefs that shape who you are.',
        type: 'text'
    },
    {
        id: 'challenges',
        text: 'What challenges or causes in the world resonate with you the most?',
        description: 'Explain why these issues feel important to address.',
        type: 'text'
    },
    {
        id: 'ideal_life',
        text: 'If you had no limitations, what would your ideal life or career look like?',
        description: 'Imagine a future where your passions, talents, and values merge seamlessly.',
        type: 'text'
    }
];

let currentQuestionIndex = 0;

function startQuestionnaire() {
    console.log("Starting questionnaire...");
    currentQuestionIndex = 0;
    console.log("Current question index reset to:", currentQuestionIndex);
    
    try {
        renderCurrentQuestion();
        console.log("First question rendered successfully");
    } catch (error) {
        console.error("Error rendering first question:", error);
    }
    
    showScreen('questionnaire-screen');
    console.log("Questionnaire screen shown");
}

function renderCurrentQuestion() {
    try {
        console.log("Rendering question at index:", currentQuestionIndex);
        const question = ikigaiQuestions[currentQuestionIndex];
        console.log("Current question:", question);
        
        const container = document.getElementById('question-container');
        console.log("Question container found:", container);
        
        let questionHTML = '';
        
        try {
            // All questions are now text input
            questionHTML = `
                <div class="question" data-id="${question.id}">
                    <p class="question-text">${question.text}</p>
                    <p class="question-description">${question.description}</p>
                    <textarea 
                        id="answer-${question.id}" 
                        placeholder="Your answer..."
                        rows="4"
                    >${userData.answers[question.id] || ''}</textarea>
                </div>
            `;
            
            // Calculate progress percentage
            const progressPercent = ((currentQuestionIndex + 1) / ikigaiQuestions.length) * 100;
            
            container.innerHTML = `
                ${questionHTML}
                <div class="question-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-labels">
                        <span>Question ${currentQuestionIndex + 1} of ${ikigaiQuestions.length}</span>
                        <span>${Math.round(progressPercent)}% complete</span>
                    </div>
                </div>
            `;
            console.log("Question HTML generated and inserted successfully");
        } catch (error) {
            console.error("Error generating question HTML:", error);
            container.innerHTML = `
                <div class="error-message">
                    <p>Sorry, there was an error rendering this question. Please try again.</p>
                    <p>${error.message}</p>
                </div>
            `;
        }

        // Update navigation buttons
        document.getElementById('prev-question-btn').disabled = currentQuestionIndex === 0;
        
        if (currentQuestionIndex === ikigaiQuestions.length - 1) {
            document.getElementById('next-question-btn').textContent = 'Finish';
        } else {
            document.getElementById('next-question-btn').textContent = 'Next';
        }
        
        console.log("Navigation buttons updated");
    } catch (error) {
        console.error("Error in renderCurrentQuestion:", error);
    }
}

function saveCurrentAnswer() {
    const question = ikigaiQuestions[currentQuestionIndex];
    
    if (question.type === 'checkbox') {
        // For checkbox questions, collect all checked values
        const checkboxes = document.querySelectorAll(`input[name="${question.id}"]:checked`);
        userData.answers[question.id] = Array.from(checkboxes).map(cb => cb.value);
    } else {
        // For text questions
        const answerTextarea = document.getElementById(`answer-${question.id}`);
        if (answerTextarea) {
            userData.answers[question.id] = answerTextarea.value.trim();
        }
    }
    
    saveUserData();
}

function showNextQuestion() {
    saveCurrentAnswer();
    
    if (currentQuestionIndex < ikigaiQuestions.length - 1) {
        currentQuestionIndex++;
        renderCurrentQuestion();
    } else {
        // Last question completed, move to dice screen
        showScreen('dice-screen');
    }
}

function showPrevQuestion() {
    saveCurrentAnswer();
    
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderCurrentQuestion();
    }
}

// Dice functionality
function rollDice() {
    const dice = document.getElementById('dice');
    const rollBtn = document.getElementById('roll-btn');
    
    // Disable the button during animation
    rollBtn.disabled = true;
    
    // Generate a random number between 1 and 6
    const randomNumber = Math.floor(Math.random() * 6) + 1;
    
    // Set random rotation for the dice
    const xRand = Math.floor(Math.random() * 5) + 1;
    const yRand = Math.floor(Math.random() * 5) + 1;
    
    // Update the dice face
    dice.querySelector('.dice-face').textContent = randomNumber;
    
    // Animate the dice rolling
    dice.style.transform = `rotateX(${xRand}turn) rotateY(${yRand}turn)`;
    
    // After animation completes, get AI suggestion
    setTimeout(() => {
        getAISuggestion(randomNumber);
        rollBtn.disabled = false;
    }, 1000);
}

// AI integration
let currentPrompt = '';  // Variable to store the current prompt

async function getAISuggestion(diceValue) {
    try {
        // Show loading state
        showScreen('result-screen');
        document.getElementById('suggestion-container').innerHTML = `
            <p>Generating your personalized suggestion...</p>
            <div class="loading-spinner"></div>
        `;
        
        // Prepare the prompt based on user's answers
        currentPrompt = prepareAIPrompt(diceValue);
        
        // Call our server API to get a suggestion from DeepSeek's chat model
        const response = await fetch('/api/generate-suggestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: currentPrompt }),
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        let suggestion = data.suggestion;
        
        // Parse the suggestion to extract parts (assuming markdown format)
        let activityText = suggestion;
        let reasonText = "";
        
        // Try to extract activity and reason based on our requested format
        const activityMatch = suggestion.match(/\*\*Activity:\*\*\s*(.*?)(?=\*\*Why|$)/is);
        const reasonMatch = suggestion.match(/\*\*Why this aligns with your values:\*\*\s*(.*?)$/is);
        
        if (activityMatch && activityMatch[1]) {
            activityText = activityMatch[1].trim();
        }
        
        if (reasonMatch && reasonMatch[1]) {
            reasonText = reasonMatch[1].trim();
        }
        
        // Generate a call to action header from the suggestion
        const callToAction = generateCallToAction(suggestion);
        
        // Update the result screen heading
        document.querySelector('#result-screen h2').textContent = callToAction;
        
        // Display the result in a more structured format
        document.getElementById('suggestion-container').innerHTML = `
            <div class="suggestion-card">
                <p class="suggestion-text">${activityText}</p>
                ${reasonText ? `<p class="suggestion-reason"><strong>Why:</strong> ${reasonText}</p>` : ''}
            </div>
        `;
    } catch (error) {
        console.error('Error getting AI suggestion:', error);
        document.getElementById('suggestion-container').innerHTML = `
            <p>Sorry, we couldn't generate a suggestion right now. Please try again.</p>
            <p class="error-message">${error.message}</p>
        `;
    }
}

function prepareAIPrompt(diceValue) {
    // Get the answers for each question
    const activities = userData.answers.activities || '';
    const strengths = userData.answers.strengths || '';
    const values = userData.answers.values || '';
    const challenges = userData.answers.challenges || '';
    const idealLife = userData.answers.ideal_life || '';
    
    let prompt = `Based on the following personal reflections, suggest ONE specific, actionable activity:
    
    PASSIONS & ENGAGEMENT:
    ${activities}
    
    NATURAL STRENGTHS & TALENTS:
    ${strengths}
    
    CORE VALUES & PRINCIPLES:
    ${values}
    
    CHALLENGES & CAUSES THAT MATTER:
    ${challenges}
    
    IDEAL FUTURE VISION:
    ${idealLife}
    
    REQUIREMENTS:
    1. Format your response like this: "**Activity:** [concise activity description that can be done immediately]" followed by "**Why this aligns with your values:** [brief reason]"
    2. The activity MUST be SPECIFIC and IMMEDIATELY ACTIONABLE - no vague suggestions
    3. Include a clear timeframe (e.g., "spend 20 minutes on...")
    4. Require NO special resources beyond what might be reasonably available
    5. Keep your explanation brief and focused (maximum 2-3 sentences)
    6. Make the activity distinctive and personalized based on their unique combination of values, strengths, and aspirations
    7. Be bold and specific - suggest something concrete that they can start within the next 5 minutes
    
    The dice roll was ${diceValue}, so add a small element of spontaneity to your suggestion based on this number (1-6).`;
    
    return prompt;
}

// Generate a call to action header from the suggestion
function generateCallToAction(suggestion) {
    // Try to extract the activity from the markdown format first
    const activityMatch = suggestion.match(/\*\*Activity:\*\*\s*(.*?)(?=\*\*Why|$)/is);
    
    if (activityMatch && activityMatch[1]) {
        // We found the activity in the expected format
        let activity = activityMatch[1].trim();
        
        // Extract just the core instruction (first sentence or before any explanation)
        if (activity.includes('.')) {
            activity = activity.split('.')[0].trim();
        }
        
        // Remove any markdown formatting
        activity = activity.replace(/\*\*/g, '').trim();
        
        // Extract timeframe if present
        const timeMatch = activity.match(/(\d+)\s*minutes/i);
        const hasTimeframe = timeMatch !== null;
        
        // Create action-oriented header
        let callToAction = "";
        
        // If it starts with a verb, capitalize it
        if (/^[a-z]+\s/.test(activity)) {
            const firstSpace = activity.indexOf(' ');
            if (firstSpace > 0) {
                const verb = activity.substring(0, firstSpace);
                const rest = activity.substring(firstSpace);
                callToAction = verb.charAt(0).toUpperCase() + verb.slice(1) + rest;
            } else {
                callToAction = activity;
            }
        } else {
            callToAction = activity;
        }
        
        // Keep it concise
        if (callToAction.length > 40) {
            const breakPoint = callToAction.lastIndexOf(' ', 37);
            callToAction = callToAction.substring(0, breakPoint > 0 ? breakPoint : 37) + '...';
        }
        
        // Add exclamation mark if not present
        if (!callToAction.endsWith('!')) {
            callToAction += '!';
        }
        
        return callToAction;
    }
    
    // Fallback to the old method if the new format isn't found
    const firstSentence = suggestion.split('.')[0];
    let callToAction = "";
    
    // Pattern matching to identify the core activity
    if (firstSentence.match(/write down three|list three|identify three|brainstorm/i)) {
        callToAction = "Brainstorm 3 Problems to Solve";
    } 
    else if (firstSentence.match(/set a timer for (\d+) minutes/i)) {
        const minutes = firstSentence.match(/set a timer for (\d+) minutes/i)[1];
        callToAction = `${minutes}-Minute Focus Session`;
    }
    else if (firstSentence.match(/research|find|look up|search for/i)) {
        callToAction = "Research Your Next Move";
    }
    else if (firstSentence.match(/read|check out|explore/i)) {
        callToAction = "Expand Your Knowledge";
    }
    else if (firstSentence.match(/message|text|contact|connect with|reach out/i)) {
        callToAction = "Make a Meaningful Connection";
    }
    else if (firstSentence.match(/clear your|organize|clean|prepare|plan/i)) {
        callToAction = "Create Space for Success";
    }
    else {
        // Extract just the action part (often the first 4-6 words are enough)
        callToAction = firstSentence
            .replace(/^(take|spend|set|open|grab|pick up|clear|right now|now)/i, '')
            .replace(/\s+(right now|now|just|simply)\s+/gi, ' ')
            .trim()
            .split(' ')
            .slice(0, 5)
            .join(' ');
            
        // Capitalize first letter
        callToAction = callToAction.charAt(0).toUpperCase() + callToAction.slice(1);
    }
    
    // Ensure it ends with an exclamation mark for emphasis
    if (!callToAction.endsWith('!')) {
        callToAction += '!';
    }
    
    // Keep it concise
    if (callToAction.length > 40) {
        const breakPoint = callToAction.lastIndexOf(' ', 37);
        callToAction = callToAction.substring(0, breakPoint > 0 ? breakPoint : 37) + '...';
    }
    
    return callToAction;
}

// Feedback functionality
function provideFeedback(type) {
    // Save the feedback
    userData.feedback.push({
        type: type,
        timestamp: new Date().toISOString(),
        suggestion: document.querySelector('.suggestion-text')?.textContent || ''
    });
    
    saveUserData();
    
    // Show feedback received message
    const feedbackButtons = document.querySelector('.feedback-buttons');
    feedbackButtons.innerHTML = '<p>Thanks for your feedback!</p>';
}

// Reset flow
function resetToRollScreen() {
    // Reset the result screen heading back to default for next time
    document.querySelector('#result-screen h2').textContent = "Your Suggestion";
    
    // Show the dice screen
    showScreen('dice-screen');
}

// Modal functionality for showing the prompt
function showPromptModal() {
    const modal = document.getElementById('prompt-modal');
    const promptText = document.getElementById('prompt-text');
    
    // Format the prompt with nice indentation
    promptText.textContent = currentPrompt;
    
    // Show the modal
    modal.style.display = 'block';
}

function closePromptModal() {
    const modal = document.getElementById('prompt-modal');
    modal.style.display = 'none';
} 