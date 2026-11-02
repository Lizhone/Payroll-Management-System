
from datetime import datetime
from app.extensions import db


class PaymentQuery(db.Model):

    __tablename__ = "payment_queries"

    query_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    employee_id = db.Column(
        db.Integer,
        db.ForeignKey("employees.employee_id"),
        nullable=False
    )

    subject = db.Column(
        db.String(150),
        nullable=False
    )

    message = db.Column(
        db.Text,
        nullable=False
    )

    status = db.Column(
        db.String(20),
        default="Pending",
        nullable=False
    )

    response = db.Column(
        db.Text,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    employee = db.relationship(
        "Employee",
        backref=db.backref("payment_queries", lazy=True)
    )

    def __repr__(self):
        return f"<PaymentQuery {self.query_id}>"
