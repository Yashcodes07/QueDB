import json
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings


def explain_sql_error(original_question, failed_sql, error_message, schema_context="") -> dict:
    llm = ChatGroq(model=settings.GROQ_MODEL, temperature=0, groq_api_key=settings.GROQ_API_KEY)
    system = """You are a database expert. Explain the SQL error simply, provide corrected SQL, and give a tip.
Respond ONLY in this JSON format: {"explanation": "...", "fix": "...", "tip": "..."}"""
    user = f"Question: {original_question}\nFailed SQL: {failed_sql}\nError: {error_message}\nSchema: {schema_context}"
    try:
        response = llm.invoke([SystemMessage(content=system), HumanMessage(content=user)])
        content = response.content.strip().replace("```json", "").replace("```", "").strip()
        result = json.loads(content)
        result["success"] = True
        return result
    except Exception as e:
        return {"success": False, "explanation": str(e), "fix": "", "tip": ""}


def suggest_followup_questions(original_question, sql_result_summary, schema_context) -> list:
    llm = ChatGroq(model=settings.GROQ_MODEL, temperature=0.7, groq_api_key=settings.GROQ_API_KEY)
    prompt = f"""Suggest 3 follow-up questions for this database query.
Question: {original_question}
Result: {sql_result_summary}
Schema: {schema_context}
Return ONLY a JSON array of 3 strings."""
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(content)
    except Exception:
        return []