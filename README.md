# ai-resume-backend
This repository contains the backend code for the final project using Django Rest Framework designed to to manage, query and manipulate data to meet given needs in a particular real-world domain. It enables resume storage, parsing, and retrieval while integrating seamlessly with an existing HTML, CSS and JavaScript resume matching system analyzing, skills and strengths.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [File Structure](#file-structure)
- [Future Improvements](#future-improvements)

## Features 
- Allows to upload and store resume Stores resumes with unique ids and according to skills Secure authentication and authorization.
- Secure and efficient database management BUILT With Backend: Django
- Frontend: React (TypeScript/JavaScript) Integration: Compatible with TypeScript/Express.js-based Authentication:
- Token-based authentication (JWT/ DRF Auth)
- Database: MySQL Storage: Local file System Install Prerequisites Django djangorestframework PyMySql Virtual Environment Backend Setup


## Technologies Used

- **Django**: Backend logic, routing, and manipulating data.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/peleisaac/ai-resume-backend.git
   ```

2. **Install Dependencies**:
   Make sure you have Django installed. You can set up a virtual environment and install dependencies as follows:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. **Run the Server**:
   Start the Flask development server.
   ```bash
   python manage.py runserver
   ```

4. **Apply the migrations**
   ```bash
   python manage.py migrate
   ```
4. **Open in Browser**:
   Go to `http://127.0.0.1:5000` in your web browser to start the game.

## File Structure

- **app.py**: Main Flask application file to initialize and run the server.
- **battleship_logic.py**: This file handles all the logic for the game.
- **requirement.txt**: This file contains all the dependancies used in the game.
- **test_battleship.py**: This file contains a unit test for the start_game route.
- **templates/**: Contains the HTML files, including the main game page.
  - `index.html`: The interface that contains the pop up to start the game as well as select the grid size for the game.
  - `game.html`: The main interface for the game.
  - `help.html`: The interface that explains the rules of the game.
- **images/**: Contains screenshots from the Game.
- **static/**: Holds all static files.
  - **css/**: Contains `styles.css` for custom styling.
  - **js/**: Contains `game.js` for JavaScript game logic.


## Future Improvements

- **Multiplayer Mode**: Allow two players to play against each other.
- **Difficulty Levels**: Add AI difficulty levels to make the game more challenging.
- **Animated Transitions**: Enhance the visual experience with smooth transitions between turns.
- **Score Tracking**: Implement a scoreboard to keep track of wins and losses across sessions.
- **Mobile Responsiveness**: Improve design for mobile-friendly gameplay.


