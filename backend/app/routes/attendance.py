
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from datetime import datetime

from app.extensions import db
from app.models import Attendance, Employee


attendance_bp = Blueprint(
    "attendance",
    __name__,
    url_prefix="/api/attendance"
)


# Get employee attendance history
@attendance_bp.route("/history", methods=["GET"])
@jwt_required()
def attendance_history():

    employee_id = int(get_jwt_identity())

    records = Attendance.query.filter_by(
        employee_id=employee_id
    ).order_by(
        Attendance.attendance_date.desc()
    ).all()

    attendance_list = []

    for record in records:
        attendance_list.append({
            "attendance_id": record.attendance_id,
            "attendance_date": record.attendance_date.isoformat(),
            "check_in": record.check_in.strftime("%H:%M:%S") if record.check_in else None,
            "check_out": record.check_out.strftime("%H:%M:%S") if record.check_out else None,
            "status": record.status,
            "remarks": record.remarks
        })

    return jsonify({
        "status": "success",
        "attendance": attendance_list
    }), 200


# Get monthly attendance
@attendance_bp.route("/monthly", methods=["GET"])
@jwt_required()
def monthly_attendance():

    employee_id = int(get_jwt_identity())

    year = request.args.get("year", type=int)
    month = request.args.get("month", type=int)

    if not year or not month or month < 1 or month > 12:
        return jsonify({
            "status": "error",
            "message": "Please provide a valid year and month"
        }), 400

    records = Attendance.query.filter(
        Attendance.employee_id == employee_id,
        db.extract("year", Attendance.attendance_date) == year,
        db.extract("month", Attendance.attendance_date) == month
    ).order_by(
        Attendance.attendance_date.asc()
    ).all()

    attendance_list = []

    for record in records:
        attendance_list.append({
            "attendance_date": record.attendance_date.isoformat(),
            "check_in": record.check_in.strftime("%H:%M:%S") if record.check_in else None,
            "check_out": record.check_out.strftime("%H:%M:%S") if record.check_out else None,
            "status": record.status,
            "remarks": record.remarks
        })

    return jsonify({
        "status": "success",
        "year": year,
        "month": month,
        "attendance": attendance_list
    }), 200


# Get attendance summary
@attendance_bp.route("/summary", methods=["GET"])
@jwt_required()
def attendance_summary():

    employee_id = int(get_jwt_identity())

    results = db.session.query(
        Attendance.status,
        func.count(Attendance.attendance_id)
    ).filter_by(
        employee_id=employee_id
    ).group_by(
        Attendance.status
    ).all()

    summary = {
        "Present": 0,
        "Absent": 0,
        "Leave": 0
    }

    for status, count in results:
        summary[status] = count

    return jsonify({
        "status": "success",
        "summary": summary,
        "total_records": sum(summary.values())
    }), 200
