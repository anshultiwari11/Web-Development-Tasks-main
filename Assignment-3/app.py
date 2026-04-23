from flask import Flask, render_template, request, session, redirect, url_for
import random

app = Flask(__name__)
app.secret_key = "quizmaster_secret_2024"

QUESTIONS = [
    {
        "id": 1,
        "question": "What does HTML stand for?",
        "options": [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language"
        ],
        "answer": "Hyper Text Markup Language",
        "explanation": "HTML stands for HyperText Markup Language, the standard language for creating web pages."
    },
    {
        "id": 2,
        "question": "Which CSS property is used to change the text color of an element?",
        "options": ["font-color", "text-color", "color", "foreground-color"],
        "answer": "color",
        "explanation": "The 'color' property in CSS is used to set the foreground text color of an element."
    },
    {
        "id": 3,
        "question": "Which HTTP method is typically used to submit form data to a server?",
        "options": ["GET", "POST", "PUT", "DELETE"],
        "answer": "POST",
        "explanation": "POST method sends form data in the request body, making it suitable for submitting sensitive or large data."
    },
    {
        "id": 4,
        "question": "What is Flask in Python?",
        "options": [
            "A database library",
            "A lightweight web framework",
            "A testing tool",
            "A CSS framework"
        ],
        "answer": "A lightweight web framework",
        "explanation": "Flask is a lightweight WSGI web application framework in Python, designed for easy and quick development."
    },
    {
        "id": 5,
        "question": "Which Python keyword is used to define a function?",
        "options": ["function", "define", "def", "func"],
        "answer": "def",
        "explanation": "In Python, the 'def' keyword is used to define a function followed by the function name and parentheses."
    },
    {
        "id": 6,
        "question": "What does CSS stand for?",
        "options": [
            "Creative Style Sheets",
            "Cascading Style Sheets",
            "Computer Style Syntax",
            "Colorful Stylesheet System"
        ],
        "answer": "Cascading Style Sheets",
        "explanation": "CSS stands for Cascading Style Sheets and is used to style and layout web pages."
    },
    {
        "id": 7,
        "question": "Which HTML tag is used to create a hyperlink?",
        "options": ["<link>", "<a>", "<href>", "<url>"],
        "answer": "<a>",
        "explanation": "The anchor tag is used to create hyperlinks in HTML, with the href attribute specifying the destination."
    },
    {
        "id": 8,
        "question": "In Flask, which decorator is used to define a route?",
        "options": ["@app.url()", "@app.route()", "@app.path()", "@flask.route()"],
        "answer": "@app.route()",
        "explanation": "The @app.route() decorator in Flask binds a URL pattern to a Python function (view function)."
    },
    {
        "id": 9,
        "question": "Which data type in Python stores key-value pairs?",
        "options": ["List", "Tuple", "Set", "Dictionary"],
        "answer": "Dictionary",
        "explanation": "A Python Dictionary (dict) stores data as key-value pairs and allows fast lookup by key."
    },
    {
        "id": 10,
        "question": "What is the correct way to comment in Python?",
        "options": ["// comment", "/* comment */", "# comment", "<!-- comment -->"],
        "answer": "# comment",
        "explanation": "In Python, single-line comments start with the # symbol."
    }
]


def get_feedback(score, total):
    percentage = (score / total) * 100
    if percentage == 100:
        return "Perfect Score! Outstanding!", "perfect"
    elif percentage >= 80:
        return "Excellent Work! You are a pro!", "excellent"
    elif percentage >= 60:
        return "Good Job! Keep it up!", "good"
    elif percentage >= 40:
        return "Not Bad! A little more practice needed.", "average"
    else:
        return "Keep Studying! You will do better next time!", "poor"


@app.route("/")
def index():
    session.clear()
    return render_template("index.html")


@app.route("/quiz", methods=["GET", "POST"])
def quiz():
    if request.method == "GET":
        shuffled = random.sample(QUESTIONS, 5)
        for q in shuffled:
            options = q["options"][:]
            random.shuffle(options)
            q["shuffled_options"] = options
        session["questions"] = shuffled
        return render_template("quiz.html", questions=shuffled, total=len(shuffled))

    elif request.method == "POST":
        questions = session.get("questions", [])
        score = 0
        negative_marks = 0
        results = []

        for q in questions:
            qid = str(q["id"])
            user_answer = request.form.get("q" + qid, None)
            correct = q["answer"]
            is_correct = (user_answer == correct)

            if is_correct:
                score += 1
            elif user_answer is not None:
                negative_marks += 0.25

            results.append({
                "question": q["question"],
                "user_answer": user_answer if user_answer else "Not Answered",
                "correct_answer": correct,
                "explanation": q["explanation"],
                "is_correct": is_correct,
                "skipped": user_answer is None
            })

        final_score = round(max(0, score - negative_marks), 2)
        total = len(questions)
        feedback_msg, feedback_class = get_feedback(score, total)

        session["results"] = results
        session["score"] = score
        session["final_score"] = final_score
        session["negative_marks"] = negative_marks
        session["total"] = total
        session["feedback"] = feedback_msg
        session["feedback_class"] = feedback_class

        return redirect(url_for("result"))


@app.route("/result")
def result():
    if "results" not in session:
        return redirect(url_for("index"))

    return render_template(
        "result.html",
        results=session["results"],
        score=session["score"],
        final_score=session["final_score"],
        negative_marks=session["negative_marks"],
        total=session["total"],
        feedback=session["feedback"],
        feedback_class=session["feedback_class"]
    )


@app.route("/restart")
def restart():
    session.clear()
    return redirect(url_for("quiz"))


if __name__ == "__main__":
    app.run(debug=True)
