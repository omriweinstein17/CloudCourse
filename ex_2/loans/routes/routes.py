from flask import Blueprint
from .loans import loans_bp
from Flask_PyMongo import PyMongo

api_bp = Blueprint('api', __name__)
mongo = PyMongo()

api_bp.register_blueprint(loans_bp, url_prefix='/loans')