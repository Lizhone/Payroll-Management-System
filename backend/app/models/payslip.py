
from datetime import datetime
from app.extensions import db


class Payslip(db.Model):

    __tablename__ = "payslips"

    payslip_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    salary_id = db.Column(
        db.Integer,
        db.ForeignKey("salary.salary_id"),
        nullable=False,
        unique=True
    )

    generated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    file_name = db.Column(
        db.String(255),
        nullable=True
    )

    salary = db.relationship(
        "Salary",
        backref=db.backref("payslip", uselist=False)
    )

    def __repr__(self):
        return f"<Payslip {self.payslip_id}>"
