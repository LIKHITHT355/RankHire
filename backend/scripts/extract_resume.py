#!/usr/bin/env python3
"""Local resume text and skill extraction. It never sends a file to an API."""
import json
import re
import sys
from pathlib import Path

import pdfplumber
from docx import Document
import spacy

TECHNICAL_SKILLS = [
    "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#", "PHP", "Ruby", "Go",
    "SQL", "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask",
    "Spring Boot", "MongoDB", "MySQL", "PostgreSQL", "SQLite", "Redis", "Docker", "Kubernetes",
    "AWS", "Azure", "Google Cloud", "Git", "GitHub", "REST API", "GraphQL", "Machine Learning",
    "Data Analysis", "Pandas", "NumPy", "TensorFlow", "PyTorch", "Figma", "Linux",
]
SOFT_SKILLS = [
    "Communication", "Teamwork", "Leadership", "Problem Solving", "Critical Thinking", "Adaptability",
    "Time Management", "Collaboration", "Creativity", "Presentation", "Negotiation", "Attention to Detail",
    "Project Management", "Customer Service", "Decision Making", "Work Ethic",
]


def read_text(path):
    suffix = Path(path).suffix.lower()
    if suffix == ".pdf":
        with pdfplumber.open(path) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    if suffix == ".docx":
        document = Document(path)
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    raise ValueError("Only PDF and DOCX resumes are supported.")


def first_match(pattern, text, flags=0):
    match = re.search(pattern, text, flags)
    return match.group(0).strip() if match else ""


def personal_info(text):
    # Loading locally keeps named-entity recognition entirely on this machine.
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(text[:10000])
    people = [entity.text.strip() for entity in doc.ents if entity.label_ == "PERSON"]
    locations = [entity.text.strip() for entity in doc.ents if entity.label_ in {"GPE", "LOC"}]
    email = first_match(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", text, re.I)
    phone = first_match(r"(?<!\d)(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,5}[\s.-]\d{4}(?!\d)", text)
    return {
        "full_name": people[0] if people else "",
        "email": email,
        "phone": phone,
        "location": locations[0] if locations else "",
    }


def skills(text):
    found = []
    lower_text = text.lower()
    for category, words in (("technical", TECHNICAL_SKILLS), ("soft", SOFT_SKILLS)):
        for skill in words:
            if re.search(r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)", lower_text):
                count = len(re.findall(r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)", lower_text))
                found.append({"skill_name": skill, "skill_category": category, "confidence": min(0.95, 0.7 + count * 0.1)})
    return found


def main():
    text = read_text(sys.argv[1])
    print(json.dumps({"raw_text": text, "personal_info": personal_info(text), "skills": skills(text)}))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
