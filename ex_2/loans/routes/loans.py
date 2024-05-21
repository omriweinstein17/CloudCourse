import requests
from flask import Blueprint, jsonify, request
import uuid
import re

api_bp = Blueprint('api', __name__)
# Sample data structure for storing loans
loans = {}

@api_bp.route('/loans', methods=['POST'])
def create_loan():
    # Check for correct content type
    if request.content_type != 'application/json':
        return jsonify({'error': 'Unsupported Media Type, expected application/json'}), 415
    # Get data from request
    data = request.get_json()
    # Check for required fields
    for field in ['memberName', 'ISBN', 'loanDate']:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 422
    # Check for correct date format
    if is_valid_date(data['loanDate']) == False:
        return jsonify({'error': 'Invalid date format'}), 422
    # Fetch data from our books API
    base_url = "http://localhost:8000/books"
    query = f"?q=isbn:{data.ISBN}"
    try:
        response = requests.get(base_url + query)
        response.raise_for_status()
        if response.status_code != 200:
            return jsonify({'error': 'unable to connect to external service'}), 500
        loan = {
            'memberName': data['memberName'],
            'ISBN': data['ISBN'],
            'loanDate': data['loanDate'],
            'title': response.json()['title'],
            'bookID': response.json()['id'],
            'loanID': uuid.uuid4()
        }
        loans[loan['bookID']] = loan
        return jsonify(loan), 201
    except:
        return jsonify({"error": "this is an error"}), 404

@api_bp.route('/loans', methods=['GET'])
def get_loans():
    return jsonify(list(loans.values())), 200

@api_bp.route('/loans/<string:id>', methods=['GET'])
def get_loan(id):
    return jsonify(loans[id]), 200
    
@api_bp.route('/loans/<string:id>', methods=['DELETE'])
def delete_loan(id):
    if id in loans:
        del loans[id]
        return jsonify({'id': id}), 200
    else:
        return jsonify({'error': 'Loan not found'}), 404

def is_valid_date(date_string):
    # Regular expression to match the date format 'YYYY-MM-DD'
    pattern = r'^\d{4}-\d{2}-\d{2}$'
    if re.match(pattern, date_string):
        return True
    return False
    
















