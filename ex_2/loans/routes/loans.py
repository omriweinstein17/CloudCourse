import requests
from flask import Blueprint, jsonify, request
from pymongo import MongoClient
import uuid
import re
import os

loans_bp = Blueprint('loans', __name__)

mongo_uri = os.getenv("MONGODB_URI", "mongodb+srv://galtrodel:fxeQJc8Kms8NncXa@cluster0.runjg3c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
client = MongoClient(mongo_uri)
db = client['myDB'] # Assuming the database name is 'myDB', check that out
loans_collection = db["loans"]

@loans_bp.route('/loans', methods=['POST'])
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
    base_url = "http://localhost:80/books"
    query = f"?q=isbn:{data['ISBN']}"
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
        # Store the loan in our data structure
        loans_collection.insert_one(loan)  
        return jsonify(loan), 201
    except:
        return jsonify({"error": "this is an error"}), 404

@loans_bp.route('/loans', methods=['GET'])
def get_loans():
     # all loans without the field _id
    loans = list(loans_collection.find({}, {'_id': 0})) 
    return jsonify(loans), 200

@loans_bp.route('/loans/<string:id>', methods=['GET'])
def get_loan(id):
    # Search for loan by loanID
    loan = loans_collection.find_one({'loanID': id}, {'_id': 0})  
    if loan:
        return jsonify(loan), 200
    else:
        return jsonify({'error': 'Loan not found'}), 404
    
@loans_bp.route('/loans/<string:id>', methods=['DELETE'])
def delete_loan(id):
    # Delete loan by loanID
    result = loans_collection.delete_one({'loanID': id})  
    if result.deleted_count > 0:
        return jsonify({'id': id}), 200
    else:
        return jsonify({'error': 'Loan not found'}), 404

def is_valid_date(date_string):
    # Regular expression to match the date format 'YYYY-MM-DD'
    pattern = r'^\d{4}-\d{2}-\d{2}$'
    if re.match(pattern, date_string):
        return True
    return False
    
















