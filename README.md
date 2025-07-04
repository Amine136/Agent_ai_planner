# 🧠 AI Project Planner

A lightweight AI-powered project planning assistant with a **simple, friendly dashboard**.  
Built with **Python (FastAPI)** and **LangGraph**, this app takes a project description and generates a structured JSON task plan using **LLMs like Groq LLaMA-3.3**.

---

## 🚀 Features

- ✅ **AI Task Breakdown**  
  Generate a clean and structured task plan from any project description using a powerful LLM.

- ✏️ **Inline Editing**  
  Modify tasks and sections directly from the browser.

- ➕ **Add New Tasks**  
  Easily extend your plan with new sections and ideas.

- ❌ **Delete Unwanted Tasks**  
  Quickly remove irrelevant items from the AI-generated structure.

- 🌐 **Clean Web Dashboard**  
  Friendly, minimal HTML interface – just open `index.html`.

---

## 🛠️ Stack

- **Backend**: Python, FastAPI, LangGraph, LangChain-Groq  
- **Frontend**: HTML, JS, CSS (basic, no framework)  
- **Model**: Groq’s LLaMA-3.3-70B-Versatile

---

## 🧪 How to Run It Locally

### 1. Clone the Repository, Install Requirements & Run the Backend Server 

```bash
git clone https://github.com/Amine136/AI_planner.git
cd AI_planner
pip install -r requirements.txt
cd app
uvicorn main:app --reload --port 8000
```

### 2. Open the Frontend
Just open **index.html** in your browser.


##🔐 Environment Variables

Create a .env file with your Groq API key:

```bash
GROQ_API_KEY=your_groq_key_here
```

## 📦 Example Input

Paste a project description like:

```bash
Develop a web-based fitness tracking app. The app should allow users to log workouts, track progress over time, and set fitness goals. It should have user authentication, a dashboard displaying statistics, and integration with wearable devices. The backend should be built with a REST API and a database. The frontend should be responsive and user-friendly.
```


## 🤝 Contributions
Feedback are welcome!
Just keep it simple and focused on developer experience.


