
from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models.employee import Employee


app = create_app()

with app.app_context():

    employee = Employee.query.filter_by(employee_id=1).first()

    if employee is None:
        print("Employee not found.")
    else:
        new_password = "Hermis@Payroll2026!"

        employee.password_hash = generate_password_hash(new_password)

        db.session.commit()

        print("Password updated successfully!")
        print("Employee: Hermis Smith")
        print("Employee ID: EMP001")
        print("Email: hermis.smith@example.com")
        print("Password: Updated securely.")
