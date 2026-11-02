
from flask import Blueprint, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import Payslip, Salary


payslip_bp = Blueprint(
    "payslip",
    __name__,
    url_prefix="/api/payslips"
)


# Get employee payslip history
@payslip_bp.route("/history", methods=["GET"])
@jwt_required()
def payslip_history():

    employee_id = int(get_jwt_identity())

    records = Payslip.query.join(
        Salary,
        Payslip.salary_id == Salary.salary_id
    ).filter(
        Salary.employee_id == employee_id
    ).order_by(
        Salary.salary_year.desc(),
        Salary.salary_month.desc()
    ).all()

    payslip_list = []

    for record in records:

        payslip_list.append({
            "payslip_id": record.payslip_id,
            "salary_id": record.salary_id,
            "salary_month": record.salary.salary_month,
            "salary_year": record.salary.salary_year,
            "basic_salary": float(record.salary.basic_salary),
            "allowances": float(record.salary.allowances),
            "deductions": float(record.salary.deductions),
            "net_salary": float(record.salary.net_salary),
            "payment_status": record.salary.payment_status,
            "generated_at": record.generated_at.isoformat()
        })

    return jsonify({
        "status": "success",
        "payslips": payslip_list
    }), 200


# Get individual payslip details
@payslip_bp.route("/<int:payslip_id>", methods=["GET"])
@jwt_required()
def get_payslip(payslip_id):

    employee_id = int(get_jwt_identity())

    record = Payslip.query.join(
        Salary,
        Payslip.salary_id == Salary.salary_id
    ).filter(
        Payslip.payslip_id == payslip_id,
        Salary.employee_id == employee_id
    ).first()

    if not record:
        return jsonify({
            "status": "error",
            "message": "Payslip not found"
        }), 404

    return jsonify({
        "status": "success",
        "payslip": {
            "payslip_id": record.payslip_id,
            "salary_month": record.salary.salary_month,
            "salary_year": record.salary.salary_year,
            "basic_salary": float(record.salary.basic_salary),
            "allowances": float(record.salary.allowances),
            "deductions": float(record.salary.deductions),
            "net_salary": float(record.salary.net_salary),
            "payment_status": record.salary.payment_status,
            "generated_at": record.generated_at.isoformat()
        }
    }), 200


# Download payslip PDF
@payslip_bp.route("/<int:payslip_id>/download", methods=["GET"])
@jwt_required()
def download_payslip(payslip_id):

    employee_id = int(get_jwt_identity())

    record = Payslip.query.join(
        Salary,
        Payslip.salary_id == Salary.salary_id
    ).filter(
        Payslip.payslip_id == payslip_id,
        Salary.employee_id == employee_id
    ).first()

    if not record:
        return jsonify({
            "status": "error",
            "message": "Payslip not found"
        }), 404

    if not record.file_name:
        return jsonify({
            "status": "error",
            "message": "Payslip PDF has not been generated yet"
        }), 404

    import os
    from flask import current_app

    file_path = os.path.join(
        current_app.root_path,
        "static",
        "payslips",
        record.file_name
    )

    if not os.path.isfile(file_path):
        return jsonify({
            "status": "error",
            "message": "Payslip PDF file not found"
        }), 404

    return send_file(
        file_path,
        as_attachment=True,
        download_name=record.file_name,
        mimetype="application/pdf"
    )
