
from flask import Flask
from flask_cors import CORS

from config import Config
from app.extensions import db, migrate, jwt
from app import models
from app.routes.auth import auth_bp
from app.routes.attendance import attendance_bp
from app.routes.salary import salary_bp
from app.routes.payslip import payslip_bp
from app.routes.payment_query import payment_query_bp

def create_app():

    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Register authentication routes
    app.register_blueprint(auth_bp)

    # Register attendance routes
    app.register_blueprint(attendance_bp)

    # Register salary routes
    app.register_blueprint(salary_bp)
    app.register_blueprint(payslip_bp)
    app.register_blueprint(payment_query_bp)

    # Enable Angular frontend communication
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "http://localhost:4200"
            }
        }
    )

    # Database connection test
    @app.route("/api/health", methods=["GET"])
    def health_check():

        from sqlalchemy import text

        try:
            with db.engine.connect() as connection:

                result = connection.execute(
                    text("SELECT DB_NAME()")
                )

                database_name = result.scalar()

            return {
                "status": "success",
                "message": "Database connected successfully",
                "database": database_name
            }, 200

        except Exception:
            app.logger.exception("Database connection failed")

            return {
                "status": "error",
                "message": "Database connection failed"
            }, 500

    return app
