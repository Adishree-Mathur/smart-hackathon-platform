from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_services import (
    suggest_teams,
    generate_project_ideas,
    provide_mentorship,
    evaluate_project,
    recommend_resources,
    review_code,
    match_participants,
    analyze_performance
)
import uuid

app = Flask(__name__)
CORS(app)

# Mock database
hackathons = {}
participants = {}
teams = {}
projects = {}

@app.route('/api/hackathon/create', methods=['POST'])
def create_hackathon():
    data = request.json
    hackathon_id = str(uuid.uuid4())
    hackathons[hackathon_id] = {
        'id': hackathon_id,
        'name': data['name'],
        'theme': data['theme'],
        'start_date': data['start_date'],
        'end_date': data['end_date'],
        'participants': [],
        'teams': [],
        'projects': []
    }
    return jsonify(hackathons[hackathon_id])

@app.route('/api/hackathon/<hackathon_id>/register', methods=['POST'])
def register_participant(hackathon_id):
    data = request.json
    participant_id = str(uuid.uuid4())
    participants[participant_id] = {
        'id': participant_id,
        'name': data['name'],
        'email': data['email'],
        'skills': data['skills'],
        'interests': data['interests'],
        'experience': data['experience']
    }
    hackathons[hackathon_id]['participants'].append(participant_id)
    return jsonify(participants[participant_id])

@app.route('/api/hackathon/<hackathon_id>/suggest-teams', methods=['GET'])
def get_team_suggestions(hackathon_id):
    participants_data = [participants[pid] for pid in hackathons[hackathon_id]['participants']]
    suggestions = suggest_teams(participants_data)
    return jsonify(suggestions)

@app.route('/api/hackathon/<hackathon_id>/generate-ideas', methods=['GET'])
def get_project_ideas(hackathon_id):
    theme = hackathons[hackathon_id]['theme']
    ideas = generate_project_ideas(theme)
    return jsonify(ideas)

@app.route('/api/mentor/ask', methods=['POST'])
def ask_mentor():
    question = request.json['question']
    response = provide_mentorship(question)
    return jsonify({'response': response})

@app.route('/api/project/evaluate', methods=['POST'])
def evaluate_project_submission():
    project = request.json
    evaluation = evaluate_project(project)
    return jsonify(evaluation)

@app.route('/api/resources/recommend', methods=['POST'])
def recommend_learning_resources():
    user_data = request.json
    resources = recommend_resources(user_data)
    return jsonify(resources)

@app.route('/api/code/review', methods=['POST'])
def review_code_submission():
    code = request.json['code']
    review = review_code(code)
    return jsonify(review)

@app.route('/api/match', methods=['POST'])
def match_participants_to_opportunities():
    user_data = request.json
    matches = match_participants(user_data)
    return jsonify(matches)

@app.route('/api/analytics/performance', methods=['POST'])
def get_performance_analytics():
    user_data = request.json
    analytics = analyze_performance(user_data)
    return jsonify(analytics)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)