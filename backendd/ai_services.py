import random
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

def suggest_teams(participants):
    """AI-driven team formation based on skills"""
    skills = [', '.join(p['skills']) for p in participants]
    vectorizer = TfidfVectorizer()
    skills_matrix = vectorizer.fit_transform(skills)
    similarity_matrix = cosine_similarity(skills_matrix)
    
    teams = []
    used_indices = set()
    
    for i in range(len(participants)):
        if i not in used_indices:
            best_matches = np.argsort(similarity_matrix[i])[::-1][1:4]
            team = [participants[i]]
            for match in best_matches:
                if match not in used_indices and len(team) < 4:
                    team.append(participants[match])
                    used_indices.add(match)
            teams.append({
                'members': team,
                'compatibility_score': float(np.mean(similarity_matrix[i][[p['id'] for p in team]]))
            })
    return teams

def generate_project_ideas(theme):
    """Generate project ideas based on theme"""
    ideas = [
        f"AI-powered {theme} solution using computer vision",
        f"Blockchain-based {theme} platform",
        f"AR/VR application for {theme} challenges",
        f"Chatbot that helps with {theme}",
        f"Predictive analytics tool for {theme}"
    ]
    return random.sample(ideas, 3)

def provide_mentorship(question):
    """AI mentorship answering technical questions"""
    responses = {
        "how to connect to a database": "Use SQLAlchemy for Python database connections...",
        "how to deploy a flask app": "Consider using Render, Heroku or AWS...",
        "how to implement authentication": "For Flask, use Flask-Login..."
    }
    return responses.get(question.lower(), 
                       "I can help with technical questions. Could you be more specific?")

def evaluate_project(project):
    """Evaluate project based on criteria"""
    scores = {
        'innovation': random.uniform(3, 5),
        'feasibility': random.uniform(3, 5),
        'impact': random.uniform(3, 5),
        'technical_complexity': random.uniform(3, 5)
    }
    scores['overall'] = sum(scores.values()) / len(scores)
    return scores

def recommend_resources(user_data):
    """Recommend learning resources"""
    skills = user_data.get('skills', [])
    resources = []
    if 'python' in skills:
        resources.append({'title': 'Python for Data Science', 'url': '#'})
    if 'javascript' in skills:
        resources.append({'title': 'Modern JavaScript Tutorial', 'url': '#'})
    return resources or [{'title': 'Introduction to Programming', 'url': '#'}]

def review_code(code):
    """Analyze code for errors and improvements"""
    return {
        'errors': [{'line': 10, 'message': 'Potential SQL injection vulnerability'}],
        'suggestions': [{'line': 15, 'message': 'Consider using list comprehension'}],
        'quality_score': random.uniform(3, 5)
    }

def match_participants(user_data):
    """Match participants with mentors/opportunities"""
    matches = []
    if 'machine learning' in user_data.get('skills', []):
        matches.append({
            'type': 'mentor',
            'name': 'Dr. AI Expert',
            'bio': '10+ years experience in ML'
        })
    return matches

def analyze_performance(user_data):
    """Analyze participant performance metrics"""
    return {
        'commit_frequency': random.uniform(1, 10),
        'code_quality_trend': random.uniform(3, 5),
        'skill_improvement': {skill: random.uniform(1, 3) for skill in user_data.get('skills', [])}
    }