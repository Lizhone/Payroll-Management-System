from app.extensions import db
from datetime import datetime


class Employee(db.Model):

    __tablename__ = "employees"

    employee_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    employee_code = db.Column(
        db.String(20),
        unique=True,
        nullable=False
    )

    full_name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    phone = db.Column(
        db.String(15),
        nullable=True
    )

    department = db.Column(
        db.String(100),
        nullable=True
    )

    designation = db.Column(
        db.String(100),
        nullable=True
    )

    date_of_joining = db.Column(
        db.Date,
        nullable=False
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def __repr__(self):
        return f"<Employee {self.employee_code}>"