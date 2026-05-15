from langchain_groq import ChatGroq
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain.agents.agent_types import AgentType
from app.core.config import settings


def build_sql_database(connection_config: dict) -> SQLDatabase:
    db_type = connection_config.get("db_type", "").lower()
    if db_type in ("postgresql", "postgres"):
        url = (
            f"postgresql+psycopg2://"
            f"{connection_config['username']}"
            f"@{connection_config['host']}:{connection_config.get('port', 5432)}"
            f"/{connection_config['database']}"
        )
    elif db_type == "mysql":
        url = (
            f"mysql+pymysql://"
            f"{connection_config['username']}:{connection_config['password']}"
            f"@{connection_config['host']}:{connection_config.get('port', 3306)}"
            f"/{connection_config['database']}"
        )
    elif db_type == "sqlite":
        url = f"sqlite:///{connection_config['database']}"
    else:
        raise ValueError(f"Unsupported db_type: {db_type}")
    return SQLDatabase.from_uri(url)


def build_sql_agent(db: SQLDatabase):
    llm = ChatGroq(
        model=settings.GROQ_MODEL,
        temperature=0,
        groq_api_key=settings.GROQ_API_KEY,
    )
    agent = create_sql_agent(
        llm=llm,
        db=db,
        agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
        max_iterations=15,           # increased from 3
        max_execution_time=60,       # 60 second timeout
        handle_parsing_errors=True,
        early_stopping_method="generate",  # generates answer even if limit hit
    )
    return agent


def run_nl_query(agent, question: str) -> dict:
    try:
        response = agent.invoke({"input": question})
        answer = response.get("output", "")
        # If agent hit limit, try direct SQL approach
        if "iteration limit" in answer.lower() or "time limit" in answer.lower():
            return {
                "success": False,
                "question": question,
                "answer": None,
                "error": "Agent hit iteration limit — try a simpler question",
            }
        return {
            "success": True,
            "question": question,
            "answer": answer,
            "error": None,
        }
    except Exception as e:
        return {
            "success": False,
            "question": question,
            "answer": None,
            "error": str(e),
        }
