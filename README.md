# SketchDetect AI

A modern web application that uses AI to detect and analyze hand-drawn sketches and mathematical expressions in real-time, powered by Google's Gemini AI.

## Features

- **Real-time Mathematical Expression Solving**: Draw mathematical expressions and get instant solutions
- **Interactive Drawing Canvas**: Smooth drawing experience with multiple brush options
- **Multiple Drawing Tools**:
  - Different brush types (Pencil, Pen, Brush, Marker)
  - Color palette selection
  - Adjustable brush size
  - Undo and clear canvas options
- **Auto-Solve Detection**: Automatically solves expressions when an equals sign is drawn
- **History Tracking**: Maintains a record of all calculations with timestamps
- **Multi-page Support**: Create and manage multiple pages of calculations
- **Modern UI**: Built with Chakra UI for a clean and responsive interface

## Tech Stack

- **Frontend**:
  - React.js
  - Vite
  - Chakra UI
  - react-canvas-draw
  - Axios

- **Backend**:
  - Node.js
  - Express
  - Google Generative AI (Gemini)

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository

2. Install frontend dependencies:
```bash
cd "sketch detector ai"
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Configure environment variables:
   - Create a `.env` file in the backend directory
   - Add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
# From the root directory
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Drawing Tools**:
   - Click the pencil icon to access drawing tools
   - Select brush type, color, and size
   - Use the eraser to clear mistakes
   - Undo button to remove last stroke

2. **Solving Expressions**:
   - Draw a mathematical expression on the canvas
   - Draw an equals sign (=) to trigger auto-solve
   - Or click the calculator button to solve manually

3. **Managing Pages**:
   - Click the '+' button to create a new page
   - Access calculation history from the history icon

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.