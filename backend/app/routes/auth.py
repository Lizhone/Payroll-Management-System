
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from datetime import datetime

from app.extensions import db
from app.models import Employee


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# Employee Registration
@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    required_fields = [
        "employee_code",
        "full_name",
        "email",
        "password",
        "date_of_joining"
    ]

    if not data or not all(data.get(field) for field in required_fields):
        return jsonify({
            "status": "error",
            "message": "All required fields must be provided"
        }), 400

    if len(data["password"]) < 8:
        return jsonify({
            "status": "error",
            "message": "Password must contain at least 8 characters"
        }), 400

    existing_employee = Employee.query.filter(
        (Employee.email == data["email"]) |
        (Employee.employee_code == data["employee_code"])
    ).first()

    if existing_employee:
        return jsonify({
            "status": "error",
            "message": "Employee email or employee code already exists"
        }), 409

    try:
        joining_date = datetime.strptime(
            data["date_of_joining"], "%Y-%m-%d"
        ).date()
    except ValueError:
        return jsonify({
            "status": "error",
            "message": "Date of joining must use YYYY-MM-DD format"
        }), 400

    employee = Employee(
        employee_code=data["employee_code"],
        full_name=data["full_name"],
        email=data["email"],
        phone=data.get("phone"),
        department=data.get("department"),
        designation=data.get("designation"),
        date_of_joining=joining_date,
        password_hash=generate_password_hash(data["password"])
    )

    db.session.add(employee)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Employee registered successfully",
        "employee_id": employee.employee_id
    }), 201


# Employee Login
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({
            "status": "error",
            "message": "Email and password are required"
        }), 400

    employee = Employee.query.filter_by(
        email=data["email"]
    ).first()

    if not employee or not check_password_hash(
        employee.password_hash,
        data["password"]
    ):
        return jsonify({
            "status": "error",
            "message": "Invalid email or password"
        }), 401

    if not employee.is_active:
        return jsonify({
            "status": "error",
            "message": "Your employee account is inactive"
        }), 403

    access_token = create_access_token(
        identity=str(employee.employee_id)
    )

    return jsonify({
        "status": "success",
        "message": "Login successful",
        "access_token": access_token,
        "employee": {
            "employee_id": employee.employee_id,
            "employee_code": employee.employee_code,
            "full_name": employee.full_name,
            "email": employee.email,
            "department": employee.department,
            "designation": employee.designation
        }
    }), 200
    
    
# Protected Employee Profile
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def employee_profile():

    employee_id = get_jwt_identity()

    employee = db.session.get(Employee, int(employee_id))

    if not employee:
        return jsonify({
            "status": "error",
            "message": "Employee not found"
        }), 404

    if not employee.is_active:
        return jsonify({
            "status": "error",
            "message": "Employee account is inactive"
        }), 403

    return jsonify({
        "status": "success",
        "employee": {
            "employee_id": employee.employee_id,
            "employee_code": employee.employee_code,
            "full_name": employee.full_name,
            "email": employee.email,
            "phone": employee.phone,
            "department": employee.department,
            "designation": employee.designation,
            "date_of_joining": employee.date_of_joining.isoformat(),
            "is_active": employee.is_active
        }
    }), 200

