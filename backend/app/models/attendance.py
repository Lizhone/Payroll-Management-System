
from datetime import date, datetime
from app.extensions import db


class Attendance(db.Model):

    __tablename__ = "attendance"

    attendance_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    employee_id = db.Column(
        db.Integer,
        db.ForeignKey("employees.employee_id"),
        nullable=False
    )

    attendance_date = db.Column(
        db.Date,
        nullable=False
    )

    check_in = db.Column(
        db.Time,
        nullable=True
    )

    check_out = db.Column(
        db.Time,
        nullable=True
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="Present"
    )

    remarks = db.Column(
        db.String(255),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    employee = db.relationship(
        "Employee",
        backref=db.backref("attendance_records", lazy=True)
    )

    __table_args__ = (
        db.UniqueConstraint(
            "employee_id",
            "attendance_date",
            name="uq_employee_attendance_date"
        ),
    )
