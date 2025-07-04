# main.py

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langgraph.graph import StateGraph
from langchain_groq import ChatGroq
from typing_extensions import TypedDict
from typing import Annotated
import operator


# Load LLM
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),  
    model="llama-3.3-70b-versatile"
)


# Define the state schema using TypedDict
class GraphState(TypedDict):
    input: str
    task_tree: str

# Define input passthrough
def input_fn(state: GraphState) -> GraphState:
    return state

# Analyze project description
# Replace your analyze_fn with this updated version

def analyze_fn(state: GraphState) -> GraphState:
    description = state["input"]
    prompt = f"""
                You are a project planning assistant.

                Your task is to break down the following project into structured tasks.

                Project Description:
                {description}

                CRITICAL RULES:
                - You MUST return ONLY a valid JSON object.
                - Do NOT include any explanations, markdown, headings, or extra text — only the JSON.
                - The output will be passed directly to JSON.parse(). Any non-JSON content will break the system.

                JSON structure required:
                {{
                "sections": [
                    {{
                    "title": "string",
                    "description": "string",
                    "subsections": [
                        {{
                        "title": "string",
                        "description": "string"
                        }}
                    ]
                    }}
                ]
                }}

                STRICT formatting rules:
                - Use ONLY double quotes for all keys and values.
                - For any single quotes in text, use Unicode escape \\u0027 instead of \\\' 
                - Do NOT use backslash escapes like \\n, \\t, or \\\'
                - Return the entire JSON as a single line without line breaks.
                - Do NOT include markdown syntax or wrapping (like ```json).

                ✅ Example of correct escaping:
                "description": "This is the app\\u0027s main feature"

                ❌ NEVER use this:
                "description": "This is the app\\\'s main feature"

                Return only the JSON object. No explanations. No markdown. No line breaks.
                """

    response = llm.invoke(prompt)
    return {"task_tree": response.content}

# Build LangGraph
builder = StateGraph(GraphState)
builder.add_node("input_node", input_fn)
builder.add_node("analyze_node", analyze_fn)
builder.add_edge("input_node", "analyze_node")
builder.set_entry_point("input_node")
builder.set_finish_point("analyze_node")
graph = builder.compile()

# FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
def analyze_project(data: dict):
    result = graph.invoke({"input": data["description"]})
    print('------------------------------------------------------############--------------------------------')
    print(result)
    return result