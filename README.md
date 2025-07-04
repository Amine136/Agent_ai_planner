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
```bash
