import requests
from flask import Blueprint, jsonify, request
from flask_pymongo import PyMongo
import uuid
import re
import os

loans_bp = Blueprint('loans_bp', __name__)

mongo = PyMongo()


@loans_bp.route('/', methods=['POST'])
def create_loan():
    print("create_loan")
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
    base_url = "http://books-service:8001/books"
    isbn = data['ISBN']
    try:
        response = requests.get(base_url, params={'ISBN': isbn})
        response.raise_for_status()
        print(response.json())
        book = None
        if response.json():
            book = response.json()[0]
        print(book)
        if response.status_code == 404:
            return jsonify({'error': 'book not found'}), 404
        new_loan = {
            '_id': str(uuid.uuid4()),
            'memberName': data['memberName'],
            'ISBN': data['ISBN'],
            'loanDate': data['loanDate'],
            'title': book['title'],
            'bookID': book['id']
        }
        # Store the loan in our data structure
        mongo.db.loans.insert_one(new_loan) 
        return jsonify(new_loan), 201
    except requests.exceptions.RequestException as e:
        print(e)
        return jsonify({"error": "this is an error"}), 500

@loans_bp.route('/', methods=['GET'])
def get_loans():
    loans = list(mongo.db.loans.find())
    for loan in loans:
        loan['_id'] = str(loan['_id'])
    return jsonify(loans), 200

@loans_bp.route('/<string:id>', methods=['GET'])
def get_loan(id):
    # Search for loan by loanID
    loan =  mongo.db.loans.find_one({'_id': id})  
    if loan:
        loan['_id'] = str(loan['_id'])
        return jsonify(loan), 200
    else:
        return jsonify({'error': 'Loan not found'}), 404
    
@loans_bp.route('/<string:id>', methods=['DELETE'])
def delete_loan(id):
    # Delete loan by loanID
    result = mongo.db.loans.delete_one({'_id': id}) 
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