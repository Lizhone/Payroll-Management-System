
import os
from dotenv import load_dotenv
from sqlalchemy.engine import URL

load_dotenv()


class Config:

    SECRET_KEY = os.getenv("SECRET_KEY", "development-secret-key")

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "development-jwt-secret-key"
    )

    connection_string = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=LAPTOP-C2KQL5SD\\SQLEXPRESS;"
        "DATABASE=EmployeePayrollDB;"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )

    SQLALCHEMY_DATABASE_URI = URL.create(
        "mssql+pyodbc",
        query={
            "odbc_connect": connection_string
        }
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
