
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import PaymentQuery


payment_query_bp = Blueprint(
    "payment_query",
    __name__,
    url_prefix="/api/payment-queries"
)


# Submit a new payment query
@payment_query_bp.route("/", methods=["POST"])
@jwt_required()
def create_payment_query():

    employee_id = int(get_jwt_identity())

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request data is required"
        }), 400

    subject = data.get("subject", "").strip()
    message = data.get("message", "").strip()

    if not subject or not message:
        return jsonify({
            "status": "error",
            "message": "Subject and message are required"
        }), 400

    if len(subject) > 150:
        return jsonify({
            "status": "error",
            "message": "Subject cannot exceed 150 characters"
        }), 400

    query = PaymentQuery(
        employee_id=employee_id,
        subject=subject,
        message=message,
        status="Pending"
    )

    try:
        db.session.add(query)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Payment query submitted successfully",
            "query": {
                "query_id": query.query_id,
                "subject": query.subject,
                "message": query.message,
                "status": query.status,
                "created_at": query.created_at.isoformat()
            }
        }), 201

    except Exception:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to submit payment query"
        }), 500


# Get all queries submitted by logged-in employee
@payment_query_bp.route("/", methods=["GET"])
@jwt_required()
def get_payment_queries():

    employee_id = int(get_jwt_identity())

    queries = PaymentQuery.query.filter_by(
        employee_id=employee_id
    ).order_by(
        PaymentQuery.created_at.desc()
    ).all()

    query_list = []

    for query in queries:

        query_list.append({
            "query_id": query.query_id,
            "subject": query.subject,
            "message": query.message,
            "status": query.status,
            "response": query.response,
            "created_at": query.created_at.isoformat(),
            "updated_at": query.updated_at.isoformat()
        })

    return jsonify({
        "status": "success",
        "total_queries": len(query_list),
        "queries": query_list
    }), 200


# Get individual payment query
@payment_query_bp.route("/<int:query_id>", methods=["GET"])
@jwt_required()
def get_payment_query(query_id):

    employee_id = int(get_jwt_identity())

    query = PaymentQuery.query.filter_by(
        query_id=query_id,
        employee_id=employee_id
    ).first()

    if not query:
        return jsonify({
            "status": "error",
            "message": "Payment query not found"
        }), 404

    return jsonify({
        "status": "success",
        "query": {
            "query_id": query.query_id,
            "subject": query.subject,
            "message": query.message,
            "status": query.status,
            "response": query.response,
            "created_at": query.created_at.isoformat(),
            "updated_at": query.updated_at.isoformat()
        }
    }), 200
