# Web Development Tasks

A collection of web development experiments created by **Prem Kumar** as part of academic and personal learning. Each experiment explores different aspects of front-end and back-end web development.

---

## Repository Structure

```
Web-Development-Tasks/
├── Web Dev Experiment-1/      # Personal Portfolio Website
├── Web Dev Experiment-2/      # RouteMint – Smart Travel Planner
├── Wev Dev Experiment-3/      # Interactive Quiz App  (folder name has a typo)
└── Web Dev Experiment-4/      # To-Do List with Email Reminders
```

---

## Experiments

### Experiment 1 – Personal Portfolio Website

**Tech Stack:** HTML5 · CSS3 · JavaScript

A responsive personal portfolio website showcasing Prem Kumar's skills, projects, and contact information.

**Features:**
- Header with name and tagline
- Navigation bar with smooth scroll links
- Welcome, About, Skills, Projects, and Contact sections
- Interactive contact form with JavaScript validation
- Scroll-to-top button
- Skill cards for HTML5, CSS3, JavaScript, Java, Data Structures, and C/C++

**Files:**
| File | Description |
|------|-------------|
| `index.html` | Main page structure |
| `style.css` | Page styling and responsive layout |
| `script.js` | Interactive behaviour and form handling |

---

### Experiment 2 – RouteMint: Smart Travel Planner

**Tech Stack:** HTML5 · CSS3

A sleek, static landing page for **RouteMint**, a concept smart travel planning application.

**Features:**
- Hero section with background video
- About, Features, Services, Stats, and Testimonials sections
- FAQ section
- Contact form
- Call-to-action section

**Files:**
| File | Description |
|------|-------------|
| `index.html` | Complete page markup |
| `style.css` | Page styling and layout |

---

### Experiment 3 – Interactive Quiz App

**Tech Stack:** HTML5 · CSS3 · JavaScript

A browser-based interactive quiz application that tests general knowledge.

**Features:**
- Displays questions one at a time with multiple-choice options
- "Next" button to progress through the quiz
- Final score and performance message on completion
- "Restart Quiz" button to retake the quiz

**Files:**
| File | Description |
|------|-------------|
| `index.html` | Quiz page structure |
| `style.css` | Quiz styling |
| `script.js` | Quiz logic, question bank, and scoring |

---

### Experiment 4 – To-Do List with Email Reminders

**Tech Stack:** Node.js · Express · Resend API · HTML5 · CSS3 · JavaScript

A full-stack to-do list application with email reminder functionality powered by the [Resend](https://resend.com/) API.

**Features:**
- Add, edit, and delete tasks
- Email notifications sent on task creation via the Resend API
- Real-time UI updates
- REST API backend

**Project Structure:**
```
Web Dev Experiment-4/
├── server.js          # Express server entry point
├── package.json       # Project dependencies
├── routes/            # API route definitions
├── controllers/       # Request handler logic
├── models/            # Data models
└── public/            # Static front-end files
```

**Setup & Running:**

1. Navigate into the project directory:
   ```bash
   cd "Web Dev Experiment-4"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and add your Resend API key:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   ```
   Get a free API key at [https://resend.com/](https://resend.com/).

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## Author

**Prem Kumar**  
B.Tech CSE Student | Aspiring Web Developer  
📧 pkyt090@gmail.com  
📍 Delhi, India
