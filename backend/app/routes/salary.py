
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import Salary


salary_bp = Blueprint(
    "salary",
    __name__,
    url_prefix="/api/salary"
)


# Format salary record for API response
def format_salary(record):

    return {
        "salary_id": record.salary_id,
        "employee_id": record.employee_id,

        "salary_month": record.salary_month,
        "salary_year": record.salary_year,

        # Earnings
        "basic_salary": float(record.basic_salary or 0),
        "house_allowance": float(record.house_allowance or 0),
        "transport_allowance": float(record.transport_allowance or 0),
        "overtime": float(record.overtime or 0),

        "allowances": float(record.allowances or 0),
        "gross_salary": float(record.gross_salary or 0),

        # Deductions
        "income_tax": float(record.income_tax or 0),
        "provident_fund": float(record.provident_fund or 0),
        "insurance": float(record.insurance or 0),
        "other_deductions": float(record.other_deductions or 0),

        "deductions": float(record.deductions or 0),
        "total_deductions": float(record.total_deductions or 0),

        # Net salary
        "net_salary": float(record.net_salary or 0),

        # Payment information
        "payment_status": record.payment_status,

        "payment_date": (
            record.payment_date.isoformat()
            if record.payment_date else None
        ),

        "remarks": record.remarks
    }


# Get latest salary details
@salary_bp.route("/details", methods=["GET"])
@jwt_required()
def salary_details():

    employee_id = int(get_jwt_identity())

    record = Salary.query.filter_by(
        employee_id=employee_id
    ).order_by(
        Salary.salary_year.desc(),
        Salary.salary_month.desc()
    ).first()

    if not record:
        return jsonify({
            "status": "success",
            "message": "No salary records found",
            "salary": None
        }), 200

    return jsonify({
        "status": "success",
        "salary": format_salary(record)
    }), 200


# Get complete salary history
@salary_bp.route("/history", methods=["GET"])
@jwt_required()
def salary_history():

    employee_id = int(get_jwt_identity())

    records = Salary.query.filter_by(
        employee_id=employee_id
    ).order_by(
        Salary.salary_year.desc(),
        Salary.salary_month.desc()
    ).all()

    return jsonify({
        "status": "success",
        "salary_history": [
            format_salary(record)
            for record in records
        ]
    }), 200


# Get salary payment status
@salary_bp.route("/payment-status", methods=["GET"])
@jwt_required()
def payment_status():

    employee_id = int(get_jwt_identity())

    records = Salary.query.filter_by(
        employee_id=employee_id
    ).order_by(
        Salary.salary_year.desc(),
        Salary.salary_month.desc()
    ).all()

    payments = []

    for record in records:

        payments.append({
            "salary_id": record.salary_id,
            "salary_month": record.salary_month,
            "salary_year": record.salary_year,
            "net_salary": float(record.net_salary or 0),
            "payment_status": record.payment_status,

            "payment_date": (
                record.payment_date.isoformat()
                if record.payment_date else None
            )
        })

    return jsonify({
        "status": "success",
        "payments": payments
    }), 200
