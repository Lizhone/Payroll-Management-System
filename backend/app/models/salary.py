
from datetime import datetime, timezone
from decimal import Decimal

from app.extensions import db


class Salary(db.Model):

    __tablename__ = "salary"

    salary_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    employee_id = db.Column(
        db.Integer,
        db.ForeignKey("employees.employee_id"),
        nullable=False
    )

    salary_month = db.Column(
        db.Integer,
        nullable=False
    )

    salary_year = db.Column(
        db.Integer,
        nullable=False
    )

    # Earnings

    basic_salary = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    house_allowance = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    transport_allowance = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    overtime = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    # Retained for compatibility with existing APIs
    allowances = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    gross_salary = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    # Deductions

    income_tax = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    provident_fund = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    insurance = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    other_deductions = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    # Retained for compatibility with existing APIs
    deductions = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    total_deductions = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    net_salary = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    # Payment information

    payment_status = db.Column(
        db.String(20),
        default="Pending",
        nullable=False
    )

    payment_date = db.Column(
        db.Date,
        nullable=True
    )

    remarks = db.Column(
        db.String(255),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    # Relationship

    employee = db.relationship(
        "Employee",
        backref=db.backref(
            "salary_records",
            lazy=True
        )
    )

    # Salary calculation

    def calculate_salary(self):

        def amount(value):
            return Decimal(str(value or 0))

        self.allowances = (
            amount(self.house_allowance)
            + amount(self.transport_allowance)
            + amount(self.overtime)
        )

        self.gross_salary = (
            amount(self.basic_salary)
            + self.allowances
        )

        self.total_deductions = (
            amount(self.income_tax)
            + amount(self.provident_fund)
            + amount(self.insurance)
            + amount(self.other_deductions)
        )

        self.deductions = self.total_deductions

        self.net_salary = (
            self.gross_salary
            - self.total_deductions
        )

        if self.net_salary < 0:
            raise ValueError(
                "Net salary cannot be negative."
            )

    # Convert salary record to JSON

    def to_dict(self):

        def number(value):
            return float(value or 0)

        return {
            "salary_id": self.salary_id,
            "employee_id": self.employee_id,
            "salary_month": self.salary_month,
            "salary_year": self.salary_year,

            "basic_salary": number(self.basic_salary),
            "house_allowance": number(self.house_allowance),
            "transport_allowance": number(self.transport_allowance),
            "overtime": number(self.overtime),
            "allowances": number(self.allowances),
            "gross_salary": number(self.gross_salary),

            "income_tax": number(self.income_tax),
            "provident_fund": number(self.provident_fund),
            "insurance": number(self.insurance),
            "other_deductions": number(self.other_deductions),
            "deductions": number(self.deductions),
            "total_deductions": number(self.total_deductions),

            "net_salary": number(self.net_salary),

            "payment_status": self.payment_status,
            "payment_date": (
                self.payment_date.isoformat()
                if self.payment_date else None
            ),
            "remarks": self.remarks,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at else None
            )
        }

    __table_args__ = (
        db.UniqueConstraint(
            "employee_id",
            "salary_month",
            "salary_year",
            name="uq_employee_salary_period"
        ),

        db.CheckConstraint(
            "salary_month >= 1 AND salary_month <= 12",
            name="ck_salary_valid_month"
        ),

        db.CheckConstraint(
            "basic_salary >= 0 AND allowances >= 0 AND deductions >= 0",
            name="ck_salary_nonnegative_amounts"
        ),

        db.CheckConstraint(
            "net_salary >= 0",
            name="ck_salary_nonnegative_net"
        )
    )
